import { NextRequest, NextResponse } from "next/server";
import { verifySessionFromCookies } from "@/lib/session";
import { createInvoice, listInvoices } from "@/lib/invoices";
import { parseInvoicePayload } from "@/lib/invoice-validate";

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
    const parsed = parseInvoicePayload(await req.json());
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const invoice = await createInvoice(parsed.data);
    return NextResponse.json({ invoice });
  } catch (err) {
    console.error("Create invoice error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
