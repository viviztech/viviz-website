import "server-only";
import { randomUUID } from "node:crypto";
import { BASE_URL } from "@/lib/config";

// SabPaisa PG 3.0 hosted-checkout integration.
//
// Encryption scheme (ported from SabPaisa's own `sabpaisa-pg-dev` React
// library source, since their devdocs site blocks non-browser fetches):
// AES-256-GCM with a random 12-byte IV, then HMAC-SHA384 over (iv || cipher
// text+tag) using a *second* key. The final blob is `hmac || iv || cipher`,
// hex-encoded uppercase. `authKey` is the AES key; `authIV` is actually the
// HMAC key (both base64, despite the "IV" name) -- this is SabPaisa's naming,
// not ours. We run this with Node's built-in Web Crypto (`crypto.subtle`),
// which implements the same algorithm the browser SDK uses.
const IV_SIZE = 12;
const TAG_SIZE = 16;
const HMAC_LENGTH = 48;

function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

function bytesToHex(bytes: Uint8Array<ArrayBuffer>): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join("");
}

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

async function encryptPayload(
  aesKeyBase64: string,
  hmacKeyBase64: string,
  plaintext: string
): Promise<string> {
  const aesKeyRaw = base64ToBytes(aesKeyBase64);
  const hmacKeyRaw = base64ToBytes(hmacKeyBase64);

  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));

  const aesKey = await crypto.subtle.importKey("raw", aesKeyRaw, "AES-GCM", false, ["encrypt"]);
  const cipherTextWithTag = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, tagLength: TAG_SIZE * 8 },
    aesKey,
    new TextEncoder().encode(plaintext)
  );

  const encryptedMessage = new Uint8Array(iv.length + cipherTextWithTag.byteLength);
  encryptedMessage.set(iv);
  encryptedMessage.set(new Uint8Array(cipherTextWithTag), iv.length);

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    hmacKeyRaw,
    { name: "HMAC", hash: "SHA-384" },
    false,
    ["sign"]
  );
  const hmac = await crypto.subtle.sign("HMAC", hmacKey, encryptedMessage);

  const finalBuffer = new Uint8Array(hmac.byteLength + encryptedMessage.length);
  finalBuffer.set(new Uint8Array(hmac));
  finalBuffer.set(encryptedMessage, hmac.byteLength);

  return bytesToHex(finalBuffer);
}

async function decryptPayload(
  aesKeyBase64: string,
  hmacKeyBase64: string,
  hexCipherText: string
): Promise<string> {
  const aesKeyRaw = base64ToBytes(aesKeyBase64);
  const hmacKeyRaw = base64ToBytes(hmacKeyBase64);
  const fullMessage = hexToBytes(hexCipherText);

  if (fullMessage.length < HMAC_LENGTH + IV_SIZE + TAG_SIZE) {
    throw new Error("Invalid SabPaisa response: ciphertext too short.");
  }

  const hmacReceived = fullMessage.slice(0, HMAC_LENGTH);
  const encryptedData = fullMessage.slice(HMAC_LENGTH);

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    hmacKeyRaw,
    { name: "HMAC", hash: "SHA-384" },
    false,
    ["verify"]
  );
  const isValid = await crypto.subtle.verify("HMAC", hmacKey, hmacReceived, encryptedData);
  if (!isValid) {
    throw new Error("SabPaisa response failed HMAC verification -- possible tampering.");
  }

  const iv = encryptedData.slice(0, IV_SIZE);
  const cipherTextWithTag = encryptedData.slice(IV_SIZE);

  const aesKey = await crypto.subtle.importKey("raw", aesKeyRaw, "AES-GCM", false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, tagLength: TAG_SIZE * 8 },
    aesKey,
    cipherTextWithTag
  );

  return new TextDecoder().decode(decrypted);
}

interface SabPaisaConfig {
  clientCode: string;
  transUserName: string;
  transUserPassword: string;
  authKey: string;
  authIV: string;
  env: "uat" | "stag" | "prod";
}

function getConfig(): SabPaisaConfig {
  const clientCode = process.env.SABPAISA_CLIENT_CODE;
  const authKey = process.env.SABPAISA_AUTH_KEY;
  const authIV = process.env.SABPAISA_AUTH_IV;
  // Optional: some SabPaisa onboarding flows only issue Client Code + API
  // Key + Secret Key (mapped to authKey/authIV above), with no separate
  // transaction username/password. Left blank unless SabPaisa gave you those
  // too -- unverified whether the backend requires them or tolerates "".
  const transUserName = process.env.SABPAISA_TRANS_USERNAME ?? "";
  const transUserPassword = process.env.SABPAISA_TRANS_PASSWORD ?? "";
  const env = (process.env.SABPAISA_ENV || "uat") as SabPaisaConfig["env"];

  if (!clientCode || !authKey || !authIV) {
    throw new Error(
      "SabPaisa is not configured: set SABPAISA_CLIENT_CODE, SABPAISA_AUTH_KEY, SABPAISA_AUTH_IV."
    );
  }
  if (env !== "uat" && env !== "stag" && env !== "prod") {
    throw new Error("SABPAISA_ENV must be one of: uat, stag, prod.");
  }

  return { clientCode, transUserName, transUserPassword, authKey, authIV, env };
}

const PAYMENT_URLS: Record<SabPaisaConfig["env"], string> = {
  uat: "https://secure.sabpaisa.in/SabPaisa/sabPaisaInit?v=1",
  stag: "https://stage-securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1",
  prod: "https://securepay.sabpaisa.in/SabPaisa/sabPaisaInit?v=1",
};

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
  clientCode: string;
  encData: string;
}

// Builds the encrypted `encData` blob and posting URL for SabPaisa's hosted
// checkout. The caller renders/submits a form with these two fields --
// SabPaisa's own page collects card/UPI/netbanking details from there.
export async function buildPaymentRedirect(
  input: InitiatePaymentInput
): Promise<SabPaisaRedirect> {
  const config = getConfig();

  const params = new URLSearchParams({
    payerName: input.payerName,
    payerEmail: input.payerEmail,
    payerMobile: input.payerMobile,
    clientTxnId: input.clientTxnId,
    amount: input.amount.toFixed(2),
    clientCode: config.clientCode,
    transUserName: config.transUserName,
    transUserPassword: config.transUserPassword,
    callbackUrl: `${BASE_URL}/api/pay/callback`,
    channelId: "web",
  });

  const encData = await encryptPayload(config.authKey, config.authIV, params.toString());

  return { url: PAYMENT_URLS[config.env], clientCode: config.clientCode, encData };
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

// Decrypts the `encResponse` query param SabPaisa appends when it redirects
// the browser back to callbackUrl.
export async function parsePaymentResponse(encResponse: string): Promise<SabPaisaResponse> {
  const config = getConfig();
  const decrypted = await decryptPayload(
    config.authKey,
    config.authIV,
    // SabPaisa's own SDK does this same replacement -- some transports turn
    // '+' into ' ' along the way (standard query-string decoding artifact).
    encResponse.replaceAll(" ", "+")
  );
  return Object.fromEntries(new URLSearchParams(decrypted));
}
