import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { INVOICE_SESSION_COOKIE, isValidSessionToken } from "@/lib/session-token";

// Optimistic check only (per Next.js's own guidance) — every /api/invoices
// Route Handler independently re-verifies the session too.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const staffAudit = pathname === "/invoice/website-audits" || pathname.startsWith("/invoice/website-audits/") || pathname.startsWith("/api/invoices/website-audits/");
  const privateStaffResponse = (response: NextResponse) => {
    if (staffAudit) {
      response.headers.set("Cache-Control", "private, no-store, max-age=0");
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
      response.headers.set("Referrer-Policy", "no-referrer");
    }
    return response;
  };

  if (staffAudit && (!process.env.INVOICE_PASSWORD?.trim() || !process.env.INVOICE_SESSION_SECRET?.trim())) {
    if (pathname.startsWith("/api/")) {
      return privateStaffResponse(NextResponse.json({ error: "Viviz staff access is not configured. Please contact your administrator." }, { status: 503 }));
    }
    // The page's DAL displays a friendly unavailable state without querying data.
    return privateStaffResponse(NextResponse.next());
  }

  if (pathname === "/invoice/login" || pathname === "/employees/login") {
    return NextResponse.next();
  }

  const authenticated = isValidSessionToken(request.cookies.get(INVOICE_SESSION_COOKIE)?.value);

  if (authenticated) {
    return privateStaffResponse(NextResponse.next());
  }

  if (pathname.startsWith("/api/invoices") || pathname.startsWith("/api/employees")) {
    return privateStaffResponse(NextResponse.json({ error: "Unauthorized." }, { status: 401 }));
  }

  return privateStaffResponse(NextResponse.redirect(new URL(pathname.startsWith("/employees") ? "/employees/login" : "/invoice/login", request.url)));
}

export const config = {
  matcher: ["/invoice/:path*", "/api/invoices/:path*", "/employees/:path*", "/api/employees/:path*"],
};
