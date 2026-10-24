import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP, type LookupFunction } from "node:net";
import ipaddr from "ipaddr.js";

export const AUDIT_USER_AGENT = "VivizAuditBot/1.0 (+https://viviz.in/website-audit; public website assessment)";
export const AUDIT_ROBOTS_TOKEN = "VivizAuditBot";

export class AuditNetworkError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "AuditNetworkError";
  }
}

export interface PublicAddress { address: string; family: 4 | 6 }
export type PublicLookup = (hostname: string) => Promise<PublicAddress[]>;
export interface SafeResponse {
  url: string;
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  bytes: number;
  redirects: string[];
}
export interface RequestOptions {
  maxBytes?: number;
  timeoutMs?: number;
  maxRedirects?: number;
  accept?: string;
  contentTypes?: string[];
  canRedirect?: (from: URL, to: URL) => boolean | Promise<boolean>;
  beforeRequest?: (url: URL) => void | Promise<void>;
  onBytes?: (count: number) => void;
}
export interface TransportOptions { maxBytes: number; timeoutMs: number; accept: string; onBytes?: (count: number) => void }
export type PinnedTransport = (url: URL, address: PublicAddress, options: TransportOptions) => Promise<Omit<SafeResponse, "redirects">>;
export interface NetworkDependencies { resolve?: PublicLookup; transport?: PinnedTransport }
export type SafeRequester = (url: string, options?: RequestOptions) => Promise<SafeResponse>;

const forbiddenSuffixes = ["localhost", "local", "internal", "intranet", "lan", "home", "test", "invalid", "onion"];
const actionPath = /(?:^|\/)(?:log-?in|log-?out|sign-?in|sign-?out|register|account|accounts|admin|wp-admin|cart|basket|checkout|api)(?:\/|$)/i;
const actionQuery = /^(?:action|do|delete|remove|logout|token|password|key|auth|session|add-to-cart)$/i;

function assertReadOnlyUrl(url: URL): void {
  let path: string;
  try { path = decodeURIComponent(url.pathname); }
  catch { throw new AuditNetworkError("The website returned an unsupported URL path.", "INVALID_PATH"); }
  if (actionPath.test(path) || [...url.searchParams.keys()].some((key) => actionQuery.test(key))) {
    throw new AuditNetworkError("Account, administration and transaction action routes are excluded from collection.", "ACTION_URL");
  }
}

