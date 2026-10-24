import { loadEnvConfig } from "@next/env";
import { applyDatabaseMigrations, loadDatabaseMigrationFiles } from "../lib/database-migrations";

async function main() {
  loadEnvConfig(process.cwd());
  const { auditPool } = await import("../lib/website-audit/database");
  const sources = await loadDatabaseMigrationFiles();
  const pool = auditPool();
  try {
    const client = await pool.connect();
    try {
      await applyDatabaseMigrations(client, sources.coreSchema, sources.migrations);
      console.log("database_migrations_ready");
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

void main().catch(() => {
  console.error("database_migrations_failed");
  process.exitCode = 1;
});
