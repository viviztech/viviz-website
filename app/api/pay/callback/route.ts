import { NextRequest, NextResponse } from "next/server";
import { parsePaymentResponse } from "@/lib/sabpaisa";
import { applyPaymentResponse } from "@/lib/payments";

// PG 3.0 redirects here with signed transaction fields. Accept GET query
// parameters and POSTed form/JSON payloads, then verify them server-side.
async function handleCallback(req: NextRequest): Promise<NextResponse> {
  const params = new URLSearchParams(req.nextUrl.searchParams);

  if (req.method === "POST") {
    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("form")) {
      const form = await req.formData();
      for (const [key, value] of form.entries()) params.set(key, value.toString());
    } else {
      const body = await req.json().catch(() => null);
      if (body && typeof body === "object") {
        for (const [key, value] of Object.entries(body)) {
          if (value != null) params.set(key, String(value));
        }
      }
    }
  }

  const resultUrl = new URL("/pay/result", req.nextUrl.origin);

  if (!params.get("signature")) {
    resultUrl.searchParams.set("error", "missing_response");
    return NextResponse.redirect(resultUrl, { status: 303 });
  }

  try {
    const response = parsePaymentResponse(params);
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
