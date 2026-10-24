import assert from "node:assert/strict";
import test from "node:test";
import { canonicalCrawlUrl, createWebsiteCrawler, extractPage, extractSitemap } from "../lib/website-audit/crawler";
import { AuditNetworkError, createSafeRequester, type SafeResponse } from "../lib/website-audit/network";
import { parseCrux, parsePageSpeed } from "../lib/website-audit/providers";
import { parseRobots } from "../lib/website-audit/robots";

type Fixture = { body: string; status?: number; headers?: Record<string, string> };
function fixtureCrawler(fixtures: Record<string, Fixture>) {
  const calls: string[] = [];
  const times: number[] = [];
  let clock = 1000;
  const request = createSafeRequester({ resolve: async () => [{ address: "93.184.215.14", family: 4 }], transport: async (url) => {
    calls.push(url.toString()); times.push(clock);
    const item = fixtures[url.toString()] || fixtures[url.pathname] || { body: "Not found", status: 404 };
    return { url: url.toString(), statusCode: item.status || 200, headers: { "content-type": url.pathname.endsWith(".txt") ? "text/plain" : url.pathname.endsWith(".xml") ? "application/xml" : "text/html", ...item.headers }, body: item.body, bytes: Buffer.byteLength(item.body) } as Omit<SafeResponse, "redirects">;
  } });
  const crawl = createWebsiteCrawler({ request, now: () => clock, wait: async (ms) => { clock += ms; }, measure: async () => ({ performance: [], fieldPerformance: { status: "unavailable", reason: "Fixture has no external measurement." }, limitations: [] }) });
  return { calls, times, crawl };
}

test("robots combines matching groups, applies longest allow and treats rules case-sensitively", () => {
  const policy = parseRobots("https://example.com", "User-agent: *\nDisallow: /wildcard\n\nUser-agent: VivizAuditBot\nDisallow: /private\nAllow: /private/public\n\nUser-agent: VivizAuditBot\nDisallow: /other\nCrawl-delay: 2\nSitemap: https://example.com/sitemap.xml");
  assert.equal(policy.allowed("https://example.com/private/secret"), false);
  assert.equal(policy.allowed("https://example.com/private/public/info"), true);
  assert.equal(policy.allowed("https://example.com/other"), false);
  assert.equal(policy.allowed("https://example.com/Private"), true);
  assert.equal(policy.allowed("https://example.com/wildcard"), true);
  assert.equal(policy.crawlDelayMs, 2000);
  assert.equal(policy.sitemapUrls.length, 1);
});

test("extracts bounded evidence and semantic form labels without counting placeholders as labels", () => {
  const page = extractPage("https://example.com/contact", `<html lang="en"><head><title> Contact us </title><meta name="description" content="Talk to us"><meta name="viewport" content="width=device-width"><link rel="canonical" href="/contact"></head><body><nav><a href="/services">Services</a></nav><h1>Contact</h1><form action="/send"><label for="name">Full name</label><input id="name" name="name" required><input name="email" type="email" placeholder="Email"><span id="message-label">Your message</span><textarea aria-labelledby="message-label"></textarea><label>Company <input name="company"></label><input type="hidden" name="token" value="secret"></form><img src="/photo.jpg"><img src="/decorative.jpg" alt=""><script type="application/ld+json">{"@type":"LocalBusiness"}</script><script>evil instructions</script><footer>Call 123</footer></body></html>`);
  assert.equal(page.title, "Contact us");
  assert.equal(page.canonical, "https://example.com/contact");
  assert.equal(page.forms[0].inputs.length, 4);
  assert.equal(page.forms[0].inputs[0].label, "Full name");
  assert.equal(page.forms[0].inputs[1].label, "");
  assert.equal(page.forms[0].inputs[2].label, "Your message");
  assert.equal(page.forms[0].inputs[3].label, "Company");
  assert.equal(page.images[0].alt, null);
  assert.equal(page.images[1].alt, "");
  assert.deepEqual(page.structuredData, [{ valid: true, types: ["LocalBusiness"] }]);
  assert.ok(page.text.includes("Services") && page.text.includes("Call 123"));
  assert.ok(!page.text.includes("evil instructions") && !page.text.includes("secret"));
  assert.equal(extractPage("https://example.com", `<body>${"x".repeat(20000)}</body>`).text.length, 12000);
});

