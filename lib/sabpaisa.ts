import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { BASE_URL } from "@/lib/config";

interface SabPaisaConfig {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  env: "uat" | "stag" | "prod";
}

function getConfig(): SabPaisaConfig {
  const merchantId = process.env.SABPAISA_MERCHANT_ID ?? process.env.SABPAISA_CLIENT_CODE;
  const apiKey = process.env.SABPAISA_API_KEY ?? process.env.SABPAISA_AUTH_KEY;
  const secretKey = process.env.SABPAISA_SECRET_KEY ?? process.env.SABPAISA_AUTH_IV;
  const env = (process.env.SABPAISA_ENV || "uat") as SabPaisaConfig["env"];

  if (!merchantId || !apiKey || !secretKey) {
    throw new Error("SabPaisa is not configured: set the merchant ID, API key, and secret key.");
  }
  if (env !== "uat" && env !== "stag" && env !== "prod") {
    throw new Error("SABPAISA_ENV must be one of: uat, stag, prod.");
  }
  return { merchantId, apiKey, secretKey, env };
}

const API_URLS: Record<SabPaisaConfig["env"], string> = {
  uat: "https://staging-sb-merchant-api.sabpaisa.in",
  stag: "https://staging-sb-merchant-api.sabpaisa.in",
  prod: "https://merchant-api.sabpaisa.in",
};

function hmacSha256(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value, "utf8").digest("hex");
}

export function generateClientTxnId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 20).toUpperCase();
}

export interface InitiatePaymentInput {
  clientTxnId: string;
  amount: number;
  payerName: string;
  payerEmail: string;
  payerMobile: string;
}

export interface SabPaisaRedirect {
  url: string;
}

interface CreatePaymentResponse {
  checkoutUrl?: string;
  clientSecret?: string;
  data?: { checkoutUrl?: string; clientSecret?: string };
  error?: { message?: string };
  message?: string;
}

export async function buildPaymentRedirect(
  input: InitiatePaymentInput
): Promise<SabPaisaRedirect> {
  const config = getConfig();
  const amount = Math.round(input.amount * 100);
  const timestamp = Math.floor(Date.now() / 1000);
  const checksumInput = `${config.merchantId}|${input.clientTxnId}|${amount}|INR|${timestamp}`;

  const response = await fetch(`${API_URLS[config.env]}/api/v2/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": config.apiKey },
    body: JSON.stringify({
      merchantId: config.merchantId,
      merchantTxnId: input.clientTxnId,
      amount,
      currency: "INR",
      customerName: input.payerName,
      customerEmail: input.payerEmail,
      customerPhone: input.payerMobile,
      returnUrl: `${BASE_URL}/api/pay/callback`,
      checksum: hmacSha256(config.secretKey, checksumInput),
      timestamp,
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => ({}))) as CreatePaymentResponse;
  const checkoutUrl = payload.checkoutUrl ?? payload.data?.checkoutUrl;
  const clientSecret = payload.clientSecret ?? payload.data?.clientSecret;
  if (!response.ok || !checkoutUrl || !clientSecret) {
    const detail = payload.error?.message ?? payload.message ?? `HTTP ${response.status}`;
    throw new Error(`SabPaisa payment session failed: ${detail}`);
  }

  const redirectUrl = new URL(checkoutUrl);
  redirectUrl.searchParams.set("clientSecret", clientSecret);
  return { url: redirectUrl.toString() };
}

export interface SabPaisaResponse {
  clientTxnId?: string;
  sabpaisaTxnId?: string;
  status?: string;
  statusCode?: string;
  amount?: string;
  paidAmount?: string;
  paymentMode?: string;
  bankName?: string;
  [key: string]: string | undefined;
}

export function parsePaymentResponse(params: URLSearchParams): SabPaisaResponse {
  const config = getConfig();
  const signature = params.get("signature");
  if (!signature) throw new Error("SabPaisa return is missing its signature.");

  const signedParams = Array.from(params.entries())
    .filter(([key]) => key !== "signature")
    .sort(([left], [right]) => left.localeCompare(right));
  const data = signedParams.map(([key, value]) => `${key}=${value}`).join("|");
  const expected = hmacSha256(config.secretKey, data);
  const receivedBuffer = Buffer.from(signature.toLowerCase(), "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");
  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    throw new Error("SabPaisa return signature verification failed.");
  }

  return {
    clientTxnId: params.get("merchant_txn_id") ?? undefined,
    sabpaisaTxnId: params.get("transaction_id") ?? undefined,
    status: params.get("status") ?? undefined,
    statusCode: params.get("status_code") ?? undefined,
    amount: params.get("amount") ?? undefined,
    paidAmount: params.get("paid_amount") ?? undefined,
    paymentMode: params.get("payment_mode") ?? undefined,
    bankName: params.get("bank_name") ?? undefined,
    ...Object.fromEntries(params.entries()),
  };
}
