import robotsParser from "robots-parser";
import { AUDIT_ROBOTS_TOKEN, networkErrorMessage, type SafeRequester } from "./network";

export interface RobotsPolicy {
  origin: string;
  state: "available" | "unavailable" | "unreachable";
  allowed: (url: string) => boolean;
  crawlDelayMs: number;
  sitemapUrls: string[];
  note?: string;
}

export function parseRobots(origin: string, body: string): RobotsPolicy {
  const parser = robotsParser(`${origin}/robots.txt`, body);
  const delay = Number(parser.getCrawlDelay(AUDIT_ROBOTS_TOKEN));
  const crawlDelayMs = Number.isFinite(delay) && delay > 0 ? Math.max(1000, Math.ceil(delay * 1000)) : 1000;
  return {
    origin, state: "available", crawlDelayMs,
    allowed: (url) => new URL(url).origin === origin && parser.isAllowed(url, AUDIT_ROBOTS_TOKEN) !== false,
    sitemapUrls: parser.getSitemaps().slice(0, 5),
    ...(crawlDelayMs > 30000 ? { note: "The website requests a crawl delay longer than this free audit can support." } : {}),
  };
}

/** RFC 9309: unreachable robots (5xx/network failure) means complete disallow. */
export async function loadRobots(origin: string, request: SafeRequester): Promise<RobotsPolicy> {
  const deny = (note: string): RobotsPolicy => ({ origin, state: "unreachable", allowed: () => false, crawlDelayMs: 1000, sitemapUrls: [], note });
  try {
    const response = await request(`${origin}/robots.txt`, { maxBytes: 512 * 1024, timeoutMs: 15000, maxRedirects: 5, accept: "text/plain", contentTypes: ["text/plain", "text/x-robots-txt", "application/octet-stream", ""] });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (/<!doctype\s+html|<html[\s>]/i.test(response.body)) return deny("The robots endpoint returned HTML, so crawl permission could not be established.");
      return parseRobots(origin, response.body);
    }
    if ([401, 403, 429].includes(response.statusCode)) return deny(`The website restricted robots access (HTTP ${response.statusCode}); collection was stopped.`);
    if (response.statusCode >= 400 && response.statusCode < 500) return { origin, state: "unavailable", allowed: (url) => new URL(url).origin === origin, crawlDelayMs: 1000, sitemapUrls: [], note: `No usable robots policy was published (HTTP ${response.statusCode}).` };
    return deny(`Robots policy could not be reached (HTTP ${response.statusCode}); collection was stopped.`);
  } catch (error) { return deny(`Robots policy could not be reached. ${networkErrorMessage(error)} Collection was stopped.`); }
}
