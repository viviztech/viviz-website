import assert from "node:assert/strict";
import test from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";
import { buildSessionToken } from "../lib/session-token";
import { getStaffAudit, listStaffAudits } from "../lib/website-audit/staff";
import { AuditError } from "../lib/website-audit/errors";

const reportPath = "/api/invoices/website-audits/11111111-1111-4111-8111-111111111111/report";

function request(path: string, cookie?: string) {
  return new NextRequest(`https://viviz.example${path}`, { headers: cookie ? { cookie } : {} });
}

function assertPrivate(response: Response) {
  assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/);
  assert.match(response.headers.get("x-robots-tag") ?? "", /noindex/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
}

test("technical report access requires the signed Viviz staff session, not an audit owner cookie", () => {
  const previousPassword = process.env.INVOICE_PASSWORD;
  const previousSecret = process.env.INVOICE_SESSION_SECRET;
  process.env.INVOICE_PASSWORD = "test-staff-password";
  process.env.INVOICE_SESSION_SECRET = "test-only-audit-staff-session-secret";
  try {
    for (const cookie of [undefined, `viviz_audit_session=${"a".repeat(64)}`, `invoice_session=${Date.now() + 60000}.${"0".repeat(64)}`]) {
      const response = proxy(request(reportPath, cookie));
      assert.equal(response.status, 401);
      assertPrivate(response);
    }
    const page = proxy(request("/invoice/website-audits", `viviz_audit_session=${"a".repeat(64)}`));
    assert.equal(page.status, 307);
    assert.equal(new URL(page.headers.get("location")!).pathname, "/invoice/login");
    assertPrivate(page);

    const token = buildSessionToken(Date.now() + 60000);
    for (const path of [reportPath, "/invoice/website-audits", "/invoice/website-audits/11111111-1111-4111-8111-111111111111"]) {
      const authorized = proxy(request(path, `invoice_session=${token}`));
      assert.equal(authorized.status, 200);
      assert.equal(authorized.headers.get("x-middleware-next"), "1");
      assertPrivate(authorized);
    }
  } finally {
    if (previousPassword === undefined) delete process.env.INVOICE_PASSWORD; else process.env.INVOICE_PASSWORD = previousPassword;
    if (previousSecret === undefined) delete process.env.INVOICE_SESSION_SECRET; else process.env.INVOICE_SESSION_SECRET = previousSecret;
  }
});

test("technical report API and data boundary fail closed when staff configuration is missing", async () => {
  const previousPassword = process.env.INVOICE_PASSWORD;
  const previousSecret = process.env.INVOICE_SESSION_SECRET;
  try {
    for (const missing of ["INVOICE_PASSWORD", "INVOICE_SESSION_SECRET"] as const) {
      process.env.INVOICE_PASSWORD = "test-staff-password";
      process.env.INVOICE_SESSION_SECRET = "test-only-audit-staff-session-secret";
      delete process.env[missing];
      const response = proxy(request(reportPath, `viviz_audit_session=${"a".repeat(64)}`));
      assert.equal(response.status, 503);
      assertPrivate(response);
      assert.match((await response.json()).error, /not configured/);
      const unavailable = (error: unknown) => error instanceof AuditError && error.status === 503;
      await assert.rejects(listStaffAudits(), unavailable);
      await assert.rejects(getStaffAudit("11111111-1111-4111-8111-111111111111"), unavailable);
    }
  } finally {
    if (previousPassword === undefined) delete process.env.INVOICE_PASSWORD; else process.env.INVOICE_PASSWORD = previousPassword;
    if (previousSecret === undefined) delete process.env.INVOICE_SESSION_SECRET; else process.env.INVOICE_SESSION_SECRET = previousSecret;
  }
});
