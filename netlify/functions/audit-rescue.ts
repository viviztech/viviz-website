import { dispatchAuditJob, getAuditExecutionConfig } from "../../lib/website-audit/execution";
import { deliverAuditNotification } from "../../lib/website-audit/notifications";
import { expireAuditData, listDispatchableAuditIds } from "../../lib/website-audit/repository";

interface RescueDependencies {
  enabled: () => boolean;
  cleanup: () => Promise<void>;
  listPending: (limit: number) => Promise<string[]>;
  dispatch: (auditId: string) => Promise<void>;
  notificationsEnabled: () => boolean;
  deliverNotification: () => Promise<void>;
  logFailure: () => void;
}

export function createAuditRescueHandler(dependencies: RescueDependencies) {
  return async (): Promise<void> => {
    if (!dependencies.enabled()) return;
    try {
      await dependencies.cleanup();
      const pending = await dependencies.listPending(2);
      const results = await Promise.allSettled(pending.slice(0, 2).map((auditId) => dependencies.dispatch(auditId)));
      if (results.some((result) => result.status === "rejected")) dependencies.logFailure();
      if (dependencies.notificationsEnabled()) await dependencies.deliverNotification();
    } catch {
      dependencies.logFailure();
      throw new Error("audit_rescue_unavailable");
    }
  };
}

export default createAuditRescueHandler({
  enabled: () => process.env.AUDIT_ENABLED !== "false" && getAuditExecutionConfig()?.mode === "netlify",
  cleanup: expireAuditData,
  listPending: listDispatchableAuditIds,
  dispatch: dispatchAuditJob,
  notificationsEnabled: () => process.env.AUDIT_SEND_EMAIL === "true",
  deliverNotification: deliverAuditNotification,
  logFailure: () => { console.error("Audit rescue failed: dispatch_or_database_unavailable"); },
});

// Netlify scheduled functions have no public HTTP endpoint in production.
// This function only dispatches jobs; each long scan runs in the background.
// Leave time for Neon Free's five-minute idle suspension between recovery runs.
export const config = { schedule: "*/12 * * * *" } as const;
