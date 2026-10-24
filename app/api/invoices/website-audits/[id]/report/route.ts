import { renderToBuffer } from "@react-pdf/renderer";
import { getStaffAudit } from "@/lib/website-audit/staff";
import { TechnicalAuditPdfDocument } from "@/lib/website-audit/technical-pdf";
import { AuditError } from "@/lib/website-audit/errors";
import { auditErrorResponse } from "@/lib/website-audit/http";
import { PRIVATE_HEADERS } from "@/lib/website-audit/config";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const audit = await getStaffAudit(id);
    if (!audit.report || !["complete", "partial"].includes(audit.status)) throw new AuditError("This technical report is not ready to download yet.", 409);
    const buffer = await renderToBuffer(TechnicalAuditPdfDocument({ audit }));
    // Rendering can take time; recheck staff access, retention and revision.
    const current = await getStaffAudit(id);
    if (current.revision !== audit.revision) throw new AuditError("This report has changed. Refresh it before downloading.", 409);
    return new Response(new Uint8Array(buffer), { headers: {
      ...PRIVATE_HEADERS,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="viviz-technical-audit-${audit.id}.pdf"`,
    } });
  } catch (error) { return auditErrorResponse(error); }
}
