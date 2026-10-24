import { submitOwnedEnquiry } from "@/lib/website-audit/repository";
import { enquirySchema } from "@/lib/website-audit/validation";
import { auditJson, auditErrorResponse, getAuditOwner, readAuditBody, requireSameOrigin } from "@/lib/website-audit/http";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const data = await readAuditBody(request, enquirySchema);
    const enquiryId = await submitOwnedEnquiry((await params).id, await getAuditOwner(), data);
    return auditJson({ ok: true, enquiryId }, 201);
  } catch (error) { return auditErrorResponse(error); }
}
