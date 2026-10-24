import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import test from "node:test";
import { AuditError } from "../lib/website-audit/errors";
import { checkAuditWorkerConnection, dispatchAuditJob, getAuditExecutionConfig, verifyAuditInvocation, verifyAuditWorkerProbe } from "../lib/website-audit/execution";

const endpoint = "https://viviz-fixture-worker.netlify.app/.netlify/functions/audit";
const secret = "fixture-only-" + "a".repeat(52);

async function configured(run: () => Promise<void> | void) {
  const keys = ["AUDIT_EXECUTION_MODE", "AUDIT_WORKER_URL", "AUDIT_WORKER_SECRET"];
  const before = keys.map(key => process.env[key]);
  process.env.AUDIT_EXECUTION_MODE = "netlify";
  process.env.AUDIT_WORKER_URL = endpoint;
  process.env.AUDIT_WORKER_SECRET = secret;
  try { await run(); }
  finally { keys.forEach((key, i) => { if (before[i] === undefined) delete process.env[key]; else process.env[key] = before[i]; }); }
}

function signed(body: string, timestamp = Date.now(), purpose = "audit-job") {
  return {
    "content-type": "application/json",
    "x-viviz-audit-timestamp": String(timestamp),
    "x-viviz-audit-signature": createHmac("sha256", secret).update(`${timestamp}.${purpose}.${body}`).digest("hex"),
  };
}

test("Netlify configuration accepts only the fixed HTTPS worker endpoint and a strong signing secret", () => configured(() => {
  assert.equal(getAuditExecutionConfig()?.mode, "netlify");
  for (const invalid of ["http://viviz-fixture-worker.netlify.app/.netlify/functions/audit", "https://evil.example/.netlify/functions/audit", "https://viviz-fixture-worker.netlify.app.evil.example/.netlify/functions/audit", "https://user:pass@viviz-fixture-worker.netlify.app/.netlify/functions/audit", endpoint + "?token=secret", endpoint + "#fragment", endpoint + "/other", endpoint.replace(".netlify.app/", ".netlify.app:9000/")]) {
    process.env.AUDIT_WORKER_URL = invalid;
    assert.equal(getAuditExecutionConfig(), null);
  }
  process.env.AUDIT_WORKER_URL = endpoint;
  process.env.AUDIT_WORKER_SECRET = "short";
  assert.equal(getAuditExecutionConfig(), null);
  process.env.AUDIT_EXECUTION_MODE = "unknown";
  assert.equal(getAuditExecutionConfig(), null);
  delete process.env.AUDIT_EXECUTION_MODE;
  assert.deepEqual(getAuditExecutionConfig(), { mode: "standalone" });
}));

test("dispatch sends only a signed audit ID, and the receiving worker authenticates it", () => configured(async () => {
  const auditId = randomUUID();
  let calls = 0;
  await dispatchAuditJob(auditId, async (input, init) => {
    calls++;
    const request = new Request(input, init);
    assert.equal(request.url, endpoint);
    assert.equal(init?.redirect, "error");
    const raw = await request.clone().text();
    assert.deepEqual(JSON.parse(raw), { auditId });
    assert.ok(!raw.includes(secret));
    assert.deepEqual(await verifyAuditInvocation(request), { auditId });
    return new Response(null, { status: 202 });
  });
  assert.equal(calls, 1);
}));

test("callbacks reject forged, altered, expired or future signatures and unexpected job data", () => configured(async () => {
  const body = JSON.stringify({ auditId: randomUUID() });
  const requests = [
    new Request(endpoint, { method: "POST", body }),
    new Request(endpoint, { method: "POST", headers: signed(body), body: JSON.stringify({ auditId: randomUUID() }) }),
    new Request(endpoint, { method: "POST", headers: signed(body, Date.now() - 601000), body }),
    new Request(endpoint, { method: "POST", headers: signed(body, Date.now() + 65000), body }),
    new Request(endpoint, { method: "POST", headers: signed(body, Date.now(), "audit-health"), body }),
    new Request(endpoint, { method: "POST", headers: signed(body), body: body + "x".repeat(1024) }),
  ];
  for (const input of ["{broken", JSON.stringify({ auditId: "not-a-uuid" }), JSON.stringify({ auditId: randomUUID(), url: "https://private.example/" }), JSON.stringify([randomUUID()])]) {
    requests.push(new Request(endpoint, { method: "POST", headers: signed(input), body: input }));
  }
  for (const request of requests) assert.equal(await verifyAuditInvocation(request), null);
}));

test("retry deliveries within the provider retry window retain valid signatures", () => configured(async () => {
  const auditId = randomUUID();
  const body = JSON.stringify({ auditId });
  assert.deepEqual(await verifyAuditInvocation(new Request(endpoint, { method: "POST", headers: signed(body, Date.now() - 240000), body })), { auditId });
}));

test("the health probe uses a separate signature and rejects an incorrect shared secret", () => configured(async () => {
  let calls = 0;
  const result = await checkAuditWorkerConnection(async (input, init) => {
    calls++;
    const request = new Request(input, init);
    assert.equal(new URL(request.url).pathname, "/.netlify/functions/audit-health");
    assert.equal(verifyAuditWorkerProbe(request), true);
    process.env.AUDIT_WORKER_SECRET = "different-fixture-" + "b".repeat(48);
    assert.equal(verifyAuditWorkerProbe(request), false);
    process.env.AUDIT_WORKER_SECRET = secret;
    return Response.json({ ready: true, code: "ready" });
  });
  assert.deepEqual(result, { ready: true, code: "ready" });
  assert.equal(calls, 1);
  const body = JSON.stringify({ auditId: randomUUID() });
  assert.equal(verifyAuditWorkerProbe(new Request(endpoint, { headers: signed(body) })), false);
}));

test("unreachable, redirected and unready workers fail before an audit is submitted", () => configured(async () => {
  for (const response of [new Response(null, { status: 401 }), Response.json({ ready: false, code: "audit_schema_missing" }), Response.json({ ready: true, code: "unexpected" }), new Response("not-json")]) {
    assert.equal((await checkAuditWorkerConnection(async () => response)).ready, false);
  }
  assert.equal((await checkAuditWorkerConnection(async () => { throw new Error("private endpoint diagnostic"); })).ready, false);
  await assert.rejects(dispatchAuditJob(randomUUID(), async () => new Response(null, { status: 500 })), (error: unknown) => error instanceof AuditError && error.status === 503 && !error.message.includes("private"));
}));

test("standalone mode makes no HTTP calls; invalid configuration never sends the secret", () => configured(async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; throw new Error("must not fetch"); };
  process.env.AUDIT_EXECUTION_MODE = "standalone";
  await dispatchAuditJob(randomUUID(), fetcher);
  assert.deepEqual(await checkAuditWorkerConnection(fetcher), { ready: true, code: "standalone" });
  process.env.AUDIT_EXECUTION_MODE = "netlify";
  process.env.AUDIT_WORKER_URL = "https://attacker.example/";
  await assert.rejects(dispatchAuditJob(randomUUID(), fetcher), AuditError);
  assert.equal((await checkAuditWorkerConnection(fetcher)).ready, false);
  assert.equal(calls, 0);
}));
