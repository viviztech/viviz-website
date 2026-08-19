import { NextRequest, NextResponse } from "next/server";
import { buildPaymentRedirect, generateClientTxnId } from "@/lib/sabpaisa";
import { createPayment } from "@/lib/payments";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payerName = String(body?.payerName ?? "").trim();
    const payerEmail = String(body?.payerEmail ?? "").trim();
    const payerMobile = String(body?.payerMobile ?? "").trim();
    const amount = Number(body?.amount);

    if (!payerName) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!EMAIL_RE.test(payerEmail)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!MOBILE_RE.test(payerMobile)) {
      return NextResponse.json({ error: "A valid 10-digit mobile number is required." }, { status: 400 });
    }
    if (!Number.isFinite(amount) || amount < 1 || amount > 1_000_000) {
      return NextResponse.json({ error: "Enter an amount between ₹1 and ₹10,00,000." }, { status: 400 });
    }

    const clientTxnId = generateClientTxnId();
    await createPayment({ clientTxnId, amount, payerName, payerEmail, payerMobile });

    const redirect = await buildPaymentRedirect({
      clientTxnId,
      amount,
      payerName,
      payerEmail,
      payerMobile,
    });

    return NextResponse.json(redirect);
  } catch (err) {
    console.error("Initiate payment error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
