import { NextRequest, NextResponse } from "next/server";
import { parsePaymentResponse } from "@/lib/sabpaisa";
import { applyPaymentResponse } from "@/lib/payments";

// SabPaisa redirects the payer's browser here after checkout, appending an
// encrypted `encResponse` param. Some integrations deliver it as a GET query
// param (browser redirect), others as a POSTed form body -- handle both.
async function handleCallback(req: NextRequest): Promise<NextResponse> {
  let encResponse = req.nextUrl.searchParams.get("encResponse");

  if (!encResponse && req.method === "POST") {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("form")) {
      const form = await req.formData();
      encResponse = form.get("encResponse")?.toString() ?? null;
    } else {
      const body = await req.json().catch(() => null);
      encResponse = body?.encResponse ?? null;
    }
  }

  const resultUrl = new URL("/pay/result", req.nextUrl.origin);

  if (!encResponse) {
    resultUrl.searchParams.set("error", "missing_response");
    return NextResponse.redirect(resultUrl, { status: 303 });
  }

  try {
    const response = await parsePaymentResponse(encResponse);
    const payment = await applyPaymentResponse(response);

    if (!payment) {
      resultUrl.searchParams.set("error", "unknown_transaction");
      return NextResponse.redirect(resultUrl, { status: 303 });
    }

    resultUrl.searchParams.set("txn", payment.clientTxnId);
    return NextResponse.redirect(resultUrl, { status: 303 });
  } catch (err) {
    console.error("SabPaisa callback error:", err);
    resultUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(resultUrl, { status: 303 });
  }
}

export async function GET(req: NextRequest) {
  return handleCallback(req);
}

export async function POST(req: NextRequest) {
  return handleCallback(req);
}
