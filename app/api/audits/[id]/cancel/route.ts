import { cancelOwnedAudit } from "@/lib/website-audit/repository";
import { auditJson, auditErrorResponse, getAuditOwner, requireSameOrigin } from "@/lib/website-audit/http";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    return auditJson({ audit: await cancelOwnedAudit((await params).id, await getAuditOwner()) });
  } catch (error) { return auditErrorResponse(error); }
}
