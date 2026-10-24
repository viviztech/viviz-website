import { renderToBuffer } from "@react-pdf/renderer";
import { getOwnedAudit, recordOwnedReportDownload } from "@/lib/website-audit/repository";
import { getAuditOwner, auditErrorResponse, auditJson, readAuditBody, requireSameOrigin } from "@/lib/website-audit/http";
import { AuditError } from "@/lib/website-audit/errors";
import { reportDownloadSchema } from "@/lib/website-audit/validation";
import { PRIVATE_HEADERS } from "@/lib/website-audit/config";
import { AuditPdfDocument } from "@/lib/website-audit/pdf";

export const runtime = "nodejs";
export const maxDuration = 30;

export function GET() {
  const response = auditJson({ error: "Enter your name and email in the report download form to download the PDF." }, 405);
  response.headers.set("Allow", "POST");
  return response;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireSameOrigin(request);
    const details = await readAuditBody(request, reportDownloadSchema);
    const owner = await getAuditOwner();
    const { id } = await params;
    const audit = await recordOwnedReportDownload(id, owner, details);
    const buffer = await renderToBuffer(AuditPdfDocument({ audit }));
    // Do not release a stale or deleted report after PDF rendering completed.
    const current = await getOwnedAudit(id, owner);
    if (current.revision !== audit.revision) throw new AuditError("This report has changed. Review the latest report before downloading.", 409);
    return new Response(new Uint8Array(buffer), { headers: {
      ...PRIVATE_HEADERS, "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="viviz-website-audit-${audit.id}.pdf"`,
    } });
  } catch (error) { return auditErrorResponse(error); }
}
