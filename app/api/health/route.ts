export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Container liveness only. Database and worker readiness use audit:check.
export function GET() {
  return Response.json({ status: "ok" }, {
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
