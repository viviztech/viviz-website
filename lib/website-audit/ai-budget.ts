import "server-only";
import { auditTransaction } from "./database";

function cap(value: string | undefined, fallback: number, maximum: number): number {
  if (value === undefined || value.trim() === "") return fallback;
  if (!/^\d+$/.test(value.trim())) return 0;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? Math.min(parsed, maximum) : 0;
}

/** Application caps are independent of Google's project-specific free quota. */
export function auditAiLimits(): { daily: number; minute: number } {
  return {
    daily: cap(process.env.AUDIT_AI_DAILY_LIMIT, 20, 100),
    minute: cap(process.env.AUDIT_AI_MINUTE_LIMIT, 2, 10),
  };
}

/**
 * Reserve before contacting Gemini; never hold a database lock over a model call.
 * This global database budget is shared by workers, survives restarts, counts
 * failures, and fails closed when its migration or database is unavailable.
 */
export async function reserveAuditAiRequest(options: { transaction?: typeof auditTransaction } = {}): Promise<boolean> {
  const limits = auditAiLimits();
  if (!limits.daily || !limits.minute) return false;
  try {
    return await (options.transaction ?? auditTransaction)(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext('viviz-audit-gemini-budget'))");
      await client.query("DELETE FROM website_audit_ai_usage WHERE window_start < now() - INTERVAL '2 days'");
      const current = await client.query<{ window_kind: "day" | "minute"; requests: number }>(`
        SELECT window_kind, requests FROM website_audit_ai_usage
        WHERE (window_kind = 'day' AND window_start = date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')
           OR (window_kind = 'minute' AND window_start = date_trunc('minute', now()))
      `);
      const used = new Map(current.rows.map((row) => [row.window_kind, Number(row.requests)]));
      if ([...used.values()].some((value) => !Number.isSafeInteger(value) || value < 0)) return false;
      if ((used.get("day") ?? 0) >= limits.daily || (used.get("minute") ?? 0) >= limits.minute) return false;
      await client.query(`
        INSERT INTO website_audit_ai_usage(window_kind, window_start, requests)
        VALUES ('day', date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC', 1),
               ('minute', date_trunc('minute', now()), 1)
        ON CONFLICT (window_kind, window_start)
        DO UPDATE SET requests = website_audit_ai_usage.requests + 1
      `);
      return true;
    });
  } catch {
    return false;
  }
}
