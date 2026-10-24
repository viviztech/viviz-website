// Deployment-only audit lifecycle check. It deletes only the audit it creates.
void (async () => {
  const { randomUUID } = await import("node:crypto");
  const base = `http://127.0.0.1:${process.env.PORT || "3000"}`;
  const cookies = new Map();
  const result = { ok: false, statuses: {}, counts: {} };
  let auditId;
  let failure;
  class SmokeFailure extends Error {}
  const require = (condition, code) => { if (!condition) throw new SmokeFailure(code); };
  async function request(path, options = {}, anonymous = false) {
    const headers = new Headers(options.headers);
    headers.set("Origin", base);
    headers.set("Sec-Fetch-Site", "same-origin");
    if (!anonymous && cookies.size) headers.set("Cookie", [...cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(`${base}${path}`, { ...options, headers, redirect: "manual", signal: AbortSignal.timeout(30000) });
    if (!anonymous) for (const header of response.headers.getSetCookie()) {
      const pair = header.split(";", 1)[0];
      const separator = pair.indexOf("=");
      if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    return response;
  }
  function status(name, response, expected) {
    result.statuses[name] = response.status;
    require(response.status === expected, `${name}_unexpected_status`);
  }
  const post = (body) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  async function pdf(name, response) {
    status(name, response, 200);
    require(response.headers.get("content-type")?.startsWith("application/pdf"), `${name}_invalid_type`);
    const bytes = Buffer.from(await response.arrayBuffer());
    require(bytes.subarray(0, 5).toString("ascii") === "%PDF-", `${name}_invalid_pdf`);
    require(response.headers.get("cache-control")?.includes("no-store"), `${name}_not_private`);
    result.counts.pdfsVerified = (result.counts.pdfsVerified || 0) + 1;
  }
  try {
    const created = await request("/api/audits", post({ url: "https://example.com/", idempotencyKey: randomUUID() }));
    status("audit_submit", created, 202);
    const submitted = await created.json();
    require(typeof submitted.audit?.id === "string" && /^[0-9a-f-]{36}$/i.test(submitted.audit.id), "audit_id_missing");
    auditId = submitted.audit.id;
    require(cookies.has("viviz_audit_session"), "audit_owner_cookie_missing");
    const privateResponse = await request(`/api/audits/${auditId}`, {}, true);
    status("audit_anonymous", privateResponse, 404);
    await privateResponse.arrayBuffer();
    const deadline = Date.now() + 600000;
    let audit;
    while (Date.now() < deadline) {
      const polled = await request(`/api/audits/${auditId}`);
      status("audit_poll", polled, 200);
      require(polled.headers.get("cache-control")?.includes("no-store"), "audit_response_not_private");
      audit = (await polled.json()).audit;
      require(Boolean(audit), "audit_poll_invalid");
      result.counts.polls = (result.counts.polls || 0) + 1;
      if (["complete", "partial"].includes(audit.status)) break;
      require(["queued", "running"].includes(audit.status), "audit_scan_failed");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    require(audit && ["complete", "partial"].includes(audit.status), "audit_poll_timeout");
    require(audit.progress?.checked > 0 && Number.isInteger(audit.revision), "audit_observations_missing");
    const report = audit.report;
    require(report && typeof report.summary === "string" && report.summary.trim().length > 0 && Array.isArray(report.gaps) && Array.isArray(report.improvements), "customer_report_invalid");
    require(!["pages", "findings", "recommendations", "performance", "fieldPerformance", "categories", "checks", "collectionMode"].some((key) => Object.hasOwn(report, key)), "customer_technical_data_exposed");
    result.counts.pagesChecked = audit.progress.checked;
    result.counts.gaps = report.gaps.length;
    result.counts.improvements = report.improvements.length;
    const directReport = await request(`/api/audits/${auditId}/report`);
    status("report_get_gate", directReport, 405);
    require(directReport.headers.get("allow") === "POST", "report_gate_invalid");
    await directReport.arrayBuffer();
    const missingDetails = await request(`/api/audits/${auditId}/report`, post({}));
    status("report_contact_gate", missingDetails, 400);
    await missingDetails.arrayBuffer();
    await pdf("customer_pdf", await request(`/api/audits/${auditId}/report`, post({
      revision: audit.revision, idempotencyKey: randomUUID(),
      name: "Viviz Deployment Check", email: "deployment-check@fixture.example",
    })));
    const unauthorizedTechnical = await request(`/api/invoices/website-audits/${auditId}/report`);
    status("technical_staff_gate", unauthorizedTechnical, 401);
    await unauthorizedTechnical.arrayBuffer();
    require(Boolean(process.env.INVOICE_PASSWORD), "staff_password_missing");
    const login = await request("/api/invoice-auth", post({ password: process.env.INVOICE_PASSWORD }));
    status("staff_login", login, 200);
    require((await login.json()).success === true && cookies.has("invoice_session"), "staff_session_missing");
    await pdf("technical_pdf", await request(`/api/invoices/website-audits/${auditId}/report`));
  } catch (error) {
    failure = error instanceof SmokeFailure ? error.message : "audit_smoke_request_failed";
  } finally {
    if (auditId) {
      try {
        const deleted = await request(`/api/audits/${auditId}`, { method: "DELETE" });
        status("audit_delete", deleted, 200);
        require((await deleted.json()).ok === true, "audit_delete_invalid");
        const removed = await request(`/api/audits/${auditId}`);
        status("audit_deleted_read", removed, 404);
        await removed.arrayBuffer();
      } catch (error) {
        result.cleanupCode = error instanceof SmokeFailure ? error.message : "audit_cleanup_request_failed";
        failure ||= "audit_cleanup_failed";
      }
    }
  }
  result.ok = !failure;
  if (failure) { result.code = failure; process.exitCode = 1; }
  console.log(JSON.stringify(result));
})().catch(() => {
  console.log(JSON.stringify({ ok: false, code: "audit_smoke_unavailable" }));
  process.exitCode = 1;
});
