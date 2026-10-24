import { loadEnvConfig } from "@next/env";

const TABLES = ["website_audits", "website_audit_workers", "website_audit_assessment_revisions", "website_audit_enquiries", "website_audit_report_downloads", "website_audit_ai_usage", "website_audit_migrations"];

async function main() {
  loadEnvConfig(process.cwd());
  const { getAuditExecutionConfig, checkAuditWorkerConnection } = await import("../lib/website-audit/execution");
  const execution = getAuditExecutionConfig();
  const schemaOnly = process.argv.includes("--schema-only");
  const ai = {
    enabled: process.env.AUDIT_AI_ENABLED === "true",
    keyConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    modelSupported: ["gemini-3.8-flash", "gemini-3.5-flash-lite"].includes(process.env.AUDIT_AI_MODEL?.trim() || "gemini-3.8-flash"),
  };
  const result = { ready: false, code: "database_not_configured", mode: execution?.mode ?? "invalid", schemaReady: false, missingTables: [] as string[], activeWorkers: 0, ai };
  if (!process.env.DATABASE_URL?.trim()) {
    console.log(JSON.stringify(result));
    process.exitCode = 1;
    return;
  }
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 6000, query_timeout: 5000, statement_timeout: 5000, idleTimeoutMillis: 1000, allowExitOnIdle: true });
  try {
    const tables = await pool.query<{ name: string; present: boolean }>("SELECT name, to_regclass(name) IS NOT NULL AS present FROM unnest($1::text[]) AS expected(name)", [TABLES]);
    result.missingTables = tables.rows.filter(table => !table.present).map(table => table.name);
    result.schemaReady = result.missingTables.length === 0;
    if (!result.schemaReady) result.code = "audit_schema_missing";
    else if (process.env.AUDIT_ENABLED === "false") result.code = "audit_disabled";
    else if (!execution) result.code = "worker_configuration_invalid";
    else if (schemaOnly) { result.ready = true; result.code = "ready"; }
    else if (execution.mode === "netlify") {
      const connection = await checkAuditWorkerConnection();
      result.ready = connection.ready;
      result.code = connection.code;
    }
    else {
      const workers = await pool.query<{ count: number }>("SELECT count(*)::int AS count FROM website_audit_workers WHERE last_seen_at > now() - INTERVAL '90 seconds'");
      result.activeWorkers = workers.rows[0].count;
      result.ready = result.activeWorkers > 0;
      result.code = result.ready ? "ready" : "worker_offline";
    }
  } catch (error) {
    result.code = "database_unavailable";
    const stableCode = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "connection_or_configuration";
    console.error("Audit readiness check failed:", /^[a-z0-9_]{1,40}$/i.test(stableCode) ? stableCode : "database_error");
  } finally { await pool.end(); }
  console.log(JSON.stringify(result));
  if (!result.ready) process.exitCode = 1;
}

void main().catch(() => {
  console.error("Audit readiness check failed: configuration_or_connection");
  process.exitCode = 1;
});