test("sitemap parsing rejects entity declarations and distinguishes indexes", () => {
  assert.deepEqual(extractSitemap('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/a?x=1&amp;y=2</loc></url></urlset>').pages, ["https://example.com/a?x=1&y=2"]);
  assert.deepEqual(extractSitemap("<sitemapindex><sitemap><loc>https://example.com/pages.xml</loc></sitemap></sitemapindex>").indexes, ["https://example.com/pages.xml"]);
  assert.throws(() => extractSitemap('<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><urlset><url><loc>&xxe;</loc></url></urlset>'), AuditNetworkError);
});

test("query traps, actions, external origins and downloads are excluded", () => {
  for (const input of ["/login", "/%6cogout", "/cart/add", "/checkout", "/calendar/2026", "/search?q=a", "/item?id=1", "/file.pdf", "https://other.com/services", "/?action=delete"]) assert.equal(canonicalCrawlUrl(input, "https://example.com"), null, input);
  assert.equal(canonicalCrawlUrl("/services?utm_source=test#part", "https://example.com"), "https://example.com/services");
});

test("crawls no more than 25 pages, deduplicates, obeys robots and only follows the approved origin", async () => {
  const links = Array.from({ length: 80 }, (_, index) => `<a href="/page-${index}">Page</a>`).join("");
  const fixtures: Record<string, Fixture> = {
    "/robots.txt": { body: "User-agent: *\nDisallow: /private\nCrawl-delay: 1" },
    "/": { body: `<html><h1>Business</h1>${links}<a href="/contact">Contact</a><a href="/private">Private</a><a href="/contact?utm_source=x">Duplicate</a><a href="https://other.com/path">External</a><a href="/login">Login</a></html>` },
    "/contact": { body: "<h1>Contact</h1>" },
    "/sitemap.xml": { body: "<urlset><url><loc>https://example.com/services</loc></url></urlset>" },
    "/services": { body: "<h1>Services</h1>" },
  };
  for (let index = 0; index < 80; index++) fixtures[`/page-${index}`] = { body: `<h1>Page ${index}</h1>` };
  const { crawl, calls, times } = fixtureCrawler(fixtures);
  const progress: number[] = [];
  const result = await crawl("https://example.com", { onProgress: async (value) => { progress.push(value.checked); } });
  assert.equal(result.pages.length, 25);
  assert.ok(result.discovered > 25);
  assert.ok(result.pages.some((page) => page.url.endsWith("/services")));
  assert.ok(result.pages.some((page) => page.url.endsWith("/contact")));
  assert.equal(calls.filter((url) => url.endsWith("/contact")).length, 1);
  assert.ok(calls.every((url) => new URL(url).origin === "https://example.com"));
  assert.ok(!calls.some((url) => /private|login|utm_source/.test(url)));
  assert.equal(progress.at(-1), 25);
  for (let index = 1; index < times.length; index++) assert.ok(times[index] - times[index - 1] >= 1000, "rate limit applies between actual requests");
});

test("unreachable robots and access challenges stop collection without bypass", async () => {
  for (const fixture of [{ body: "unavailable", status: 503 }, { body: "denied", status: 403 }]) {
    const { crawl, calls } = fixtureCrawler({ "/robots.txt": fixture });
    const result = await crawl("https://example.com");
    assert.equal(result.pages[0].status, "blocked");
    assert.deepEqual(calls, ["https://example.com/robots.txt"]);
  }
  const { crawl, calls } = fixtureCrawler({ "/robots.txt": { body: "", status: 404 }, "/": { body: "<title>Verify you are human</title>" } });
  assert.equal((await crawl("https://example.com")).pages[0].status, "blocked");
  assert.equal(calls.length, 2);
});