/** Parse only; no network traffic. WHATWG URL normalization also resolves numeric IP spellings. */
export function normalizeAuditUrl(input: string): string {
  const value = input.trim();
  if (!value || value.length > 2048 || /[\u0000-\u0020\u007f\\]/.test(value)) {
    throw new AuditNetworkError("Enter a public website address without spaces.", "INVALID_URL");
  }
  let url: URL;
  try {
    const withScheme = /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `https://${value}`;
    url = new URL(withScheme);
  } catch { throw new AuditNetworkError("Enter a valid website address.", "INVALID_URL"); }
  if (!(["http:", "https:"] as string[]).includes(url.protocol)) throw new AuditNetworkError("Only HTTP and HTTPS websites are supported.", "INVALID_SCHEME");
  if (url.username || url.password) throw new AuditNetworkError("Website addresses cannot contain credentials.", "CREDENTIALS");
  if (url.port) throw new AuditNetworkError("Only the standard website ports are supported.", "INVALID_PORT");
  const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!hostname || hostname.endsWith(".") || hostname.includes("%") || forbiddenSuffixes.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`))) {
    throw new AuditNetworkError("Only publicly accessible websites can be audited.", "PRIVATE_HOST");
  }
  if (isIP(hostname)) assertPublicAddress(hostname);
  else if (!hostname.includes(".")) throw new AuditNetworkError("Enter a public website domain.", "PRIVATE_HOST");
  url.hash = "";
  return url.toString();
}

/** Reject every non-unicast range, mapped IPv4 and conservative special-purpose ranges. */
export function assertPublicAddress(address: string): void {
  let parsed: ReturnType<typeof ipaddr.parse>;
  try { parsed = ipaddr.parse(address); } catch { throw new AuditNetworkError("The website resolved to an invalid address.", "INVALID_ADDRESS"); }
  if (parsed.range() !== "unicast") throw new AuditNetworkError("The website resolves to a private or reserved network.", "PRIVATE_ADDRESS");
  const extraDenied = parsed.kind() === "ipv4"
    ? ["192.0.0.0/24", "192.88.99.0/24", "198.18.0.0/15", "198.51.100.0/24", "203.0.113.0/24"]
    : ["2001::/23", "2001:db8::/32", "3fff::/20"];
  if (extraDenied.some((cidr) => {
    const range = ipaddr.parseCIDR(cidr);
    return parsed.kind() === range[0].kind() && parsed.match(range);
  })) throw new AuditNetworkError("The website resolves to a private or reserved network.", "PRIVATE_ADDRESS");
  if (parsed.kind() === "ipv6" && !parsed.match(ipaddr.parseCIDR("2000::/3"))) {
    throw new AuditNetworkError("The website resolves to a reserved network.", "PRIVATE_ADDRESS");
  }
}

const defaultLookup: PublicLookup = async (hostname) => (await lookup(hostname, { all: true, verbatim: true })).map((answer) => ({ address: answer.address, family: answer.family as 4 | 6 }));

async function resolveDestination(url: URL, resolver: PublicLookup, timeoutMs: number): Promise<PublicAddress[]> {
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(hostname)) { assertPublicAddress(hostname); return [{ address: hostname, family: isIP(hostname) as 4 | 6 }]; }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const answers = await Promise.race([
      resolver(hostname),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new AuditNetworkError("Website DNS lookup timed out.", "DNS_TIMEOUT")), timeoutMs); }),
    ]);
    if (!answers.length || answers.length > 64) throw new AuditNetworkError("The website has no supported public address.", "DNS_FAILED");
    for (const answer of answers) {
      assertPublicAddress(answer.address);
      if (isIP(answer.address) !== answer.family) throw new AuditNetworkError("The website has an invalid DNS answer.", "DNS_FAILED");
    }
    return answers;
  } catch (error) {
    if (error instanceof AuditNetworkError) throw error;
    throw new AuditNetworkError("The website domain could not be resolved.", "DNS_FAILED");
  } finally { clearTimeout(timer); }
}

export async function validatePublicUrl(input: string): Promise<URL> {
  const url = new URL(normalizeAuditUrl(input));
  await resolveDestination(url, defaultLookup, 5000);
  return url;
}

const retainedHeaders = new Set(["content-type", "content-length", "content-encoding", "location", "x-robots-tag", "strict-transport-security", "cache-control", "server", "retry-after"]);

/** The socket resolves only to the checked address. Host/SNI still identify the original domain. */
const nodeTransport: PinnedTransport = (url, address, options) => new Promise((resolve, reject) => {
  const request = url.protocol === "https:" ? https.request : http.request;
  const pinnedLookup = ((_hostname: string, lookupOptions: { all?: boolean }, callback: (...args: unknown[]) => void) => {
    if (lookupOptions.all) callback(null, [{ address: address.address, family: address.family }]);
    else callback(null, address.address, address.family);
  }) as LookupFunction;
  const req = request(url, {
    method: "GET", agent: false, lookup: pinnedLookup, family: address.family,
    maxHeaderSize: 16 * 1024,
    headers: { "User-Agent": AUDIT_USER_AGENT, Accept: options.accept, "Accept-Encoding": "identity" },
  }, (res) => {
    let length = 0;
    const chunks: Buffer[] = [];
    const contentLength = Number(res.headers["content-length"] || 0);
    if (contentLength > options.maxBytes) { res.destroy(); req.destroy(new AuditNetworkError("Website response exceeded the collection size limit.", "RESPONSE_TOO_LARGE")); return; }
    res.on("data", (chunk: Buffer) => {
      length += chunk.length;
      try { options.onBytes?.(chunk.length); }
      catch (error) { res.destroy(); req.destroy(error instanceof Error ? error : new AuditNetworkError("The collection size budget was reached.", "RESPONSE_TOO_LARGE")); return; }
      if (length > options.maxBytes) { res.destroy(); req.destroy(new AuditNetworkError("Website response exceeded the collection size limit.", "RESPONSE_TOO_LARGE")); }
      else chunks.push(chunk);
    });
    res.on("error", (error) => { clearTimeout(deadline); reject(error instanceof AuditNetworkError ? error : new AuditNetworkError("Website response ended before it was complete.", "RESPONSE_ABORTED")); });
    res.on("aborted", () => { clearTimeout(deadline); reject(new AuditNetworkError("Website response ended before it was complete.", "RESPONSE_ABORTED")); });
    res.on("end", () => {
      clearTimeout(deadline);
      const headers: Record<string, string> = {};
      for (const [key, value] of Object.entries(res.headers)) if (retainedHeaders.has(key) && value !== undefined) headers[key] = (Array.isArray(value) ? value.join(", ") : value).slice(0, 2048);
      resolve({ url: url.toString(), statusCode: res.statusCode || 0, headers, body: Buffer.concat(chunks).toString("utf8"), bytes: length });
    });
  });
  const deadline = setTimeout(() => req.destroy(new AuditNetworkError("Website response timed out.", "REQUEST_TIMEOUT")), options.timeoutMs);
  req.once("error", (error) => {
    clearTimeout(deadline);
    reject(error instanceof AuditNetworkError ? error : new AuditNetworkError("A connection to the website could not be completed.", "REQUEST_FAILED"));
  });
  req.end();
});

/** A pure seam permits public-address fixtures without adding a localhost escape hatch. */
export function createSafeRequester(dependencies: NetworkDependencies = {}): SafeRequester {
  const resolver = dependencies.resolve || defaultLookup;
  const transport = dependencies.transport || nodeTransport;
  return async (input, options = {}) => {
    let current = new URL(normalizeAuditUrl(input));
    const maxBytes = Math.min(options.maxBytes ?? 2 * 1024 * 1024, 4 * 1024 * 1024);
    const timeoutMs = Math.min(options.timeoutMs ?? 15000, 30000);
    const maxRedirects = Math.max(0, Math.min(options.maxRedirects ?? 5, 5));
    const started = Date.now();
    const redirects: string[] = [];
    let totalBytes = 0;
    for (let hop = 0; ; hop++) {
      assertReadOnlyUrl(current);
      await options.beforeRequest?.(current);
      const remainingMs = timeoutMs - (Date.now() - started);
      if (remainingMs <= 0) throw new AuditNetworkError("Website response timed out.", "REQUEST_TIMEOUT");
      const addresses = await resolveDestination(current, resolver, Math.min(remainingMs, 5000));
      let reportedBytes = 0;
      const result = await transport(current, addresses[0], { maxBytes: maxBytes - totalBytes, timeoutMs: Math.max(1, timeoutMs - (Date.now() - started)), accept: options.accept || "text/html,application/xhtml+xml;q=0.9", onBytes: (count) => { reportedBytes += count; options.onBytes?.(count); } });
      if (reportedBytes < result.bytes) options.onBytes?.(result.bytes - reportedBytes);
      totalBytes += result.bytes;
      if (totalBytes > maxBytes || Buffer.byteLength(result.body) > maxBytes) throw new AuditNetworkError("Website response exceeded the collection size limit.", "RESPONSE_TOO_LARGE");
      if ([301, 302, 303, 307, 308].includes(result.statusCode) && result.headers.location) {
        if (hop >= maxRedirects) throw new AuditNetworkError("Website exceeded the redirect limit.", "REDIRECT_LIMIT");
        let next: URL;
        try { next = new URL(normalizeAuditUrl(new URL(result.headers.location, current).toString())); }
        catch (error) { if (error instanceof AuditNetworkError) throw error; throw new AuditNetworkError("The website returned an invalid redirect.", "INVALID_REDIRECT"); }
        if (options.canRedirect && !(await options.canRedirect(current, next))) throw new AuditNetworkError("A redirect left the permitted website scope.", "REDIRECT_SCOPE");
        redirects.push(current.toString());
        current = next;
        continue;
      }
      if (result.headers["content-encoding"] && result.headers["content-encoding"].toLowerCase() !== "identity") throw new AuditNetworkError("The website returned an unsupported encoded response.", "CONTENT_ENCODING");
      const contentType = (result.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
      if (result.statusCode >= 200 && result.statusCode < 300 && options.contentTypes && !options.contentTypes.includes(contentType)) throw new AuditNetworkError("The response is not a supported document type.", "CONTENT_TYPE");
      return { ...result, url: current.toString(), bytes: totalBytes, redirects };
    }
  };
}

export const safeRequest: SafeRequester = createSafeRequester();

export function networkErrorMessage(error: unknown): string {
  return error instanceof AuditNetworkError ? error.message : "The website could not be checked.";
}
