import * as cheerio from "cheerio";
import { PAGE_LIMIT, type CrawlProgress, type CrawlResult, type PageObservation } from "./types";
import { AuditNetworkError, networkErrorMessage, normalizeAuditUrl, safeRequest, type RequestOptions, type SafeRequester } from "./network";
import { loadRobots, type RobotsPolicy } from "./robots";
import { collectMeasurements } from "./providers";

const MAX_DISCOVERED = 500;
const MAX_REQUESTS = 80;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const MAX_CRAWL_MS = 330000;
const excludedPath = /(?:^|\/)(?:log-?in|log-?out|sign-?in|sign-?out|register|account|accounts|admin|wp-admin|cart|basket|checkout|api|calendar|search)(?:\/|$)/i;
const filePath = /\.(?:pdf|zip|gz|rar|7z|jpe?g|png|gif|webp|avif|svg|ico|mp[34]|mov|wav|woff2?|ttf|css|js|json|xml|csv|docx?|xlsx?|pptx?)(?:$|\/)/i;
const trackingParam = /^(?:utm_[\w]+|gclid|fbclid|msclkid)$/i;
const actionParam = /^(?:action|do|delete|remove|logout|token|password|key|auth|session|add-to-cart)$/i;
const compact = (value: string | undefined | null, limit = 1000) => (value || "").replace(/\s+/g, " ").trim().slice(0, limit);

export interface CrawlOptions {
  onProgress?: (progress: CrawlProgress) => Promise<void>;
  shouldContinue?: () => Promise<boolean>;
}
interface CrawlerDependencies {
  request?: SafeRequester;
  wait?: (milliseconds: number) => Promise<void>;
  now?: () => number;
  measure?: typeof collectMeasurements;
}

/** Tracking URLs deduplicate; arbitrary query combinations are never discovered recursively. */
export function canonicalCrawlUrl(input: string, origin: string, allowInitialQuery = false): string | null {
  try {
    const url = new URL(normalizeAuditUrl(new URL(input, origin).toString()));
    if (url.origin !== origin || url.pathname.length > 500) return null;
    let path: string;
    try { path = decodeURIComponent(url.pathname); } catch { return null; }
    if (excludedPath.test(path) || filePath.test(path)) return null;
    for (const key of [...url.searchParams.keys()]) {
      if (actionParam.test(key)) return null;
      if (trackingParam.test(key)) url.searchParams.delete(key);
    }
    if (url.search && (!allowInitialQuery || url.search.length > 200 || [...url.searchParams].length > 3)) return null;
    url.hash = "";
    return url.toString();
  } catch { return null; }
}

function observation(url: string, status: PageObservation["status"], error?: string, statusCode: number | null = null): PageObservation {
  return { url, status, statusCode, fetchedAt: new Date().toISOString(), title: "", description: "", h1: [], language: "", canonical: "", viewport: "", robotsMeta: "", text: "", links: [], images: [], forms: [], structuredData: [], headers: {}, error, rendered: false };
}

