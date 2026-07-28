import { NextRequest, NextResponse } from "next/server";
import { verifySessionFromCookies } from "@/lib/session";
import { deleteInvoice, updateInvoice } from "@/lib/invoices";
import { parseInvoicePayload } from "@/lib/invoice-validate";

export async function PATCH(
  req: NextRequest,
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
    const parsed = parseInvoicePayload(await req.json());
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const invoice = await updateInvoice(invoiceId, parsed.data);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("Update invoice error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(
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
    const deleted = await deleteInvoice(invoiceId);
    if (!deleted) {
      return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete invoice error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
