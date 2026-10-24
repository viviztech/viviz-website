// Deployment-only HTTP checks. Output contains status codes and counts, never records.
void (async () => {
  const base = `http://127.0.0.1:${process.env.PORT || "3000"}`;
  const cookies = new Map();
  const result = { ok: false, statuses: {}, counts: {}, skipped: [] };
  class SmokeFailure extends Error {}
  const require = (condition, code) => { if (!condition) throw new SmokeFailure(code); };
  async function request(path, options = {}) {
    const headers = new Headers(options.headers);
    headers.set("Origin", base);
    headers.set("Sec-Fetch-Site", "same-origin");
    if (cookies.size) headers.set("Cookie", [...cookies].map(([name, value]) => `${name}=${value}`).join("; "));
    const response = await fetch(`${base}${path}`, { ...options, headers, redirect: "manual", signal: AbortSignal.timeout(30000) });
    for (const header of response.headers.getSetCookie()) {
      const pair = header.split(";", 1)[0];
      const separator = pair.indexOf("=");
      if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
    return response;
  }
  function status(name, response, expected = 200) {
    result.statuses[name] = response.status;
    require(response.status === expected, `${name}_unexpected_status`);
  }
  async function pdf(name, path) {
    const response = await request(path);
    status(name, response);
    require(response.headers.get("content-type")?.startsWith("application/pdf"), `${name}_invalid_type`);
    const bytes = Buffer.from(await response.arrayBuffer());
    require(bytes.subarray(0, 5).toString("ascii") === "%PDF-", `${name}_invalid_pdf`);
    result.counts.pdfsVerified = (result.counts.pdfsVerified || 0) + 1;
  }
  try {
    const health = await request("/api/health");
    status("health", health);
    require((await health.json()).status === "ok", "health_invalid_body");
    const home = await request("/");
    status("home", home);
    require(home.headers.get("content-type")?.includes("text/html"), "home_invalid_type");
    await home.arrayBuffer();
    for (const [name, path, type] of [["logo", "/logo.jpg", "image/jpeg"], ["signature", "/sign-ganesh.png", "image/png"]]) {
      const response = await request(path);
      status(name, response);
      require(response.headers.get("content-type")?.startsWith(type), `${name}_invalid_type`);
      require((await response.arrayBuffer()).byteLength > 0, `${name}_empty`);
    }
    const unauthorized = await request("/api/invoices");
    status("staff_unauthorized", unauthorized, 401);
    await unauthorized.arrayBuffer();
    require(Boolean(process.env.INVOICE_PASSWORD), "staff_password_missing");
    const login = await request("/api/invoice-auth", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: process.env.INVOICE_PASSWORD }),
    });
    status("staff_login", login);
    require((await login.json()).success === true && cookies.has("invoice_session"), "staff_session_missing");
    const invoiceResponse = await request("/api/invoices");
    status("invoices", invoiceResponse);
    const invoiceData = await invoiceResponse.json();
    require(Array.isArray(invoiceData.invoices), "invoice_list_invalid");
    result.counts.invoices = invoiceData.invoices.length;
    const invoice = invoiceData.invoices.find((item) => Number.isSafeInteger(item.id) && item.id > 0);
    require(Boolean(invoice), "existing_invoice_missing");
    await pdf("invoice_pdf", `/api/invoices/${invoice.id}/pdf`);
    const employeeResponse = await request("/employees");
    status("employees", employeeResponse);
    const employeeHtml = await employeeResponse.text();
    const offerPaths = [...new Set([...employeeHtml.matchAll(/href="(\/api\/employees\/\d+\/offer-letter)"/g)].map((match) => match[1]))];
    result.counts.employees = offerPaths.length;
    let offerPath = offerPaths[0];
    if (!offerPath && process.env.SMOKE_EMPLOYEE_ID) {
      const employeeId = Number(process.env.SMOKE_EMPLOYEE_ID);
      require(Number.isSafeInteger(employeeId) && employeeId > 0, "employee_id_invalid");
      offerPath = `/api/employees/${employeeId}/offer-letter`;
    }
    if (offerPath) await pdf("employee_offer_pdf", offerPath);
    else result.skipped.push("employee_offer_pdf_no_existing_id");
    result.ok = true;
  } catch (error) {
    result.code = error instanceof SmokeFailure ? error.message : "web_smoke_request_failed";
    process.exitCode = 1;
  }
  console.log(JSON.stringify(result));
})().catch(() => {
  console.log(JSON.stringify({ ok: false, code: "web_smoke_unavailable" }));
  process.exitCode = 1;
});
