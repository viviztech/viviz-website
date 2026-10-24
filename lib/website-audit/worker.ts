import "server-only";
import { crawlWebsite } from "./crawler";
import { claimAudit, checkpointAudit, renewAuditLease, finishAudit, failAudit } from "./repository";

export async function runAuditWorkerOnce(auditId?: string): Promise<boolean> {
  if (process.env.AUDIT_ENABLED === "false") return false;
  const job = await claimAudit(auditId);
  if (!job) return false;
  let active = true;
  let checking = false;
  const heartbeat = setInterval(() => {
    if (checking) return;
    checking = true;
    void renewAuditLease(job.id, job.leaseToken).then((valid) => { active = active && valid; }).catch(() => { active = false; }).finally(() => { checking = false; });
  }, 15000);
  heartbeat.unref();
  try {
    const result = await crawlWebsite(job.url, {
      shouldContinue: async () => {
        if (!active || process.env.AUDIT_ENABLED === "false") return false;
        active = await renewAuditLease(job.id, job.leaseToken);
        return active;
      },
      onProgress: async (progress) => {
        if (!active) throw new Error("audit_inactive");
        await checkpointAudit(job.id, job.leaseToken, progress);
      },
    });
    if (active) await finishAudit(job.id, job.leaseToken, result);
    else await failAudit(job.id, job.leaseToken);
  } catch {
    await failAudit(job.id, job.leaseToken);
  } finally {
    clearInterval(heartbeat);
  }
  return true;
}
