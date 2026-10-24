import "server-only";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { PoolClient } from "pg";

export interface DatabaseMigration { name: string; sql: string }

export async function loadDatabaseMigrationFiles(rootDirectory = process.cwd()): Promise<{ coreSchema: string; migrations: DatabaseMigration[] }> {
  const directory = path.join(rootDirectory, "migrations");
  const names = (await readdir(directory)).filter((name) => /^\d+_[\w-]+\.sql$/.test(name)).sort();
  const [coreSchema, migrations] = await Promise.all([
    readFile(path.join(rootDirectory, "schema.sql"), "utf8"),
    Promise.all(names.map(async (name) => ({ name, sql: await readFile(path.join(directory, name), "utf8") }))),
  ]);
  return { coreSchema, migrations };
}

/** Add missing application structures without replacing rows or changing sequences. */
export async function applyDatabaseMigrations(client: Pick<PoolClient, "query">, coreSchema: string, migrations: readonly DatabaseMigration[]): Promise<string[]> {
  await client.query("BEGIN");
  try {
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '60s'");
    // Shared with audit:migrate so either deployment entry point serializes safely.
    await client.query("SELECT pg_advisory_xact_lock(74021900)");
    await client.query(coreSchema);
    await client.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS document_type TEXT NOT NULL DEFAULT 'invoice' CHECK (document_type IN ('invoice', 'proforma'))");
    await client.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS converted_to_invoice_id INTEGER REFERENCES invoices(id)");
    await client.query("CREATE TABLE IF NOT EXISTS website_audit_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())");
    const applied: string[] = [];
    for (const migration of migrations) {
      const existing = await client.query("SELECT 1 FROM website_audit_migrations WHERE name=$1", [migration.name]);
      if (existing.rowCount) continue;
      await client.query(migration.sql);
      await client.query("INSERT INTO website_audit_migrations(name) VALUES ($1)", [migration.name]);
      applied.push(migration.name);
    }
    await client.query("COMMIT");
    return applied;
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch { /* Preserve the original failure; the caller closes its pool. */ }
    throw error;
  }
}