test("redirects cannot fetch a disallowed page or unrelated origin", async () => {
  const disallowed = fixtureCrawler({ "/robots.txt": { body: "User-agent: *\nDisallow: /private" }, "/": { body: "", status: 302, headers: { location: "/private" } } });
  assert.equal((await disallowed.crawl("https://example.com")).pages[0].status, "blocked");
  assert.ok(!disallowed.calls.some((url) => url.endsWith("/private")));
  const external = fixtureCrawler({ "/robots.txt": { body: "", status: 404 }, "/": { body: "", status: 302, headers: { location: "https://other.com/" } } });
  assert.equal((await external.crawl("https://example.com")).pages[0].status, "failed");
  assert.ok(external.calls.every((url) => new URL(url).hostname === "example.com"));
});

test("canonical www redirects establish a new approved origin after checking its robots", async () => {
  const { crawl, calls } = fixtureCrawler({
    "/robots.txt": { body: "User-agent: *\nDisallow: /private" },
    "https://example.com/": { body: "", status: 301, headers: { location: "https://www.example.com/" } },
    "https://www.example.com/": { body: '<h1>Home</h1><a href="/contact">Contact</a><a href="https://example.com/old">Old origin</a>' },
    "/contact": { body: "<h1>Contact</h1>" },
  });
  const result = await crawl("https://example.com");
  assert.equal(result.pages[0].url, "https://www.example.com/");
  assert.ok(calls.indexOf("https://www.example.com/robots.txt") < calls.indexOf("https://www.example.com/"));
  assert.ok(calls.includes("https://www.example.com/contact"));
  assert.ok(!calls.includes("https://example.com/old"));
});

test("size budget counts rejected oversized responses and ends with a partial crawl", async () => {
  const fixtures: Record<string, Fixture> = {
    "/robots.txt": { body: "", status: 404 },
    "/": { body: Array.from({ length: 30 }, (_, index) => `<a href="/large-${index}">Large</a>`).join("") },
  };
  for (let index = 0; index < 30; index++) fixtures[`/large-${index}`] = { body: "x".repeat(2 * 1024 * 1024 + 1) };
  const { crawl, calls } = fixtureCrawler(fixtures);
  const result = await crawl("https://example.com");
  assert.ok(result.pages.length < 25);
  assert.ok(calls.length < 16);
  assert.ok(result.limitations.some((note) => /size budget/.test(note)));
});

test("cancellation stops new requests and is propagated to the worker", async () => {
  const { crawl, calls } = fixtureCrawler({});
  await assert.rejects(crawl("https://example.com", { shouldContinue: async () => false }), (error: unknown) => error instanceof AuditNetworkError && error.code === "CANCELED");
  assert.equal(calls.length, 0);
});

test("PSI keeps laboratory TBT distinct from CrUX INP, with URL/origin provenance", () => {
  const psi = parsePageSpeed("https://example.com/", "mobile", { lighthouseResult: { lighthouseVersion: "13.0", finalUrl: "https://example.com/", categories: { performance: { score: 0.91 } }, audits: { "largest-contentful-paint": { numericValue: 2200 }, "total-blocking-time": { numericValue: 80 } } } });
  assert.equal(psi.scores?.performance, 91);
  assert.equal(psi.metrics?.tbtMs, 80);
  assert.equal(psi.scores?.accessibility, null);
  const crux = parseCrux({ record: { metrics: { largest_contentful_paint: { percentiles: { p75: 2400 } }, interaction_to_next_paint: { percentiles: { p75: 180 } }, cumulative_layout_shift: { percentiles: { p75: "0.07" } } }, collectionPeriod: { firstDate: { year: 2026, month: 9, day: 1 }, lastDate: { year: 2026, month: 9, day: 28 } } } }, "origin", "https://example.com");
  assert.equal(crux.scope, "origin"); assert.equal(crux.inpMs, 180); assert.equal(crux.cls, 0.07); assert.equal(crux.startDate, "2026-09-01");
  assert.equal(parseCrux({}, "url", "https://example.com/").status, "unavailable");
});
