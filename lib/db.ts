import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let cached: NeonQueryFunction<false, false> | undefined;

// Lazily initialized: Next.js evaluates Route Handler modules while
// collecting page data at build time, before env vars like DATABASE_URL are
// necessarily set — throwing at module scope would break `next build`.
export function getSql(): NeonQueryFunction<false, false> {
  if (!cached) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set.");
    }
    cached = neon(process.env.DATABASE_URL);
  }
  return cached;
}
