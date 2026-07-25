import { NextRequest, NextResponse } from "next/server";
import { verifySessionFromCookies } from "@/lib/session";
import { createInvoice, listInvoices, type InvoiceLineItem } from "@/lib/invoices";

export async function GET() {
  if (!(await verifySessionFromCookies())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const invoices = await listInvoices();
    return NextResponse.json({ invoices });
  } catch (err) {
    console.error("List invoices error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifySessionFromCookies())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      clientName,
      clientAddress,
      clientGstin,
      clientStateCode,
      invoiceDate,
      dueDate,
      lineItems,
      gstRate,
      notes,
    } = body;

    if (
      !clientName ||
      !clientAddress ||
      !clientStateCode ||
      !invoiceDate ||
      typeof gstRate !== "number" ||
      !Array.isArray(lineItems) ||
      lineItems.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required invoice fields." },
        { status: 400 }
      );
    }

    const validLineItems: InvoiceLineItem[] = lineItems.map((item) => ({
      description: String(item.description ?? ""),
      hsnSac: item.hsnSac ? String(item.hsnSac) : undefined,
      quantity: Number(item.quantity),
      rate: Number(item.rate),
    }));

    if (
      validLineItems.some(
        (item) => !item.description || !Number.isFinite(item.quantity) || !Number.isFinite(item.rate)
      )
    ) {
      return NextResponse.json({ error: "Invalid line item data." }, { status: 400 });
    }

    const invoice = await createInvoice({
      clientName,
      clientAddress,
      clientGstin: clientGstin || null,
      clientStateCode,
      invoiceDate,
      dueDate: dueDate || null,
      lineItems: validLineItems,
      gstRate,
      notes: notes || null,
    });

    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("Create invoice error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
