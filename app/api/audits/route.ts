import { createQueuedAudit } from "@/lib/website-audit/repository";
import { normalizeAuditUrl, validatePublicUrl } from "@/lib/website-audit/network";
import { createAuditSchema } from "@/lib/website-audit/validation";
import { customerAuditJson, auditErrorResponse, getAuditOwner, hashAuditCredential, readAuditBody, requireSameOrigin } from "@/lib/website-audit/http";
import { AuditError } from "@/lib/website-audit/errors";
import { dispatchAuditJob, requireAuditWorkerConnection } from "@/lib/website-audit/execution";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    const data = await readAuditBody(request, createAuditSchema);
    let url: string;
    try { url = normalizeAuditUrl(data.url); await validatePublicUrl(url); }
    catch { throw new AuditError("Enter a public HTTP or HTTPS website. Private, local and restricted addresses cannot be assessed."); }
    const owner = (await getAuditOwner(true))!;
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "not-provided";
    const ipHash = hashAuditCredential(`audit-rate:${forwarded}`);
    await requireAuditWorkerConnection();
    const audit = await createQueuedAudit({ url, owner, ipHash, idempotencyKey: data.idempotencyKey, assessment: data.assessment });
    if (["queued", "running"].includes(audit.status)) await dispatchAuditJob(audit.id);
    return customerAuditJson(audit, 202);
  } catch (error) { return auditErrorResponse(error); }
}
