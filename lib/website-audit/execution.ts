import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { AuditError } from "./errors";
import { isAuditId } from "./validation";

type AuditExecutionConfig = { mode: "standalone" } | { mode: "netlify"; endpoint: string; secret: string };
const JOB_PATH = "/.netlify/functions/audit";
const HEALTH_PATH = "/.netlify/functions/audit-health";
const MAX_BODY_BYTES = 1024;
const SIGNATURE_WINDOW_MS = 10 * 60 * 1000;
const UNAVAILABLE = "Website analysis is temporarily unavailable. Please try again shortly.";

/** A configured endpoint is not a heartbeat: submissions also probe its authenticated readiness. */
export function getAuditExecutionConfig(): AuditExecutionConfig | null {
  const mode = process.env.AUDIT_EXECUTION_MODE?.trim() || "standalone";
  if (mode === "standalone") return { mode };
  if (mode !== "netlify") return null;
  const secret = process.env.AUDIT_WORKER_SECRET?.trim() ?? "";
  if (Buffer.byteLength(secret) < 32 || Buffer.byteLength(secret) > 256) return null;
  try {
    const endpoint = new URL(process.env.AUDIT_WORKER_URL?.trim() ?? "");
    // Only a dedicated Netlify worker can receive the server-held signing credential.
    if (endpoint.protocol !== "https:" || endpoint.port || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || endpoint.pathname !== JOB_PATH || !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.netlify\.app$/.test(endpoint.hostname)) return null;
    return { mode, endpoint: endpoint.href, secret };
  } catch { return null; }
}

function signedHeaders(secret: string, purpose: "audit-job" | "audit-health", body: string): HeadersInit {
  const timestamp = String(Date.now());
  return {
    "Content-Type": "application/json",
    "x-viviz-audit-timestamp": timestamp,
    "x-viviz-audit-signature": createHmac("sha256", secret).update(`${timestamp}.${purpose}.${body}`).digest("hex"),
  };
}

function validSignature(request: Request, purpose: "audit-job" | "audit-health", body: string): boolean {
  const config = getAuditExecutionConfig();
  if (config?.mode !== "netlify") return false;
  const timestamp = request.headers.get("x-viviz-audit-timestamp") ?? "";
  const signature = request.headers.get("x-viviz-audit-signature") ?? "";
  if (!/^\d{13}$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const age = Date.now() - Number(timestamp);
  // Allow small clock skew, and the provider's one-minute/two-minute retries.
  if (age < -60000 || age > SIGNATURE_WINDOW_MS) return false;
  const expected = createHmac("sha256", config.secret).update(`${timestamp}.${purpose}.${body}`).digest();
  return timingSafeEqual(Buffer.from(signature, "hex"), expected);
}

export function verifyAuditWorkerProbe(request: Request): boolean {
  return request.method === "GET" && validSignature(request, "audit-health", "");
}

export async function verifyAuditInvocation(request: Request): Promise<{ auditId: string } | null> {
  if (request.method !== "POST" || !request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return null;
  const declaredLength = request.headers.get("content-length");
  if (declaredLength && (!/^\d+$/.test(declaredLength) || Number(declaredLength) > MAX_BODY_BYTES)) return null;
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      length += next.value.byteLength;
      if (length > MAX_BODY_BYTES) { await reader.cancel(); return null; }
      chunks.push(next.value);
    }
    const body = Buffer.concat(chunks).toString("utf8");
    if (!validSignature(request, "audit-job", body)) return null;
    const input: unknown = JSON.parse(body);
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).length !== 1 || !("auditId" in input) || typeof input.auditId !== "string" || !isAuditId(input.auditId)) return null;
    return { auditId: input.auditId };
  } catch { return null; }
  finally { reader.releaseLock(); }
}

export async function checkAuditWorkerConnection(fetcher: typeof fetch = fetch): Promise<{ ready: boolean; code: string }> {
  const config = getAuditExecutionConfig();
  if (!config) return { ready: false, code: "worker_configuration_invalid" };
  if (config.mode === "standalone") return { ready: true, code: "standalone" };
  try {
    const response = await fetcher(new URL(HEALTH_PATH, config.endpoint), {
      method: "GET", headers: signedHeaders(config.secret, "audit-health", ""),
      signal: AbortSignal.timeout(5000), redirect: "error", cache: "no-store",
    });
    if (!response.ok) return { ready: false, code: "worker_unavailable" };
    // The private worker endpoint returns only a small readiness object.
    const text = await response.text();
    if (text.length > 1024) return { ready: false, code: "worker_unavailable" };
    const result: unknown = JSON.parse(text);
    return result && typeof result === "object" && "ready" in result && result.ready === true && "code" in result && result.code === "ready"
      ? { ready: true, code: "ready" } : { ready: false, code: "worker_not_ready" };
  } catch { return { ready: false, code: "worker_unavailable" }; }
}

export async function requireAuditWorkerConnection(): Promise<void> {
  if (process.env.AUDIT_ENABLED === "false" || !(await checkAuditWorkerConnection()).ready) throw new AuditError(UNAVAILABLE, 503);
}

export async function dispatchAuditJob(auditId: string, fetcher: typeof fetch = fetch): Promise<void> {
  const config = getAuditExecutionConfig();
  if (!config || !isAuditId(auditId)) throw new AuditError(UNAVAILABLE, 503);
  if (config.mode === "standalone") return;
  const body = JSON.stringify({ auditId });
  try {
    const response = await fetcher(config.endpoint, {
      method: "POST", headers: signedHeaders(config.secret, "audit-job", body), body,
      signal: AbortSignal.timeout(5000), redirect: "error", cache: "no-store",
    });
    await response.body?.cancel();
    if (response.status !== 202) throw new Error("worker_delivery_failed");
  } catch { throw new AuditError(UNAVAILABLE, 503); }
}
