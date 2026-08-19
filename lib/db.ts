import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { Pool } from "pg";

type SqlFn = NeonQueryFunction<false, false>;

let cached: SqlFn | undefined;

// @neondatabase/serverless talks to Postgres over Neon's own HTTPS/WebSocket
// proxy, not the raw wire protocol -- it can't reach a plain local Postgres
// server directly. For local dev (DATABASE_URL pointing at localhost/a non-
// Neon host) we fall back to `pg` behind the same tagged-template call
// shape, so every call site (`getSql()\`SELECT ...\``) works unmodified
// against either backend.
function isNeonHost(url: string): boolean {
  return /neon\.tech|neon\.build/.test(url);
}

function createLocalSql(connectionString: string): SqlFn {
  const pool = new Pool({ connectionString });

  const sql = async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const text = strings.reduce(
      (acc, chunk, i) => acc + chunk + (i < values.length ? `$${i + 1}` : ""),
      ""
    );
    const { rows } = await pool.query(text, values);
    return rows;
  };

  return sql as unknown as SqlFn;
}

// Lazily initialized: Next.js evaluates Route Handler modules while
// collecting page data at build time, before env vars like DATABASE_URL are
// necessarily set — throwing at module scope would break `next build`.
export function getSql(): SqlFn {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set.");
    }
    cached = isNeonHost(url) ? neon(url) : createLocalSql(url);
  }
  return cached;
}
