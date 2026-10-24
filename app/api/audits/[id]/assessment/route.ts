import { updateOwnedAssessment } from "@/lib/website-audit/repository";
import { updateAssessmentSchema } from "@/lib/website-audit/validation";
import { auditJson, auditErrorResponse, getAuditOwner, readAuditBody, requireSameOrigin } from "@/lib/website-audit/http";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const data = await readAuditBody(request, updateAssessmentSchema);
    return auditJson({ audit: await updateOwnedAssessment((await params).id, await getAuditOwner(), data.revision, data.assessment) });
  } catch (error) { return auditErrorResponse(error); }
}
