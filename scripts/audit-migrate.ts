import { loadEnvConfig } from "@next/env";
import { readFile } from "node:fs/promises";
import path from "node:path";

async function main() {
  loadEnvConfig(process.cwd());
  const { auditPool, auditTransaction } = await import("../lib/website-audit/database");
  const migration = await readFile(path.join(process.cwd(), "migrations/001_website_audits.sql"), "utf8");
  await auditTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(74021900)");
    await client.query(migration);
  });
  console.log("Website audit tables are ready. Existing business tables were not modified.");
  await auditPool().end();
}

void main().catch((error: unknown) => {
  console.error("Audit migration failed:", typeof error === "object" && error !== null && "code" in error ? error.code : "configuration_or_connection");
  process.exitCode = 1;
});
