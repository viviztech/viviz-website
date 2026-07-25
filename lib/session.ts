import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import {
  INVOICE_SESSION_COOKIE,
  SESSION_DURATION_MS,
  buildSessionToken,
  isValidSessionToken,
} from "@/lib/session-token";

export function verifyPassword(submitted: string): boolean {
  const expected = process.env.INVOICE_PASSWORD;
  const secret = process.env.INVOICE_SESSION_SECRET;
  if (!expected || !secret) {
    throw new Error("INVOICE_PASSWORD or INVOICE_SESSION_SECRET is not set.");
  }
  // Hash both sides to a fixed length first: comparing raw strings of
  // different lengths would throw instead of safely returning false.
  const a = createHmac("sha256", secret).update(submitted).digest();
  const b = createHmac("sha256", secret).update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function createSessionCookie(): Promise<void> {
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const cookieStore = await cookies();
  cookieStore.set(INVOICE_SESSION_COOKIE, buildSessionToken(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function verifySessionFromCookies(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(INVOICE_SESSION_COOKIE)?.value);
}
