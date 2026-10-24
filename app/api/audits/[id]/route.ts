import { getOwnedAudit, deleteOwnedAudit } from "@/lib/website-audit/repository";
import { auditJson, customerAuditJson, auditErrorResponse, getAuditOwner, requireSameOrigin } from "@/lib/website-audit/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  try { return customerAuditJson(await getOwnedAudit((await params).id, await getAuditOwner())); }
  catch (error) { return auditErrorResponse(error); }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    requireSameOrigin(request);
    await deleteOwnedAudit((await params).id, await getAuditOwner());
    return auditJson({ ok: true });
  } catch (error) { return auditErrorResponse(error); }
}
