export function boundedEnvironmentNumber(name: string, fallback: number, maximum: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
}

export function auditLimits() {
  return {
    sessionDaily: boundedEnvironmentNumber("AUDIT_SESSION_DAILY_LIMIT", 3, 100),
    ipDaily: boundedEnvironmentNumber("AUDIT_IP_DAILY_LIMIT", 12, 1000),
    globalDaily: boundedEnvironmentNumber("AUDIT_GLOBAL_DAILY_LIMIT", 100, 10000),
    concurrent: boundedEnvironmentNumber("AUDIT_MAX_CONCURRENT", 2, 10),
    assessments: boundedEnvironmentNumber("AUDIT_ASSESSMENT_LIMIT", 6, 20),
    deadlineMs: 10 * 60 * 1000,
  };
}

export const AUDIT_COOKIE = "viviz_audit_session";
export const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
};