/** Extract minimized HTML facts; no target HTML or scripts are rendered or executed. */
export function extractPage(url: string, html: string, statusCode = 200, headers: Record<string, string> = {}): PageObservation {
  const $ = cheerio.load(html);
  const page = observation(url, "fetched", undefined, statusCode);
  const resolve = (value: string | undefined): string => {
    if (!value?.trim()) return "";
    try {
      const absolute = new URL(value || "", url);
      return ["http:", "https:", "mailto:", "tel:"].includes(absolute.protocol) ? absolute.toString().slice(0, 2048) : "";
    } catch { return ""; }
  };
  page.title = compact($("title").first().text(), 500);
  page.description = compact($("meta[name='description' i]").first().attr("content"), 1000);
  page.h1 = $("h1").slice(0, 20).toArray().map((element) => compact($(element).text(), 300));
  page.language = compact($("html").attr("lang"), 30);
  page.canonical = $("link[rel~='canonical' i]").first().attr("href") ? resolve($("link[rel~='canonical' i]").first().attr("href")) : "";
  page.viewport = compact($("meta[name='viewport' i]").first().attr("content"), 300);
  page.robotsMeta = compact($("meta[name='robots' i],meta[name='googlebot' i]").toArray().map((element) => $(element).attr("content")).join(", "), 1000);
  const links = new Set<string>();
  $("a[href]").slice(0, 1000).each((_, element) => {
    const destination = resolve($(element).attr("href"));
    if (destination && !links.has(destination) && page.links.length < 500) {
      links.add(destination);
      page.links.push({ url: destination, text: compact($(element).attr("aria-label") || $(element).text(), 200) });
    }
  });
  $("img").slice(0, 100).each((_, element) => { page.images.push({ src: resolve($(element).attr("src") || $(element).attr("data-src")), alt: $(element).attr("alt") === undefined ? null : compact($(element).attr("alt"), 300), width: $(element).attr("width")?.slice(0, 20) ?? null, height: $(element).attr("height")?.slice(0, 20) ?? null }); });
  const labels = new Map<string, string>();
  $("label[for]").slice(0, 300).each((_, element) => {
    const id = $(element).attr("for");
    if (id) labels.set(id, compact($(element).text(), 200));
  });
  const idText = new Map<string, string>();
  $("[id]").slice(0, 1500).each((_, element) => { const id = $(element).attr("id"); if (id) idText.set(id, compact($(element).text(), 200)); });
  $("form").slice(0, 8).each((_, form) => {
    const fields: PageObservation["forms"][number]["inputs"] = [];
    $(form).find("input,textarea,select").slice(0, 50).each((_, element) => {
      const input = $(element);
      const type = compact(input.attr("type") || (element.tagName === "input" ? "text" : element.tagName), 30).toLowerCase();
      if (["hidden", "submit", "button", "reset", "image"].includes(type)) return;
      const references = (input.attr("aria-labelledby") || "").split(/\s+/).map((id) => idText.get(id) || "").join(" ");
      const label = input.attr("aria-label") || references.trim() || labels.get(input.attr("id") || "") || input.closest("label").text();
      fields.push({ name: compact(input.attr("name"), 100), type, label: compact(label, 200), required: input.attr("required") !== undefined || input.attr("aria-required") === "true" });
    });
    page.forms.push({ action: resolve($(form).attr("action") || url), inputs: fields });
  });
  $("script[type='application/ld+json' i]").slice(0, 20).each((_, element) => {
    const raw = $(element).text();
    if (raw.length > 65536) { page.structuredData.push({ valid: false, types: [] }); return; }
    try {
      const data: unknown = JSON.parse(raw);
      const types = new Set<string>();
      let nodes = 0;
      const visit = (value: unknown, depth: number) => {
        if (++nodes > 500 || depth > 8 || !value || typeof value !== "object") return;
        if (Array.isArray(value)) { value.slice(0, 100).forEach((entry) => visit(entry, depth + 1)); return; }
        const record = value as Record<string, unknown>;
        const kind = record["@type"];
        if (typeof kind === "string") types.add(kind.slice(0, 100));
        if (Array.isArray(kind)) kind.filter((entry) => typeof entry === "string").slice(0, 20).forEach((entry) => types.add(entry.slice(0, 100)));
        Object.values(record).slice(0, 100).forEach((entry) => visit(entry, depth + 1));
      };
      visit(data, 0);
      page.structuredData.push({ valid: true, types: [...types].slice(0, 30) });
    } catch { page.structuredData.push({ valid: false, types: [] }); }
  });
  $("script,style,template,svg,[hidden]").remove();
  page.text = compact($("body").text(), 12000);
  page.headers = headers;
  return page;
}

