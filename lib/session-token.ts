import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Pure token logic, dependency-free aside from node:crypto — importable from
// both proxy.ts (runs outside React's request scope, can't use next/headers)
// and lib/session.ts (Server Components/Route Handlers, uses next/headers).

export const INVOICE_SESSION_COOKIE = "invoice_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.INVOICE_SESSION_SECRET;
  if (!secret) {
    throw new Error("INVOICE_SESSION_SECRET is not set.");
  }
  return secret;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", getSecret()).update(String(expiresAt)).digest("hex");
}

export function buildSessionToken(expiresAt: number): string {
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;

  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = sign(expiresAt);
  // Both are hex digests of the same HMAC, so they're always equal length —
  // timingSafeEqual throws on length mismatch rather than returning false.
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
