import assert from "node:assert/strict";
import test from "node:test";
import { requireSameOrigin, readAuditBody } from "../lib/website-audit/http";
import { AuditError } from "../lib/website-audit/errors";
import { createAuditSchema } from "../lib/website-audit/validation";

test("same-origin guard uses external Host when Next reconstructs an internal URL", () => {
  const request = new Request("http://localhost:3100/api/audits", { method: "POST", headers: { Host: "127.0.0.1:3100", Origin: "http://127.0.0.1:3100", "sec-fetch-site": "same-origin" } });
  assert.doesNotThrow(() => requireSameOrigin(request));
});

test("origin guard rejects missing, malformed and mismatched browser origins", () => {
  for (const origin of [undefined, "null", "not a URL", "https://evil.example", "http://localhost:3100", "https://127.0.0.1:3100"]) {
    const headers = new Headers({ Host: "127.0.0.1:3100" });
    if (origin) headers.set("origin", origin);
    assert.throws(() => requireSameOrigin(new Request("http://localhost:3100/api/audits", { method: "POST", headers })), (error: unknown) => error instanceof AuditError && error.status === 403);
  }
  assert.throws(() => requireSameOrigin(new Request("https://viviz.in/api/audits", { method: "POST", headers: { Origin: "https://viviz.in", Host: "viviz.in", "sec-fetch-site": "cross-site" } })), AuditError);
});

test("audit body parsing rejects oversized or malformed JSON before validation", async () => {
  for (const body of ["{broken", JSON.stringify({ value: "x".repeat(17000) })]) {
    await assert.rejects(readAuditBody(new Request("https://viviz.in/api/audits", { method: "POST", headers: { "Content-Type": "application/json" }, body }), createAuditSchema), AuditError);
  }
  const input = { url: "https://example.com/", idempotencyKey: "test-body-contract" };
  const parsed = await readAuditBody(new Request("https://viviz.in/api/audits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }), createAuditSchema);
  assert.deepEqual(parsed, input);
});
