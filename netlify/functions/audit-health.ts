import { auditPool } from "../../lib/website-audit/database";
import { verifyAuditWorkerProbe } from "../../lib/website-audit/execution";

const TABLES = [
  "website_audits",
  "website_audit_workers",
  "website_audit_assessment_revisions",
  "website_audit_enquiries",
  "website_audit_report_downloads",
  "website_audit_ai_usage",
  "website_audit_migrations",
];

type Readiness = { ready: boolean; code: "ready" | "audit_schema_missing" | "audit_disabled" | "database_unavailable" };
interface HealthDependencies {
  verify: (request: Request) => boolean;
  check: () => Promise<Readiness>;
}

function json(result: Readiness | { ready: false; code: "unauthorized" }, status: number) {
  return Response.json(result, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}

async function checkReadiness(): Promise<Readiness> {
  if (process.env.AUDIT_ENABLED === "false") return { ready: false, code: "audit_disabled" };
  try {
    const tables = await auditPool().query<{ present: boolean }>(
      "SELECT to_regclass(name) IS NOT NULL AS present FROM unnest($1::text[]) AS expected(name)",
      [TABLES],
    );
    if (tables.rows.some((table) => !table.present)) return { ready: false, code: "audit_schema_missing" };
    return { ready: true, code: "ready" };
  } catch {
    return { ready: false, code: "database_unavailable" };
  }
}

export function createAuditHealthHandler(dependencies: HealthDependencies) {
  return async (request: Request): Promise<Response> => {
    if (!dependencies.verify(request)) return json({ ready: false, code: "unauthorized" }, 401);
    try {
      const readiness = await dependencies.check();
      return json(readiness, readiness.ready ? 200 : 503);
    } catch {
      return json({ ready: false, code: "database_unavailable" }, 503);
    }
  };
}

export default createAuditHealthHandler({ verify: verifyAuditWorkerProbe, check: checkReadiness });

export const config = { method: "GET" } as const;
