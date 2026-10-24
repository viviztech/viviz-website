import { loadEnvConfig } from "@next/env";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

async function main() {
  loadEnvConfig(process.cwd());
  const { auditPool, auditTransaction } = await import("../lib/website-audit/database");
  const directory = path.join(process.cwd(), "migrations");
  const files = (await readdir(directory)).filter((file) => /^\d+_[\w-]+\.sql$/.test(file)).sort();
  const migrations = await Promise.all(files.map(async (name) => ({ name, sql: await readFile(path.join(directory, name), "utf8") })));
  await auditTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(74021900)");
    await client.query("CREATE TABLE IF NOT EXISTS website_audit_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
    for (const migration of migrations) {
      const applied = await client.query("SELECT 1 FROM website_audit_migrations WHERE name=$1", [migration.name]);
      if (applied.rowCount) continue;
      await client.query(migration.sql);
      await client.query("INSERT INTO website_audit_migrations(name) VALUES ($1)", [migration.name]);
    }
  });
  console.log("Website audit tables are ready. Existing business tables were not modified.");
  await auditPool().end();
}

void main().catch((error: unknown) => {
  console.error("Audit migration failed:", typeof error === "object" && error !== null && "code" in error ? error.code : "configuration_or_connection");
  process.exitCode = 1;
});
