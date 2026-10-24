import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { AUDIT_COOKIE, PRIVATE_HEADERS } from "./config";
import { AuditError } from "./errors";
import { toCustomerAudit } from "./customer-report";
import type { AuditView } from "./types";

export function hashAuditCredential(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function getAuditOwner(create = false): Promise<string | null> {
  const store = await cookies();
  const previous = store.get(AUDIT_COOKIE)?.value;
  if (previous && /^[a-f0-9]{64}$/.test(previous)) return hashAuditCredential(previous);
  if (!create) return null;
  const token = randomBytes(32).toString("hex");
  store.set(AUDIT_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return hashAuditCredential(token);
}

export function requireSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  let originUrl: URL | null = null;
  try { if (origin) originUrl = new URL(origin); } catch { /* Invalid origins are rejected below. */ }
  const requestUrl = new URL(request.url);
  // Next can use its internal hostname in request.url (e.g. localhost while
  // the browser uses 127.0.0.1). Host is the browser's actual request authority.
  const host = request.headers.get("host")?.toLowerCase() ?? requestUrl.host;
  if (!originUrl || originUrl.host !== host || originUrl.protocol !== requestUrl.protocol || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new AuditError("Open this website in your browser and try again.", 403);
  }
}

export async function readAuditBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new AuditError("Send a JSON request.", 415);
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > 16000) throw new AuditError("The request is too large.", 413);
  if (!request.body) throw new AuditError("The request is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const result = await reader.read();
    if (result.done) break;
    length += result.value.length;
    if (length > 16000) { await reader.cancel(); throw new AuditError("The request is too large.", 413); }
    chunks.push(result.value);
  }
  try {
    return schema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
  } catch (error) {
    if (error instanceof ZodError) throw new AuditError(error.issues[0]?.message ?? "Check the submitted details.");
    throw new AuditError("The request could not be read. Check the submitted details.");
  }
}

export function auditJson(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: PRIVATE_HEADERS });
}

export function customerAuditJson(audit: AuditView, status = 200): NextResponse {
  return auditJson({ audit: toCustomerAudit(audit) }, status);
}

export function auditErrorResponse(error: unknown): NextResponse {
  if (error instanceof AuditError) return auditJson({ error: error.message }, error.status);
  // Log only a stable code; URLs, credentials and scraped content never enter logs.
  const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "unexpected";
  console.error("Website audit request failed:", code);
  return auditJson({ error: "Website analysis is temporarily unavailable. Please try again shortly." }, 503);
}
