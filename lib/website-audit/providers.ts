import type { FieldPerformance, PageObservation, PerformanceObservation } from "./types";
import { normalizeAuditUrl, validatePublicUrl } from "./network";

interface MeasurementOptions {
  shouldContinue?: () => Promise<boolean>;
  canMeasure?: (url: string) => Promise<boolean>;
}
export interface MeasurementResult {
  performance: PerformanceObservation[];
  fieldPerformance: FieldPerformance;
  limitations: string[];
}
type JsonRecord = Record<string, unknown>;
const record = (value: unknown): JsonRecord => value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
const numeric = (value: unknown): number | null => typeof value === "number" && Number.isFinite(value) ? value : null;
const text = (value: unknown, limit = 600): string => typeof value === "string" ? value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").slice(0, limit) : "";

/** Only fixed provider endpoints are used. Redirects, time, and response bytes are bounded. */
async function providerJson(url: URL, init: RequestInit, timeoutMs: number): Promise<{ status: number; data: JsonRecord }> {
  if (!["www.googleapis.com", "chromeuxreport.googleapis.com"].includes(url.hostname) || url.protocol !== "https:") throw new Error("Unsupported measurement provider.");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, redirect: "error", signal: controller.signal, cache: "no-store" });
    if (response.status === 404) { await response.body?.cancel(); return { status: 404, data: {} }; }
    if (!response.ok) { await response.body?.cancel(); throw new Error(`The measurement provider returned HTTP ${response.status}.`); }
    if (!response.headers.get("content-type")?.toLowerCase().includes("json")) { await response.body?.cancel(); throw new Error("The measurement provider did not return JSON."); }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("The measurement provider returned an empty response.");
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > 8 * 1024 * 1024) { await reader.cancel(); throw new Error("The measurement response exceeded its size limit."); }
      chunks.push(chunk.value);
    }
    return { status: response.status, data: record(JSON.parse(Buffer.concat(chunks).toString("utf8"))) };
  } finally { clearTimeout(timeout); }
}

export function parsePageSpeed(url: string, device: "mobile" | "desktop", payload: unknown): PerformanceObservation {
  const lighthouse = record(record(payload).lighthouseResult);
  if (!lighthouse.lighthouseVersion || lighthouse.runtimeError) throw new Error("Lighthouse could not complete this measurement.");
  if (typeof lighthouse.finalUrl === "string" && new URL(normalizeAuditUrl(lighthouse.finalUrl)).origin !== new URL(url).origin) throw new Error("The measurement redirected outside the checked website origin.");
  const categories = record(lighthouse.categories);
  const audits = record(lighthouse.audits);
  const score = (id: string) => { const value = numeric(record(categories[id]).score); return value === null ? null : Math.round(Math.max(0, Math.min(1, value)) * 100); };
  const metric = (id: string) => numeric(record(audits[id]).numericValue);
  const diagnostics = Object.entries(audits).filter(([, audit]) => { const item = record(audit); return typeof item.score === "number" && item.score < 0.9 && !["manual", "notApplicable", "informative"].includes(String(item.scoreDisplayMode)); }).slice(0, 12).map(([id, audit]) => ({ id: id.slice(0, 100), title: text(record(audit).title, 200), detail: text(record(audit).description, 600) }));
  return {
    url, device, status: "measured", fetchedAt: typeof lighthouse.fetchTime === "string" && Number.isFinite(Date.parse(lighthouse.fetchTime)) ? lighthouse.fetchTime : new Date().toISOString(),
    lighthouseVersion: text(lighthouse.lighthouseVersion, 30),
    scores: { performance: score("performance"), accessibility: score("accessibility"), seo: score("seo"), bestPractices: score("best-practices") },
    metrics: { lcpMs: metric("largest-contentful-paint"), cls: metric("cumulative-layout-shift"), tbtMs: metric("total-blocking-time") },
    diagnostics,
  };
}

