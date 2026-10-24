import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { loadEnvConfig } from "@next/env";
import { Pool, type PoolClient, type QueryResult } from "pg";
import { applyDatabaseMigrations, loadDatabaseMigrationFiles } from "../lib/database-migrations";

test("application bootstrap rolls back the whole transaction if an audit migration fails", async () => {
  const calls: string[] = [];
  const failed = new Error("fictional migration failure");
  const client = {
    query: async (sql: string) => {
      calls.push(sql);
      if (sql === "fixture failing migration") throw failed;
      return { rowCount: 0, rows: [] };
    },
  } as unknown as Pick<PoolClient, "query">;
  await assert.rejects(applyDatabaseMigrations(client, "fixture core schema", [{ name: "001_fixture.sql", sql: "fixture failing migration" }]), (error: unknown) => error === failed);
  assert.equal(calls[0], "BEGIN");
  assert.equal(calls.at(-1), "ROLLBACK");
  assert.ok(!calls.includes("COMMIT"));
  assert.ok(calls.indexOf("SELECT pg_advisory_xact_lock(74021900)") < calls.indexOf("fixture core schema"));
});

test("local Postgres bootstrap preserves existing business records and serials across repeated upgrades", { skip: process.env.AUDIT_DB_TESTS !== "true", timeout: 60000 }, async () => {
  loadEnvConfig(process.cwd());
  assert.ok(process.env.DATABASE_URL, "AUDIT_DB_TESTS requires a local DATABASE_URL.");
  const destination = new URL(process.env.DATABASE_URL);
  assert.ok(["postgres:", "postgresql:"].includes(destination.protocol), "Bootstrap tests require Postgres.");
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(destination.hostname), "Refusing bootstrap tests against a non-local database.");
  assert.ok(!["host", "hostaddr", "service"].some((key) => destination.searchParams.has(key)), "Refusing parameters that can replace the local database host.");
  const schema = `database_migrations_test_${randomUUID().replaceAll("-", "")}`;
  assert.match(schema, /^database_migrations_test_[a-f0-9]{32}$/);
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 8000, allowExitOnIdle: true });
  let client: PoolClient | undefined;
  let schemaCreated = false;
  try {
    client = await pool.connect();
    await client.query(`CREATE SCHEMA "${schema}"`);
    schemaCreated = true;
    await client.query(`SET search_path TO "${schema}"`);
    const sources = await loadDatabaseMigrationFiles();
    // Historical invoices lacked the two proforma columns. Existing rows must survive.
    await client.query(`CREATE TABLE invoices (
      id SERIAL PRIMARY KEY,
      client_name TEXT NOT NULL, client_address TEXT NOT NULL, client_gstin TEXT,
      client_state_code TEXT NOT NULL, invoice_date DATE NOT NULL, due_date DATE,
      line_items JSONB NOT NULL, gst_rate NUMERIC(5,2) NOT NULL,
      subtotal NUMERIC(12,2) NOT NULL, cgst NUMERIC(12,2) NOT NULL,
      sgst NUMERIC(12,2) NOT NULL, igst NUMERIC(12,2) NOT NULL,
      total NUMERIC(12,2) NOT NULL, notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
    const otherCoreTables = sources.coreSchema.indexOf("CREATE TABLE IF NOT EXISTS payments");
    assert.ok(otherCoreTables > 0, "The fixture must use the existing payment and employee structures.");
    await client.query(sources.coreSchema.slice(otherCoreTables));
    // Established businesses can have sequence values far above their retained row count.
    // Initialize only the sequences inside this new test schema to model that history.
    for (const [table, next] of [["invoices", 41], ["payments", 71], ["employees", 101]] as const) {
      await client.query("SELECT setval(pg_get_serial_sequence($1,'id'),$2,false)", [`${schema}.${table}`, next]);
    }
    await client.query("INSERT INTO invoices(client_name,client_address,client_state_code,invoice_date,line_items,gst_rate,subtotal,cgst,sgst,igst,total,notes) VALUES ('Fictional Customer','Fixture address','33','2026-01-01','[]',18,100,9,9,0,118,'Preserve this invoice')");
    await client.query("INSERT INTO payments(client_txn_id,payer_name,payer_email,payer_mobile,amount,status) VALUES ('fixture-payment','Fictional Payer','payer@fixture.example','0000000000',118,'SUCCESS')");
    await client.query("INSERT INTO employees(employee_code,full_name,personal_email,phone,address,role,department,employment_type,work_location,joining_date,annual_ctc,notes) VALUES ('FIX-001','Fictional Employee','employee@fixture.example','0000000000','Fixture address','Fixture Analyst','Fixture Team','full_time','Fixture office','2026-01-01',600000,'Preserve this employee')");
    const beforeInvoice = (await client.query("SELECT * FROM invoices")).rows[0];
    const beforePayment = (await client.query("SELECT * FROM payments")).rows[0];
    const beforeEmployee = (await client.query("SELECT * FROM employees")).rows[0];
    const sequenceSnapshots = new Map<string, unknown>();
    for (const table of ["invoices", "payments", "employees"]) {
      sequenceSnapshots.set(table, (await client.query(`SELECT last_value,is_called FROM "${schema}"."${table}_id_seq"`)).rows[0]);
    }
    assert.deepEqual(await applyDatabaseMigrations(client, sources.coreSchema, sources.migrations), sources.migrations.map((migration) => migration.name));
    assert.deepEqual(await applyDatabaseMigrations(client, sources.coreSchema, sources.migrations), []);
    const upgradedInvoice = (await client.query("SELECT * FROM invoices")).rows[0];
    assert.equal(upgradedInvoice.document_type, "invoice");
    assert.equal(upgradedInvoice.converted_to_invoice_id, null);
    delete upgradedInvoice.document_type;
    delete upgradedInvoice.converted_to_invoice_id;
    assert.deepEqual(upgradedInvoice, beforeInvoice);
    assert.deepEqual((await client.query("SELECT * FROM payments")).rows, [beforePayment]);
    assert.deepEqual((await client.query("SELECT * FROM employees")).rows, [beforeEmployee]);
    const expectedTables = ["invoices", "payments", "employees", "website_audits", "website_audit_workers", "website_audit_assessment_revisions", "website_audit_enquiries", "website_audit_report_downloads", "website_audit_ai_usage", "website_audit_migrations"];
    const tables = await client.query<{ tablename: string }>("SELECT tablename FROM pg_tables WHERE schemaname=$1", [schema]);
    assert.deepEqual(tables.rows.map((row) => row.tablename).sort(), expectedTables.sort());
    const ledger = await client.query<{ name: string }>("SELECT name FROM website_audit_migrations ORDER BY name");
    assert.deepEqual(ledger.rows.map((row) => row.name), sources.migrations.map((migration) => migration.name));
    for (const [table, record] of [["invoices", beforeInvoice], ["payments", beforePayment], ["employees", beforeEmployee]] as const) {
      assert.deepEqual((await client.query(`SELECT last_value,is_called FROM "${schema}"."${table}_id_seq"`)).rows[0], sequenceSnapshots.get(table));
      const next: QueryResult<{ next: string }> = await client.query("SELECT nextval(pg_get_serial_sequence($1,'id')) AS next", [`${schema}.${table}`]);
      assert.equal(Number(next.rows[0].next), Number(record.id) + 1);
    }
  } finally {
    try {
      if (client && schemaCreated) {
        // Only this test's newly created, prefix-checked random schema is removed.
        await client.query("RESET search_path");
        await client.query(`DROP SCHEMA "${schema}" CASCADE`);
      }
    } finally {
      client?.release();
      await pool.end();
    }
  }
});
