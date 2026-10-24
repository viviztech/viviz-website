import assert from "node:assert/strict";
import test from "node:test";
import { assertPublicAddress, AuditNetworkError, createSafeRequester, normalizeAuditUrl, type PinnedTransport } from "../lib/website-audit/network";

const publicAnswers = async () => [{ address: "93.184.215.14", family: 4 as const }];
const html: PinnedTransport = async (url) => ({ url: url.toString(), statusCode: 200, headers: { "content-type": "text/html" }, body: "<h1>Public page</h1>", bytes: 21 });
const code = (value: string) => (error: unknown) => error instanceof AuditNetworkError && error.code === value;

test("normalizes a domain and rejects schemes, credentials, ports and local hosts", () => {
  assert.equal(normalizeAuditUrl(" example.com/path#section "), "https://example.com/path");
  for (const input of ["file:///etc/passwd", "ftp://example.com", "https://user:pass@example.com", "https://example.com:8443", "http://localhost", "http://metadata.google.internal", "http://intranet", "https://example.com./", "https://example.com\\@127.0.0.1/"]) assert.throws(() => normalizeAuditUrl(input), AuditNetworkError, input);
});

test("rejects non-public IPv4, encoded IPv4 and IPv6 including mapped and transition ranges", () => {
  for (const address of ["0.0.0.0", "10.0.0.1", "127.0.0.1", "169.254.169.254", "172.16.1.1", "192.168.1.1", "100.64.0.1", "192.0.0.9", "192.0.2.1", "198.18.0.1", "198.51.100.1", "203.0.113.1", "224.0.0.1", "255.255.255.255", "::", "::1", "fe80::1", "fc00::1", "ff02::1", "::ffff:127.0.0.1", "::ffff:8.8.8.8", "64:ff9b::7f00:1", "2001:db8::1", "2001::1", "2002:7f00:1::", "3fff::1"]) assert.throws(() => assertPublicAddress(address), AuditNetworkError, address);
  for (const input of ["http://2130706433", "http://0177.0.0.1", "http://0x7f000001", "http://127.1", "http://[::ffff:127.0.0.1]/"]) assert.throws(() => normalizeAuditUrl(input), AuditNetworkError, input);
  assert.doesNotThrow(() => assertPublicAddress("8.8.8.8"));
  assert.doesNotThrow(() => assertPublicAddress("2606:4700:4700::1111"));
});

test("rejects mixed DNS answers and never calls the transport", async () => {
  let transported = false;
  const request = createSafeRequester({ resolve: async () => [{ address: "8.8.8.8", family: 4 }, { address: "10.1.1.1", family: 4 }], transport: async (...args) => { transported = true; return html(...args); } });
  await assert.rejects(request("https://example.com"), code("PRIVATE_ADDRESS"));
  assert.equal(transported, false);
});

test("pins the transport to the validated IP while retaining the original host", async () => {
  const request = createSafeRequester({ resolve: publicAnswers, transport: async (url, address, settings) => {
    assert.equal(url.hostname, "example.com");
    assert.equal(address.address, "93.184.215.14");
    return html(url, address, settings);
  } });
  assert.equal((await request("https://example.com")).statusCode, 200);
});

test("revalidates every redirect and rejects DNS rebinding", async () => {
  let resolutions = 0;
  let calls = 0;
  const request = createSafeRequester({ resolve: async () => [{ address: ++resolutions === 1 ? "8.8.8.8" : "127.0.0.1", family: 4 }], transport: async (url) => { calls++; return { url: url.toString(), statusCode: 302, headers: { location: "/next" }, body: "", bytes: 0 }; } });
  await assert.rejects(request("https://example.com"), code("PRIVATE_ADDRESS"));
  assert.equal(calls, 1);
});

test("rejects private redirect targets, cross-origin redirects and excessive redirects", async () => {
  for (const location of ["http://169.254.169.254/latest/meta-data", "http://[::1]/", "http://user:pass@example.com/"]) {
    const request = createSafeRequester({ resolve: publicAnswers, transport: async (url) => ({ url: url.toString(), statusCode: 302, headers: { location }, body: "", bytes: 0 }) });
    await assert.rejects(request("https://example.com"), AuditNetworkError);
  }
  const cross = createSafeRequester({ resolve: publicAnswers, transport: async (url) => ({ url: url.toString(), statusCode: 302, headers: { location: "https://other.com/" }, body: "", bytes: 0 }) });
  await assert.rejects(cross("https://example.com", { canRedirect: (from, to) => from.origin === to.origin }), code("REDIRECT_SCOPE"));
  await assert.rejects(cross("https://example.com"), code("REDIRECT_LIMIT"));
});

test("enforces byte, MIME and encoding limits, including bytes accumulated across redirects", async () => {
  const oversized = createSafeRequester({ resolve: publicAnswers, transport: async (url) => ({ url: url.toString(), statusCode: 200, headers: {}, body: "0123456789", bytes: 10 }) });
  await assert.rejects(oversized("https://example.com", { maxBytes: 5 }), code("RESPONSE_TOO_LARGE"));
  const type = createSafeRequester({ resolve: publicAnswers, transport: async (url) => ({ url: url.toString(), statusCode: 200, headers: { "content-type": "application/pdf" }, body: "pdf", bytes: 3 }) });
  await assert.rejects(type("https://example.com", { contentTypes: ["text/html"] }), code("CONTENT_TYPE"));
  const encoded = createSafeRequester({ resolve: publicAnswers, transport: async (url) => ({ url: url.toString(), statusCode: 200, headers: { "content-encoding": "gzip" }, body: "bytes", bytes: 5 }) });
  await assert.rejects(encoded("https://example.com"), code("CONTENT_ENCODING"));
  const chain = createSafeRequester({ resolve: publicAnswers, transport: async (url) => ({ url: url.toString(), statusCode: url.pathname === "/" ? 302 : 200, headers: { location: "/end" }, body: "abc", bytes: 3 }) });
  await assert.rejects(chain("https://example.com", { maxBytes: 5 }), code("RESPONSE_TOO_LARGE"));
});

test("all collection, including robots and sitemap redirects, rejects transaction action routes", async () => {
  let calls = 0;
  const direct = createSafeRequester({ resolve: publicAnswers, transport: async (...args) => { calls++; return html(...args); } });
  await assert.rejects(direct("https://example.com/logout"), code("ACTION_URL"));
  await assert.rejects(direct("https://example.com/sitemap.xml?action=delete"), code("ACTION_URL"));
  assert.equal(calls, 0);
  const redirected = createSafeRequester({ resolve: publicAnswers, transport: async (url) => { calls++; return { url: url.toString(), statusCode: 302, headers: { location: "/cart/add" }, body: "", bytes: 0 }; } });
  await assert.rejects(redirected("https://example.com/robots.txt"), code("ACTION_URL"));
  assert.equal(calls, 1);
});