function dateString(value: unknown): string | undefined {
  const date = record(value);
  if (typeof date.year !== "number" || typeof date.month !== "number" || typeof date.day !== "number") return undefined;
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function parseCrux(payload: unknown, scope: "url" | "origin", target: string): FieldPerformance {
  const result = record(record(payload).record);
  const metrics = record(result.metrics);
  const percentile = (key: string) => {
    const value = record(record(metrics[key]).percentiles).p75;
    const number = typeof value === "string" && /^\d+(\.\d+)?$/.test(value) ? Number(value) : numeric(value);
    return number !== null && number !== undefined && Number.isFinite(number) && number >= 0 ? number : undefined;
  };
  const lcpMs = percentile("largest_contentful_paint");
  const inpMs = percentile("interaction_to_next_paint");
  const cls = percentile("cumulative_layout_shift");
  if (lcpMs === undefined && inpMs === undefined && cls === undefined) return { status: "unavailable", reason: "No usable real-user performance metrics were returned for this website." };
  const period = record(result.collectionPeriod);
  return { status: "measured", scope, url: target, device: "mobile", percentile: 75, startDate: dateString(period.firstDate), endDate: dateString(period.lastDate), lcpMs, inpMs, cls };
}

export async function collectMeasurements(pages: PageObservation[], options: MeasurementOptions = {}): Promise<MeasurementResult> {
  const limitations: string[] = [];
  const fetched = pages.filter((page) => page.status === "fetched" && page.statusCode !== null && page.statusCode >= 200 && page.statusCode < 300);
  const eligible: PageObservation[] = [];
  for (const page of fetched) {
    if (options.shouldContinue && !(await options.shouldContinue())) break;
    if (!options.canMeasure || await options.canMeasure(page.url)) eligible.push(page);
  }
  const homepage = eligible.find((page) => new URL(page.url).pathname === "/");
  const primary = homepage || eligible[0];
  const unavailable: FieldPerformance = { status: "unavailable", reason: "Direct CrUX field measurement is not configured. Missing real-user data is not a performance failure." };
  if (!primary) return { performance: [], fieldPerformance: { status: "unavailable", reason: "No successfully collected, robots-permitted page was available for measurement." }, limitations: ["Laboratory and field performance could not be measured because no eligible public page was collected."] };
  const sample: { url: string; device: "mobile" | "desktop" }[] = [{ url: primary.url, device: "mobile" }, { url: primary.url, device: "desktop" }, ...eligible.filter((page) => page !== primary).slice(0, 2).map((page) => ({ url: page.url, device: "mobile" as const }))];
  const performance: PerformanceObservation[] = [];
  const psiEnabled = process.env.AUDIT_PAGESPEED_ENABLED === "true" && !!process.env.PAGESPEED_API_KEY;
  if (!psiEnabled) {
    limitations.push("PageSpeed laboratory and automated Lighthouse accessibility measurements were not run because the optional service is not configured.");
    performance.push(...sample.map(({ url, device }): PerformanceObservation => ({ url, device, status: "unavailable", fetchedAt: new Date().toISOString(), error: "PageSpeed measurement is not configured." })));
  } else {
    limitations.push("PageSpeed measures a declared sample through Google's service. Its browser and subresource fetching are operated by Google, separately from the app's DNS-pinned HTML collector. Automated accessibility results do not establish WCAG compliance.");
    for (const target of sample.slice(0, 4)) {
      if (options.shouldContinue && !(await options.shouldContinue())) break;
      try {
        if (options.canMeasure && !(await options.canMeasure(target.url))) throw new Error("The page is no longer eligible under the crawl policy.");
        await validatePublicUrl(target.url);
        const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
        endpoint.searchParams.set("url", target.url);
        endpoint.searchParams.set("strategy", target.device);
        endpoint.searchParams.set("key", process.env.PAGESPEED_API_KEY!);
        ["performance", "accessibility", "seo", "best-practices"].forEach((category) => endpoint.searchParams.append("category", category));
        const result = await providerJson(endpoint, { method: "GET" }, 45000);
        performance.push(parsePageSpeed(target.url, target.device, result.data));
      } catch {
        performance.push({ ...target, status: "unavailable", fetchedAt: new Date().toISOString(), error: "PageSpeed did not return a usable measurement. No performance score was inferred." });
      }
    }
  }
  let fieldPerformance = unavailable;
  if (process.env.AUDIT_CRUX_ENABLED === "true" && process.env.CRUX_API_KEY && (!options.shouldContinue || await options.shouldContinue())) {
    try {
      const endpoint = new URL("https://chromeuxreport.googleapis.com/v1/records:queryRecord");
      endpoint.searchParams.set("key", process.env.CRUX_API_KEY);
      for (const scope of ["url", "origin"] as const) {
        if (options.shouldContinue && !(await options.shouldContinue())) break;
        const target = scope === "url" ? primary.url : new URL(primary.url).origin;
        const result = await providerJson(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [scope]: target, formFactor: "PHONE", metrics: ["largest_contentful_paint", "interaction_to_next_paint", "cumulative_layout_shift"] }) }, 10000);
        if (result.status !== 404) { fieldPerformance = parseCrux(result.data, scope, target); break; }
        fieldPerformance = { status: "unavailable", reason: "CrUX has insufficient public real-user data for this page and origin. This is not a failure." };
      }
    } catch { fieldPerformance = { status: "unavailable", reason: "Direct CrUX measurement was unavailable. No real-user performance result was inferred." }; }
  }
  if (fieldPerformance.status === "unavailable") limitations.push(fieldPerformance.reason || "Real-user performance data was unavailable.");
  else limitations.push("CrUX measurements are mobile 75th-percentile real-user values for the stated URL or origin and collection period; laboratory TBT is not INP.");
  return { performance, fieldPerformance, limitations };
}
