import { setTimeout as delay } from "node:timers/promises";

type WorkerEvent = "ready" | "heartbeat_unavailable" | "task_failed";

interface WorkerRuntimeDependencies {
  cleanup: () => Promise<void>;
  heartbeat: () => Promise<void>;
  runJob: () => Promise<boolean>;
  deliverNotification: () => Promise<void>;
  removeHeartbeat: () => Promise<void>;
  close: () => Promise<void>;
  log: (event: WorkerEvent) => void;
}

interface WorkerRuntimeOptions {
  once?: boolean;
  shouldStop: () => boolean;
}

/** Advertise readiness only after startup checks; retain the active job on shutdown. */
export async function runWorkerRuntime(dependencies: WorkerRuntimeDependencies, options: WorkerRuntimeOptions): Promise<void> {
  let pulse: ReturnType<typeof setInterval> | undefined;
  let heartbeatInFlight: Promise<void> | undefined;
  try {
    await dependencies.cleanup();
    if (options.shouldStop()) return;
    await dependencies.heartbeat();
    if (options.shouldStop()) return;
    dependencies.log("ready");
    pulse = setInterval(() => {
      if (heartbeatInFlight) return;
      heartbeatInFlight = dependencies.heartbeat()
        .catch(() => { dependencies.log("heartbeat_unavailable"); })
        .finally(() => { heartbeatInFlight = undefined; });
    }, 15000);
    pulse.unref();
    let lastCleanup = Date.now();
    do {
      try {
        if (Date.now() - lastCleanup > 60000) {
          await dependencies.cleanup();
          lastCleanup = Date.now();
        }
        const worked = await dependencies.runJob();
        await dependencies.deliverNotification();
        if (!worked && !options.shouldStop()) await delay(2000);
      } catch {
        dependencies.log("task_failed");
        if (!options.shouldStop()) await delay(5000);
      }
    } while (!options.shouldStop() && !options.once);
  } finally {
    clearInterval(pulse);
    // Finish an already-issued heartbeat before deleting it, preventing resurrection.
    await heartbeatInFlight;
    try {
      await dependencies.removeHeartbeat();
    } finally {
      await dependencies.close();
    }
  }
}
