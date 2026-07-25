import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { INVOICE_SESSION_COOKIE, isValidSessionToken } from "@/lib/session-token";

// Optimistic check only (per Next.js's own guidance) — every /api/invoices
// Route Handler independently re-verifies the session too.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/invoice/login") {
    return NextResponse.next();
  }

  const authenticated = isValidSessionToken(request.cookies.get(INVOICE_SESSION_COOKIE)?.value);

  if (authenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/invoices")) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/invoice/login", request.url));
}

export const config = {
  matcher: ["/invoice/:path*", "/api/invoices/:path*"],
};
