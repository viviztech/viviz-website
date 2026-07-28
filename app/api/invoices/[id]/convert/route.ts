import { NextRequest, NextResponse } from "next/server";
import { verifySessionFromCookies } from "@/lib/session";
import { convertProformaToInvoice } from "@/lib/invoices";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifySessionFromCookies())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const invoiceId = Number(id);
  if (!Number.isInteger(invoiceId)) {
    return NextResponse.json({ error: "Invalid invoice id." }, { status: 400 });
  }

  try {
    const result = await convertProformaToInvoice(invoiceId);
    if ("error" in result) {
      const status = result.error === "Proforma not found." ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ invoice: result.invoice });
  } catch (err) {
    console.error("Convert proforma error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