export function extractSitemap(xml: string): { pages: string[]; indexes: string[] } {
  // htmlparser2's XML parser never loads external entities; declarations are rejected as well.
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new AuditNetworkError("Sitemap declarations are unsupported.", "UNSAFE_XML");
  const $ = cheerio.load(xml, { xml: true });
  const root = $.root().children().first();
  const name = root.prop("tagName")?.split(":").pop()?.toLowerCase();
  if (name !== "urlset" && name !== "sitemapindex") throw new AuditNetworkError("The sitemap did not contain a recognized sitemap document.", "INVALID_SITEMAP");
  const locations: string[] = [];
  $("loc").slice(0, 1000).each((_, element) => { locations.push($(element).text().trim().slice(0, 2048)); });
  return name === "sitemapindex" ? { pages: [], indexes: locations.slice(0, 5) } : { pages: locations, indexes: [] };
}

function priority(url: string): number {
  const path = new URL(url).pathname.toLowerCase();
  if (path === "/") return 100;
  if (/contact|service|solution|about|pricing|appointment|book|demo|product/.test(path)) return 80;
  if (/case-stud|portfolio|review|testimonial|faq|support|privacy|terms|location/.test(path)) return 65;
  return 20 - path.split("/").length;
}

function canonicalOriginRedirect(from: URL, to: URL): boolean {
  return from.hostname.replace(/^www\./, "") === to.hostname.replace(/^www\./, "") && !(from.protocol === "https:" && to.protocol === "http:");
}

