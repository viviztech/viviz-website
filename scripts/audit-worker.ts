import { loadEnvConfig } from "@next/env";
import { randomUUID } from "node:crypto";
import { runWorkerRuntime } from "../lib/website-audit/worker-runtime";

async function main() {
  loadEnvConfig(process.cwd());
  const { heartbeatWorker, expireAuditData } = await import("../lib/website-audit/repository");
  const { runAuditWorkerOnce } = await import("../lib/website-audit/worker");
  const { deliverAuditNotification } = await import("../lib/website-audit/notifications");
  const { auditPool } = await import("../lib/website-audit/database");
  const workerId = randomUUID();
  const pool = auditPool();
  let stopping = false;
  const stop = () => { stopping = true; };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  try {
    await runWorkerRuntime({
      cleanup: expireAuditData,
      heartbeat: () => heartbeatWorker(workerId),
      runJob: runAuditWorkerOnce,
      deliverNotification: deliverAuditNotification,
      removeHeartbeat: async () => { await pool.query("DELETE FROM website_audit_workers WHERE id=$1", [workerId]); },
      close: () => pool.end(),
      log: (event) => {
        if (event === "ready") console.log("audit_worker_ready");
        else console.error(`audit_worker_${event}`);
      },
    }, { once: process.argv.includes("--once"), shouldStop: () => stopping });
  } finally {
    process.off("SIGINT", stop);
    process.off("SIGTERM", stop);
  }
}

void main().catch(() => {
  console.error("audit_worker_startup_or_shutdown_failed");
  process.exitCode = 1;
});
