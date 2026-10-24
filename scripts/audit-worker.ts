import { loadEnvConfig } from "@next/env";
import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

async function main() {
  loadEnvConfig(process.cwd());
  const { heartbeatWorker, expireAuditData } = await import("../lib/website-audit/repository");
  const { runAuditWorkerOnce } = await import("../lib/website-audit/worker");
  const { deliverAuditNotification } = await import("../lib/website-audit/notifications");
  const { auditPool } = await import("../lib/website-audit/database");
  const workerId = randomUUID();
  let stopping = false;
  process.on("SIGINT", () => { stopping = true; });
  process.on("SIGTERM", () => { stopping = true; });
  await heartbeatWorker(workerId);
  await expireAuditData();
  console.log("Website audit worker ready. Durable jobs are stored in PostgreSQL.");
  const pulse = setInterval(() => { void heartbeatWorker(workerId).catch(() => console.error("Audit worker heartbeat unavailable.")); }, 15000);
  pulse.unref();
  let lastCleanup = Date.now();
  try {
    do {
      try {
        if (Date.now() - lastCleanup > 60000) { await expireAuditData(); lastCleanup = Date.now(); }
        const worked = await runAuditWorkerOnce();
        await deliverAuditNotification();
        if (!worked) await delay(2000);
      } catch {
        console.error("Audit worker task failed; durable work will be retried.");
        await delay(5000);
      }
    } while (!stopping && !process.argv.includes("--once"));
  } finally {
    clearInterval(pulse);
    await auditPool().query("DELETE FROM website_audit_workers WHERE id=$1", [workerId]);
    await auditPool().end();
  }
}

void main().catch(() => {
  console.error("Audit worker could not start. Check database configuration and run audit:migrate.");
  process.exitCode = 1;
});
