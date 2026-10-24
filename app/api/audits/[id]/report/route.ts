import { renderToBuffer } from "@react-pdf/renderer";
import { getOwnedAudit } from "@/lib/website-audit/repository";
import { getAuditOwner, auditErrorResponse } from "@/lib/website-audit/http";
import { AuditError } from "@/lib/website-audit/errors";
import { PRIVATE_HEADERS } from "@/lib/website-audit/config";
import { AuditPdfDocument } from "@/lib/website-audit/pdf";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const audit = await getOwnedAudit((await params).id, await getAuditOwner());
    if (!audit.report) throw new AuditError("The report is not ready to download yet.", 409);
    const buffer = await renderToBuffer(AuditPdfDocument({ audit }));
    return new Response(new Uint8Array(buffer), { headers: {
      ...PRIVATE_HEADERS, "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="viviz-website-audit-${audit.id}.pdf"`,
    } });
  } catch (error) { return auditErrorResponse(error); }
}
