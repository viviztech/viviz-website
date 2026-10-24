import "server-only";
import { Pool, type PoolClient } from "pg";

let pool: Pool | undefined;

export function auditPool(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("Audit database is not configured.");
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 4,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 8000,
    allowExitOnIdle: true,
  });
  return pool;
}

export async function auditTransaction<T>(operation: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await auditPool().connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
