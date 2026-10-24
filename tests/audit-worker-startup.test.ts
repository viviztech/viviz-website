import assert from "node:assert/strict";
import test from "node:test";
import { runWorkerRuntime } from "../lib/website-audit/worker-runtime";

test("a missing cleanup table never advertises readiness and closes the database", async () => {
  const calls: string[] = [];
  const missingTable = Object.assign(new Error("fixture missing table"), { code: "42P01" });
  await assert.rejects(runWorkerRuntime({
    cleanup: async () => { calls.push("cleanup"); throw missingTable; },
    heartbeat: async () => { calls.push("heartbeat"); },
    runJob: async () => { calls.push("job"); return true; },
    deliverNotification: async () => { calls.push("notification"); },
    removeHeartbeat: async () => { calls.push("unregister"); },
    close: async () => { calls.push("close"); },
    log: (event) => { calls.push(event); },
  }, { once: true, shouldStop: () => false }), (error: unknown) => error === missingTable);
  assert.deepEqual(calls, ["cleanup", "unregister", "close"]);
});

test("heartbeat registration failure closes resources without starting work", async () => {
  const calls: string[] = [];
  await assert.rejects(runWorkerRuntime({
    cleanup: async () => { calls.push("cleanup"); },
    heartbeat: async () => { calls.push("heartbeat"); throw new Error("fixture unavailable"); },
    runJob: async () => { calls.push("job"); return true; },
    deliverNotification: async () => { calls.push("notification"); },
    removeHeartbeat: async () => { calls.push("unregister"); throw new Error("fixture removal unavailable"); },
    close: async () => { calls.push("close"); },
    log: (event) => { calls.push(event); },
  }, { once: true, shouldStop: () => false }));
  assert.deepEqual(calls, ["cleanup", "heartbeat", "unregister", "close"]);
});

test("shutdown finishes the active job before withdrawing readiness and closing", async () => {
  let stopping = false;
  let releaseJob!: () => void;
  let signalJobStarted!: () => void;
  const jobStarted = new Promise<void>((resolve) => { signalJobStarted = resolve; });
  const jobReleased = new Promise<void>((resolve) => { releaseJob = resolve; });
  const calls: string[] = [];
  const running = runWorkerRuntime({
    cleanup: async () => { calls.push("cleanup"); },
    heartbeat: async () => { calls.push("heartbeat"); },
    runJob: async () => {
      calls.push("job_started");
      signalJobStarted();
      await jobReleased;
      calls.push("job_finished");
      return true;
    },
    deliverNotification: async () => { calls.push("notification"); },
    removeHeartbeat: async () => { calls.push("unregister"); },
    close: async () => { calls.push("close"); },
    log: (event) => { calls.push(event); },
  }, { shouldStop: () => stopping });
  await jobStarted;
  stopping = true;
  assert.deepEqual(calls, ["cleanup", "heartbeat", "ready", "job_started"]);
  releaseJob();
  await running;
  assert.deepEqual(calls, ["cleanup", "heartbeat", "ready", "job_started", "job_finished", "notification", "unregister", "close"]);
});

test("once mode completes one claim without requiring a termination signal", async () => {
  let claims = 0;
  let closed = false;
  await runWorkerRuntime({
    cleanup: async () => {},
    heartbeat: async () => {},
    runJob: async () => { claims++; return true; },
    deliverNotification: async () => {},
    removeHeartbeat: async () => {},
    close: async () => { closed = true; },
    log: () => {},
  }, { once: true, shouldStop: () => false });
  assert.equal(claims, 1);
  assert.equal(closed, true);
});
