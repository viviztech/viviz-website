import { decideOwnedRecommendation } from "@/lib/website-audit/repository";
import { decisionSchema } from "@/lib/website-audit/validation";
import { customerAuditJson, auditErrorResponse, getAuditOwner, readAuditBody, requireSameOrigin } from "@/lib/website-audit/http";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; recommendationId: string }> }) {
  try {
    requireSameOrigin(request);
    const data = await readAuditBody(request, decisionSchema);
    const { id, recommendationId } = await params;
    return customerAuditJson(await decideOwnedRecommendation(id, await getAuditOwner(), data.revision, recommendationId, data.decision));
  } catch (error) { return auditErrorResponse(error); }
}