export function createWebsiteCrawler(dependencies: CrawlerDependencies = {}) {
  const request = dependencies.request || safeRequest;
  const wait = dependencies.wait || ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const now = dependencies.now || Date.now;
  const measure = dependencies.measure || collectMeasurements;
  return async (input: string, options: CrawlOptions = {}): Promise<CrawlResult> => {
    const started = now();
    const entered = new URL(normalizeAuditUrl(input));
    const canonicalSubmitted = canonicalCrawlUrl(entered.toString(), entered.origin, true);
    if (!canonicalSubmitted) throw new AuditNetworkError("Use a public information page without account, action or download parameters.", "EXCLUDED_URL");
    const submitted = new URL(canonicalSubmitted);
    let approvedOrigin = submitted.origin;
    let initialRequest = true;
    let requestCount = 0;
    let bytes = 0;
    const policies = new Map<string, RobotsPolicy>();
    const nextRequestAt = new Map<string, number>();
    const limitations = new Set<string>([
      "Only public, server-delivered HTML was inspected. JavaScript-rendered content, screenshots, interactive behavior and authenticated areas were not assessed.",
      "Collection is limited to 25 page attempts, 500 discovered URLs, 80 HTTP requests and 20 MB. Query-based page discovery and account, cart, checkout, search, calendar and download routes are excluded.",
    ]);
    const pages: PageObservation[] = [];
    const visited = new Set<string>();
    const discovered = new Set<string>();
    const queue = new Set<string>();
    const ensureActive = async () => {
      if (options.shouldContinue && !(await options.shouldContinue())) throw new AuditNetworkError("Audit collection was canceled.", "CANCELED");
      if (now() - started > MAX_CRAWL_MS) throw new AuditNetworkError("The collection time budget was reached.", "CRAWL_BUDGET");
      if (requestCount >= MAX_REQUESTS || bytes >= MAX_TOTAL_BYTES) throw new AuditNetworkError("The collection request or size budget was reached.", "CRAWL_BUDGET");
    };
    const checkpoint = async (stage: CrawlProgress["stage"]) => {
      await ensureActive();
      await options.onProgress?.({ stage, checked: pages.length, discovered: discovered.size, pages: [...pages] });
    };
    const beforeRequest = async (url: URL) => {
      await ensureActive();
      const delay = policies.get(url.origin)?.crawlDelayMs || 1000;
      if (delay > 30000) throw new AuditNetworkError("The requested crawl delay exceeds the supported audit duration.", "CRAWL_DELAY");
      const pause = Math.max(0, (nextRequestAt.get(url.origin) || 0) - now());
      if (pause) await wait(pause);
      await ensureActive();
      requestCount++;
      nextRequestAt.set(url.origin, now() + delay);
    };
    const boundedRequest: SafeRequester = async (url, settings = {}) => {
      let reportedBytes = 0;
      const chargeBytes = (count: number) => {
        reportedBytes += count;
        bytes += count;
        settings.onBytes?.(count);
        if (bytes > MAX_TOTAL_BYTES) throw new AuditNetworkError("The collection size budget was reached.", "CRAWL_BUDGET");
      };
      const response = await request(url, { ...settings, maxBytes: Math.min(settings.maxBytes || 2 * 1024 * 1024, Math.max(1, MAX_TOTAL_BYTES - bytes)), beforeRequest: async (target) => { await settings.beforeRequest?.(target); await beforeRequest(target); }, onBytes: chargeBytes });
      if (reportedBytes < response.bytes) chargeBytes(response.bytes - reportedBytes);
      return response;
    };
    const getPolicy = async (origin: string) => {
      let policy = policies.get(origin);
      if (!policy) {
        policy = await loadRobots(origin, boundedRequest);
        policies.set(origin, policy);
        if (policy.note) limitations.add(policy.note);
      }
      return policy;
    };
    const pageRequest = async (url: string) => {
      const settings: RequestOptions = {
        maxBytes: 2 * 1024 * 1024, timeoutMs: 15000, contentTypes: ["text/html", "application/xhtml+xml"],
        canRedirect: (from, to) => (initialRequest ? canonicalOriginRedirect(from, to) : to.origin === approvedOrigin) && !!canonicalCrawlUrl(to.toString(), to.origin, true),
        beforeRequest: async (target) => {
          const policy = await getPolicy(target.origin);
          if (!policy.allowed(target.toString())) throw new AuditNetworkError("This page is disallowed by the website's robots policy.", "ROBOTS_BLOCKED");
        },
      };
      return boundedRequest(url, settings);
    };
    const add = (value: string) => {
      const candidate = canonicalCrawlUrl(value, approvedOrigin);
      if (!candidate || discovered.size >= MAX_DISCOVERED || discovered.has(candidate)) return;
      discovered.add(candidate);
      if (!visited.has(candidate)) queue.add(candidate);
    };
    const collectPage = async (url: string) => {
      visited.add(url);
      let page: PageObservation;
      try {
        const policy = await getPolicy(new URL(url).origin);
        if (!policy.allowed(url)) page = observation(url, "blocked", "This page is disallowed by the website's robots policy.");
        else {
          const response = await pageRequest(url);
          if (initialRequest && response.url !== url) {
            approvedOrigin = new URL(response.url).origin;
            limitations.add("The entered page redirected to a checked HTTP/HTTPS or www variant. All subsequent page collection used its final origin.");
          }
          visited.add(response.url);
          page = extractPage(response.url, response.body, response.statusCode, response.headers);
          if (response.statusCode < 200 || response.statusCode >= 300) { page.status = [401, 403, 429].includes(response.statusCode) ? "blocked" : "failed"; page.error = `Website returned HTTP ${response.statusCode}.`; }
          if (/captcha|checking your browser|verify you are human/i.test(`${page.title} ${page.text.slice(0, 600)}`)) {
            page.status = "blocked"; page.error = "An access challenge was observed. It was not bypassed.";
          }
        }
      } catch (error) {
        if (error instanceof AuditNetworkError && ["CANCELED", "CRAWL_BUDGET"].includes(error.code)) throw error;
        page = observation(url, error instanceof AuditNetworkError && ["ROBOTS_BLOCKED", "CRAWL_DELAY"].includes(error.code) ? "blocked" : "failed", networkErrorMessage(error));
      }
      initialRequest = false;
      pages.push(page);
      if (page.status === "fetched") page.links.forEach((link) => add(link.url));
      return page;
    };
    try {
      discovered.add(submitted.toString());
      await checkpoint("discovering");
      const initialPolicy = await getPolicy(submitted.origin);
      await ensureActive();
      if (initialPolicy.crawlDelayMs > 30000) limitations.add("Collection stopped to honor the website's requested crawl delay.");
      const firstPage = await collectPage(submitted.toString());
      await checkpoint("checking");
      const finalPolicy = await getPolicy(approvedOrigin);
      if (firstPage.status === "fetched" && finalPolicy.state !== "unreachable" && finalPolicy.crawlDelayMs <= 30000) {
        add(`${approvedOrigin}/`);
        const sitemapQueue = [...new Set([...finalPolicy.sitemapUrls, `${approvedOrigin}/sitemap.xml`])].slice(0, 5).map((url) => ({ url, depth: 0 }));
        const seenSitemaps = new Set<string>();
        while (sitemapQueue.length && seenSitemaps.size < 5) {
          await ensureActive();
          const item = sitemapQueue.shift()!;
          let sitemap: URL;
          try { sitemap = new URL(normalizeAuditUrl(item.url)); } catch { continue; }
          if (sitemap.origin !== approvedOrigin || seenSitemaps.has(sitemap.toString()) || !finalPolicy.allowed(sitemap.toString())) continue;
          seenSitemaps.add(sitemap.toString());
          try {
            const response = await boundedRequest(sitemap.toString(), { maxBytes: 1024 * 1024, timeoutMs: 10000, accept: "application/xml,text/xml", contentTypes: ["application/xml", "text/xml", "text/plain", "application/xhtml+xml"], canRedirect: (_, to) => to.origin === approvedOrigin && finalPolicy.allowed(to.toString()) });
            if (response.statusCode >= 200 && response.statusCode < 300) {
              const entries = extractSitemap(response.body);
              entries.pages.forEach(add);
              if (item.depth < 1) entries.indexes.slice(0, 5).forEach((url) => { if (sitemapQueue.length < 10) sitemapQueue.push({ url, depth: item.depth + 1 }); });
            } else if (![404, 410].includes(response.statusCode)) limitations.add(`A sitemap could not be inspected (HTTP ${response.statusCode}).`);
          } catch (error) {
            if (error instanceof AuditNetworkError && ["CANCELED", "CRAWL_BUDGET"].includes(error.code)) throw error;
            limitations.add(`A sitemap was unavailable: ${networkErrorMessage(error)}`);
          }
        }
        while (queue.size && pages.length < PAGE_LIMIT) {
          await ensureActive();
          const candidate = [...queue].sort((a, b) => priority(b) - priority(a))[0];
          queue.delete(candidate);
          if (visited.has(candidate)) continue;
          await collectPage(candidate);
          await checkpoint("checking");
        }
      }
      if (queue.size) limitations.add(`${queue.size} discovered URLs remained unchecked after the page limit or crawl policy was applied.`);
    } catch (error) {
      if (error instanceof AuditNetworkError && error.code === "CANCELED") throw error;
      if (error instanceof AuditNetworkError && error.code === "CRAWL_BUDGET") limitations.add(`${error.message} Results cover only completed page attempts.`);
      else throw error;
    }
    if (discovered.size >= MAX_DISCOVERED) limitations.add("URL discovery reached the 500-URL limit.");
    if (pages.some((page) => page.status !== "fetched")) limitations.add("Some selected pages were blocked or unavailable; absence on those pages was not treated as a missing feature.");
    if (options.shouldContinue && !(await options.shouldContinue())) throw new AuditNetworkError("Audit collection was canceled.", "CANCELED");
    await options.onProgress?.({ stage: "measuring", checked: pages.length, discovered: discovered.size, pages: [...pages] });
    const measurements = await measure(pages, {
      shouldContinue: options.shouldContinue,
      canMeasure: async (url) => new URL(url).origin === approvedOrigin && (await getPolicy(approvedOrigin)).allowed(url),
    });
    measurements.limitations.forEach((note) => limitations.add(note));
    return { pages, discovered: discovered.size, limitations: [...limitations], performance: measurements.performance, fieldPerformance: measurements.fieldPerformance };
  };
}

export const crawlWebsite = createWebsiteCrawler();
