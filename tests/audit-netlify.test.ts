import assert from "node:assert/strict";
import test from "node:test";
import { createAuditBackgroundHandler } from "../netlify/functions/audit-background";
import { createAuditHealthHandler } from "../netlify/functions/audit-health";
import { createAuditRescueHandler } from "../netlify/functions/audit-rescue";

const AUDIT_ID = "d9dcf2ac-920c-472c-b6fd-9d94690b8200";
const request = () => new Request("https://fixture.netlify.app/.netlify/functions/audit-background", { method: "POST" });

test("an unauthenticated background invocation cannot touch audit data or start a scan", async () => {
  const calls: string[] = [];
  const handler = createAuditBackgroundHandler({
    verify: async () => null,
    cleanup: async () => { calls.push("cleanup"); },
    runJob: async () => { calls.push("job"); return true; },
    isPending: async () => { calls.push("pending"); return true; },
  });
  await handler(request());
  assert.deepEqual(calls, []);
});

test("a background invocation processes only its verified audit ID", async () => {
  const calls: string[] = [];
  const handler = createAuditBackgroundHandler({
    verify: async () => ({ auditId: AUDIT_ID }),
    cleanup: async () => { calls.push("cleanup"); },
    runJob: async (id) => { calls.push(id); return true; },
    isPending: async () => { throw new Error("completed jobs do not need a second lookup"); },
  });
  await handler(request());
  assert.deepEqual(calls, ["cleanup", AUDIT_ID]);
});

test("a queued audit blocked by concurrency asks Netlify to retry, while a finished duplicate exits", async () => {
  let pending = true;
  const handler = createAuditBackgroundHandler({
    verify: async () => ({ auditId: AUDIT_ID }),
    cleanup: async () => {},
    runJob: async () => false,
    isPending: async (id) => { assert.equal(id, AUDIT_ID); return pending; },
  });
  await assert.rejects(handler(request()), { message: "audit_worker_busy" });
  pending = false;
  await assert.doesNotReject(handler(request()));
});

test("a failed cleanup cannot start a background scan", async () => {
  let scanned = false;
  const handler = createAuditBackgroundHandler({
    verify: async () => ({ auditId: AUDIT_ID }),
    cleanup: async () => { throw new Error("fixture unavailable"); },
    runJob: async () => { scanned = true; return true; },
    isPending: async () => false,
  });
  await assert.rejects(handler(request()));
  assert.equal(scanned, false);
});

test("worker readiness authenticates before a database check and never exposes database errors", async () => {
  let verified = false;
  let checks = 0;
  const handler = createAuditHealthHandler({
    verify: () => verified,
    check: async () => { checks++; throw new Error("sensitive fixture connection details"); },
  });
  let response = await handler(request());
  assert.equal(response.status, 401);
  assert.equal(checks, 0);
  assert.deepEqual(await response.json(), { ready: false, code: "unauthorized" });
  verified = true;
  response = await handler(request());
  assert.equal(response.status, 503);
  assert.equal(checks, 1);
  assert.deepEqual(await response.json(), { ready: false, code: "database_unavailable" });
});

test("ready and unavailable worker probes return private machine-readable responses", async () => {
  let ready = true;
  const handler = createAuditHealthHandler({
    verify: () => true,
    check: async () => ready ? { ready: true, code: "ready" } : { ready: false, code: "audit_schema_missing" },
  });
  let response = await handler(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.match(response.headers.get("x-robots-tag") || "", /noindex/);
  assert.deepEqual(await response.json(), { ready: true, code: "ready" });
  ready = false;
  response = await handler(request());
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { ready: false, code: "audit_schema_missing" });
});

test("a disabled scheduled rescue never accesses the database", async () => {
  const handler = createAuditRescueHandler({
    enabled: () => false,
    cleanup: async () => { throw new Error("disabled rescue must not run"); },
    listPending: async () => { throw new Error("disabled rescue must not run"); },
    dispatch: async () => { throw new Error("disabled rescue must not run"); },
    notificationsEnabled: () => true,
    deliverNotification: async () => { throw new Error("disabled rescue must not run"); },
    logFailure: () => { throw new Error("disabled rescue must not run"); },
  });
  await assert.doesNotReject(handler());
});

test("scheduled rescue dispatches at most two jobs and attempts both when one dispatch fails", async () => {
  const dispatched: string[] = [];
  let warnings = 0;
  let cleaned = false;
  const handler = createAuditRescueHandler({
    enabled: () => true,
    cleanup: async () => { cleaned = true; },
    listPending: async (limit) => { assert.equal(cleaned, true); assert.equal(limit, 2); return ["first", "second", "third"]; },
    dispatch: async (id) => { dispatched.push(id); if (id === "first") throw new Error("fixture unreachable"); },
    notificationsEnabled: () => false,
    deliverNotification: async () => { throw new Error("email delivery is disabled"); },
    logFailure: () => { warnings++; },
  });
  await handler();
  assert.deepEqual(dispatched, ["first", "second"]);
  assert.equal(warnings, 1);
});

test("scheduled rescue stops on a failed cleanup and reports a stable failure", async () => {
  let listed = false;
  let warnings = 0;
  const handler = createAuditRescueHandler({
    enabled: () => true,
    cleanup: async () => { throw new Error("sensitive fixture DB error"); },
    listPending: async () => { listed = true; return []; },
    dispatch: async () => {},
    notificationsEnabled: () => false,
    deliverNotification: async () => {},
    logFailure: () => { warnings++; },
  });
  await assert.rejects(handler(), { message: "audit_rescue_unavailable" });
  assert.equal(listed, false);
  assert.equal(warnings, 1);
});

test("scheduled rescue delivers at most one queued notification when explicitly enabled", async () => {
  let deliveries = 0;
  let enabled = false;
  const handler = createAuditRescueHandler({
    enabled: () => true,
    cleanup: async () => {},
    listPending: async () => [],
    dispatch: async () => {},
    notificationsEnabled: () => enabled,
    deliverNotification: async () => { deliveries++; },
    logFailure: () => {},
  });
  await handler();
  assert.equal(deliveries, 0);
  enabled = true;
  await handler();
  assert.equal(deliveries, 1);
});
