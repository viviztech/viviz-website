import "server-only";
import { createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { analyzeWebsite } from "./analyze";
import { enhanceAuditExplanations } from "./ai";
import { auditPool, auditTransaction } from "./database";
import { auditLimits } from "./config";
import { AuditError } from "./errors";
import {
  AUDIT_VERSION, EMPTY_ASSESSMENT, PAGE_LIMIT,
  type AuditView, type AuditReport, type AuditStatus, type AuditStage,
  type BusinessAssessment, type CrawlProgress, type CrawlResult, type PageObservation, type RecommendationDecision,
} from "./types";
import { isAuditId } from "./validation";

interface AuditRow {
  id: string; owner_hash: string; url: string; hostname: string; origin: string;
  status: AuditStatus; stage: AuditStage; checked_count: number; discovered_count: number;
  assessment: BusinessAssessment; pages: PageObservation[]; report: AuditReport | null; collection_limitations: string[];
  request_hash: string;
  decisions: Record<string, RecommendationDecision>; revision: number; error: string | null;
  created_at: Date; updated_at: Date; expires_at: Date; started_at: Date | null;
  lease_token: string | null; attempts: number;
}

function requestDigest(value: unknown): string {
  const canonical = (item: unknown): unknown => Array.isArray(item) ? item.map(canonical) : item && typeof item === "object" ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)])) : item;
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}

function view(row: AuditRow): AuditView {
  return {
    id: row.id, url: row.url, hostname: row.hostname, status: row.status, stage: row.stage,
    createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(), expiresAt: row.expires_at.toISOString(),
    revision: row.revision, progress: { checked: row.checked_count, discovered: row.discovered_count, limit: PAGE_LIMIT },
    assessment: row.assessment, report: row.report, decisions: row.decisions, error: row.error,
  };
}

function ensureAvailable(row: AuditRow | undefined): asserts row is AuditRow {
  if (!row || row.status === "deleted") throw new AuditError("Report not found in this browser. Start a new audit or return to the browser that created it.", 404);
  if (row.expires_at.getTime() <= Date.now() || row.status === "expired") throw new AuditError("This report has expired. Start a new audit for current results.", 410);
}

export async function getOwnedAudit(id: string, owner: string | null): Promise<AuditView> {
  if (!owner || !isAuditId(id)) throw new AuditError("Report not found in this browser.", 404);
  const result = await auditPool().query<AuditRow>("SELECT * FROM website_audits WHERE id=$1 AND owner_hash=$2", [id, owner]);
  ensureAvailable(result.rows[0]);
  return view(result.rows[0]);
}

export interface ReportDownloadInput {
  revision: number;
  idempotencyKey: string;
  name: string;
  email: string;
}

export async function recordOwnedReportDownload(id: string, owner: string | null, input: ReportDownloadInput): Promise<AuditView> {
  return auditTransaction(async (client) => {
    const row = await ownedLocked(client, id, owner);
    if (!row.report || !["complete", "partial"].includes(row.status)) throw new AuditError("The report is not ready to download yet.", 409);
    if (row.revision !== input.revision) throw new AuditError("This report has changed. Review the latest report before downloading.", 409);
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`audit-downloads:${owner}`]);
    const digest = requestDigest({ auditId: id, ...input });
    const existing = await client.query<{ request_hash: string }>("SELECT request_hash FROM website_audit_report_downloads WHERE owner_hash=$1 AND idempotency_key=$2", [owner, input.idempotencyKey]);
    if (existing.rows[0]) {
      if (existing.rows[0].request_hash !== digest) throw new AuditError("These download details have changed. Please try a new download request.", 409);
      return view(row);
    }
    await client.query("INSERT INTO website_audit_report_downloads (id,audit_id,owner_hash,idempotency_key,request_hash,report_revision,name,email,expires_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [randomUUID(), id, owner, input.idempotencyKey, digest, row.revision, input.name, input.email, row.expires_at]);
    return view(row);
  });
}

async function ownedLocked(client: PoolClient, id: string, owner: string | null): Promise<AuditRow> {
  if (!owner || !isAuditId(id)) throw new AuditError("Report not found in this browser.", 404);
  const result = await client.query<AuditRow>("SELECT * FROM website_audits WHERE id=$1 AND owner_hash=$2 FOR UPDATE", [id, owner]);
  const row = result.rows[0];
  ensureAvailable(row);
  return row;
}

export async function workerOnline(): Promise<boolean> {
  if (process.env.AUDIT_ENABLED === "false") return false;
  const result = await auditPool().query("SELECT 1 FROM website_audit_workers WHERE last_seen_at > now() - INTERVAL '90 seconds' LIMIT 1");
  return result.rowCount !== 0;
}

export async function createQueuedAudit(input: {
  url: string; owner: string; ipHash: string; idempotencyKey: string; assessment?: BusinessAssessment;
}): Promise<AuditView> {
  if (process.env.AUDIT_ENABLED === "false") throw new AuditError("Website analysis is temporarily unavailable. Please try again shortly.", 503);
  const assessment = input.assessment ?? EMPTY_ASSESSMENT;
  const digest = requestDigest({ url: input.url, assessment });
  return auditTransaction(async (client) => {
    // Low-volume pilot: one transaction lock makes global, IP and session quotas atomic.
    await client.query("SELECT pg_advisory_xact_lock(74021901)");
    const replay = await client.query<AuditRow>("SELECT * FROM website_audits WHERE owner_hash=$1 AND idempotency_key=$2", [input.owner, input.idempotencyKey]);
    if (replay.rows[0]) {
      ensureAvailable(replay.rows[0]);
      if (replay.rows[0].request_hash !== digest) throw new AuditError("That submission was already used. Start a fresh request.", 409);
      return view(replay.rows[0]);
    }
    const worker = await client.query("SELECT 1 FROM website_audit_workers WHERE last_seen_at > now() - INTERVAL '90 seconds' LIMIT 1");
    if (!worker.rowCount) throw new AuditError("Website analysis is temporarily unavailable. Please try again shortly.", 503);
    const limits = auditLimits();
    const totals = await client.query<{ own: string; ip: string; total: string }>(
      "SELECT count(*) FILTER (WHERE owner_hash=$1) AS own, count(*) FILTER (WHERE ip_hash=$2) AS ip, count(*) AS total FROM website_audits WHERE created_at >= now() - INTERVAL '24 hours'", [input.owner, input.ipHash],
    );
    const counts = totals.rows[0];
    if (Number(counts.own) >= limits.sessionDaily) throw new AuditError("You have reached today's free audit limit. Please return in 24 hours.", 429);
    if (Number(counts.ip) >= limits.ipDaily || Number(counts.total) >= limits.globalDaily) throw new AuditError("The free audit service has reached its current limit. Please try again later.", 429);
    const parsed = new URL(input.url);
    const busy = await client.query<{ owner_hash: string }>("SELECT owner_hash FROM website_audits WHERE status IN ('queued','running') AND (owner_hash=$1 OR origin=$2)", [input.owner, parsed.origin]);
    if (busy.rows.length) throw new AuditError("An audit is already running for this browser or website. Please wait for it to finish.", 409);
    const result = await client.query<AuditRow>(
      "INSERT INTO website_audits (id,owner_hash,ip_hash,idempotency_key,url,hostname,origin,assessment,request_hash) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9) RETURNING *",
      [randomUUID(), input.owner, input.ipHash, input.idempotencyKey, input.url, parsed.hostname, parsed.origin, JSON.stringify(assessment), digest],
    );
    await client.query("INSERT INTO website_audit_assessment_revisions (audit_id,revision,assessment) VALUES ($1,1,$2::jsonb)", [result.rows[0].id, JSON.stringify(assessment)]);
    return view(result.rows[0]);
  });
}

export async function updateOwnedAssessment(id: string, owner: string | null, revision: number, assessment: BusinessAssessment): Promise<AuditView> {
  return auditTransaction(async (client) => {
    const row = await ownedLocked(client, id, owner);
    if (row.revision !== revision) throw new AuditError("This report has changed. Refresh it and review the current recommendations.", 409);
    if (["canceled", "failed"].includes(row.status)) throw new AuditError("Start a new audit to reassess this website.", 409);
    const count = await client.query<{ count: string }>("SELECT count(*) FROM website_audit_assessment_revisions WHERE audit_id=$1", [id]);
    if (Number(count.rows[0].count) >= auditLimits().assessments) throw new AuditError("This report has reached its assessment update limit. Start a new audit when your plans change.", 429);
    let report = row.report;
    const decisions: Record<string, RecommendationDecision> = {};
    if (report) {
      report = analyzeWebsite({ url: row.url, pages: row.pages, assessment, performance: report.performance, fieldPerformance: report.fieldPerformance, limitations: row.collection_limitations });
      for (const recommendation of report.recommendations) {
        const previous = row.report!.recommendations.find((item) => item.id === recommendation.id);
        if (previous && JSON.stringify(previous) === JSON.stringify(recommendation) && row.decisions[recommendation.id]) {
          decisions[recommendation.id] = row.decisions[recommendation.id];
        }
      }
    }
    const result = await client.query<AuditRow>("UPDATE website_audits SET assessment=$3::jsonb, report=$4::jsonb, decisions=$5::jsonb, revision=revision+1, updated_at=now() WHERE id=$1 AND owner_hash=$2 RETURNING *", [id, owner, JSON.stringify(assessment), report ? JSON.stringify(report) : null, JSON.stringify(decisions)]);
    await client.query("INSERT INTO website_audit_assessment_revisions (audit_id,revision,assessment) VALUES ($1,$2,$3::jsonb)", [id, result.rows[0].revision, JSON.stringify(assessment)]);
    return view(result.rows[0]);
  });
}

export async function decideOwnedRecommendation(id: string, owner: string | null, revision: number, recommendationId: string, decision: RecommendationDecision): Promise<AuditView> {
  return auditTransaction(async (client) => {
    const row = await ownedLocked(client, id, owner);
    if (row.revision !== revision) throw new AuditError("Recommendations have changed. Refresh and review them before selecting improvements.", 409);
    const recommendation = row.report?.recommendations.find((item) => item.id === recommendationId);
    if (!recommendation) throw new AuditError("That recommendation is no longer available. Review the latest report.", 409);
    if (recommendation.level === "not_needed_now" && decision === "included") throw new AuditError("This capability is not recommended for the current assessment.", 409);
    const result = await client.query<AuditRow>("UPDATE website_audits SET decisions=decisions || $3::jsonb, revision=revision+1, updated_at=now() WHERE id=$1 AND owner_hash=$2 RETURNING *", [id, owner, JSON.stringify({ [recommendationId]: decision })]);
    return view(result.rows[0]);
  });
}

export async function cancelOwnedAudit(id: string, owner: string | null): Promise<AuditView> {
  return auditTransaction(async (client) => {
    const row = await ownedLocked(client, id, owner);
    if (!["queued", "running"].includes(row.status)) return view(row);
    const result = await client.query<AuditRow>("UPDATE website_audits SET status='canceled',stage='finished',lease_token=NULL,lease_expires_at=NULL,updated_at=now(),error='Analysis was canceled. Start a new audit when you are ready.' WHERE id=$1 AND owner_hash=$2 RETURNING *", [id, owner]);
    return view(result.rows[0]);
  });
}

export async function deleteOwnedAudit(id: string, owner: string | null): Promise<void> {
  await auditTransaction(async (client) => {
    await ownedLocked(client, id, owner);
    // Tombstone the queue entry first. Late worker writes require its active lease.
    await client.query("UPDATE website_audits SET status='deleted',stage='finished',url='',hostname='',origin='',pages='[]',collection_limitations='[]',report=NULL,assessment='{}',decisions='{}',error=NULL,lease_token=NULL,lease_expires_at=NULL,updated_at=now() WHERE id=$1 AND owner_hash=$2", [id, owner]);
    await client.query("DELETE FROM website_audit_assessment_revisions WHERE audit_id=$1", [id]);
    await client.query("DELETE FROM website_audit_report_downloads WHERE audit_id=$1", [id]);
  });
}

export interface EnquiryInput {
  revision: number; idempotencyKey: string; name: string; email: string; phone: string; message: string; selectedFindingIds: string[];
}

export async function submitOwnedEnquiry(id: string, owner: string | null, input: EnquiryInput): Promise<string> {
  return auditTransaction(async (client) => {
    const row = await ownedLocked(client, id, owner);
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`audit-enquiries:${owner}`]);
    const digest = requestDigest({ ...input, selectedFindingIds: [...new Set(input.selectedFindingIds)].sort(), auditId: id });
    const replay = await client.query<{ id: string; request_hash: string }>("SELECT id,request_hash FROM website_audit_enquiries WHERE owner_hash=$1 AND idempotency_key=$2", [owner, input.idempotencyKey]);
    if (replay.rows[0]) {
      const previous = replay.rows[0];
      if (previous.request_hash !== digest) throw new AuditError("This enquiry submission was already used. Review your details and try a new submission.", 409);
      return previous.id;
    }
    if (row.revision !== input.revision) throw new AuditError("Recommendations have changed. Review your selected improvements before sending an enquiry.", 409);
    if (!row.report || !["complete", "partial"].includes(row.status)) throw new AuditError("Wait for the report before requesting implementation help.", 409);
    const recent = await client.query<{ count: string }>("SELECT count(*) FROM website_audit_enquiries WHERE owner_hash=$1 AND created_at >= now() - INTERVAL '24 hours'", [owner]);
    if (Number(recent.rows[0].count) >= 3) throw new AuditError("You have already sent your enquiries today. Our team will follow up with you.", 429);
    const selectedIds = new Set(input.selectedFindingIds);
    if ([...selectedIds].some((findingId) => !row.report!.findings.some((finding) => finding.id === findingId))) throw new AuditError("A selected finding has changed. Review the latest report.", 409);
    const snapshot = {
      version: AUDIT_VERSION, url: row.url, hostname: row.hostname, revision: row.revision,
      summary: row.report.summary, assessment: row.assessment,
      recommendations: row.report.recommendations.filter((item) => row.decisions[item.id] === "included"),
      findings: row.report.findings.filter((finding) => selectedIds.has(finding.id)).map(({ id: findingId, title, action, verification }) => ({ id: findingId, title, action, verification })),
    };
    const enquiryId = randomUUID();
    await client.query("INSERT INTO website_audit_enquiries (id,audit_id,owner_hash,idempotency_key,assessment_revision,name,email,phone,message,snapshot,request_hash) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)", [enquiryId, id, owner, input.idempotencyKey, row.revision, input.name, input.email, input.phone, input.message, JSON.stringify(snapshot), digest]);
    return enquiryId;
  });
}

export async function heartbeatWorker(workerId: string): Promise<void> {
  await auditPool().query("INSERT INTO website_audit_workers(id,last_seen_at) VALUES ($1,now()) ON CONFLICT(id) DO UPDATE SET last_seen_at=now()", [workerId]);
}

export async function claimAudit(): Promise<{ id: string; url: string; leaseToken: string } | null> {
  return auditTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(74021902)");
    const active = await client.query<{ count: string }>("SELECT count(*) FROM website_audits WHERE status='running' AND lease_expires_at>now()");
    if (Number(active.rows[0].count) >= auditLimits().concurrent) return null;
    const leaseToken = randomUUID();
    const result = await client.query<AuditRow>(
    `UPDATE website_audits SET status='running',stage='discovering',lease_token=$1,lease_expires_at=now()+INTERVAL '90 seconds',started_at=COALESCE(started_at,now()),attempts=attempts+1,updated_at=now()
     WHERE id=(SELECT id FROM website_audits WHERE expires_at>now() AND attempts<2 AND (status='queued' OR (status='running' AND lease_expires_at<now())) ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`, [leaseToken],
  );
    const row = result.rows[0];
    return row ? { id: row.id, url: row.url, leaseToken } : null;
  });
}

export async function renewAuditLease(id: string, leaseToken: string): Promise<boolean> {
  const result = await auditPool().query("UPDATE website_audits SET lease_expires_at=now()+INTERVAL '90 seconds' WHERE id=$1 AND lease_token=$2 AND status='running' AND expires_at>now() AND started_at>now()-INTERVAL '10 minutes' RETURNING id", [id, leaseToken]);
  return result.rowCount === 1;
}

export async function checkpointAudit(id: string, leaseToken: string, progress: CrawlProgress): Promise<void> {
  const result = await auditPool().query("UPDATE website_audits SET stage=$3,checked_count=$4,discovered_count=$5,pages=$6::jsonb,updated_at=now(),lease_expires_at=now()+INTERVAL '90 seconds' WHERE id=$1 AND lease_token=$2 AND status='running' AND expires_at>now() RETURNING id", [id, leaseToken, progress.stage, progress.checked, progress.discovered, JSON.stringify(progress.pages)]);
  if (!result.rowCount) throw new AuditError("Audit is no longer active.", 409);
}

export async function finishAudit(id: string, leaseToken: string, result: CrawlResult): Promise<void> {
  const snapshot = await auditPool().query<AuditRow>("UPDATE website_audits SET stage='recommending',updated_at=now() WHERE id=$1 AND lease_token=$2 AND status='running' AND expires_at>now() RETURNING *", [id, leaseToken]);
  const initial = snapshot.rows[0];
  if (!initial) return;
  const initialReport = analyzeWebsite({ url: initial.url, pages: result.pages, assessment: initial.assessment, performance: result.performance, fieldPerformance: result.fieldPerformance, limitations: result.limitations });
  // Optional external work occurs outside the database lock. A newer assessment wins.
  const explainedReport = await enhanceAuditExplanations(initialReport);
  await auditTransaction(async (client) => {
    const current = await client.query<AuditRow>("SELECT * FROM website_audits WHERE id=$1 AND lease_token=$2 AND status='running' AND expires_at>now() FOR UPDATE", [id, leaseToken]);
    const row = current.rows[0];
    if (!row) return;
    const report = row.revision === initial.revision ? explainedReport : analyzeWebsite({ url: row.url, pages: result.pages, assessment: row.assessment, performance: result.performance, fieldPerformance: result.fieldPerformance, limitations: result.limitations });
    const fetched = result.pages.filter((page) => page.status === "fetched" && page.statusCode !== null && page.statusCode >= 200 && page.statusCode < 300).length;
    const status: AuditStatus = !fetched ? "failed" : result.pages.some((page) => page.status !== "fetched") || report.collectionMode === "html" ? "partial" : "complete";
    await client.query("UPDATE website_audits SET report=$3::jsonb,pages=$4::jsonb,checked_count=$5,discovered_count=$6,status=$7,stage='finished',revision=revision+1,lease_token=NULL,lease_expires_at=NULL,updated_at=now(),error=$8,collection_limitations=$9::jsonb WHERE id=$1 AND lease_token=$2", [id, leaseToken, JSON.stringify(report), JSON.stringify(result.pages), result.pages.length, result.discovered, status, fetched ? null : "No readable public pages could be assessed. The website may be unavailable or restrict automated access.", JSON.stringify(result.limitations)]);
  });
}

export async function failAudit(id: string, leaseToken: string): Promise<void> {
  await auditTransaction(async (client) => {
    const current = await client.query<AuditRow>("SELECT * FROM website_audits WHERE id=$1 AND lease_token=$2 AND status='running' FOR UPDATE", [id, leaseToken]);
    const row = current.rows[0];
    if (!row) return;
    const pages = row.pages ?? [];
    const report = pages.some((page) => page.status === "fetched") ? analyzeWebsite({ url: row.url, pages, assessment: row.assessment, limitations: ["The scan ended before every planned check completed. Results describe only the retained page observations."] }) : null;
    await client.query("UPDATE website_audits SET status=$3,stage='finished',report=$4::jsonb,revision=revision+1,lease_token=NULL,lease_expires_at=NULL,updated_at=now(),error=$5 WHERE id=$1 AND lease_token=$2", [id, leaseToken, report ? "partial" : "failed", report ? JSON.stringify(report) : null, report ? "Some checks could not finish. Available observations are shown below." : "This website could not be assessed. Verify the public URL or try again later."]);
  });
}

export async function expireAuditData(): Promise<void> {
  await auditTransaction(async (client) => {
    await client.query("UPDATE website_audits SET status='failed',stage='finished',lease_token=NULL,lease_expires_at=NULL,error='The scan could not finish. Please start a new audit.',updated_at=now() WHERE status IN ('running','queued') AND (created_at<now()-INTERVAL '15 minutes' OR (attempts>=2 AND lease_expires_at<now()))");
    const expired = await client.query<{ id: string }>("UPDATE website_audits SET status='expired',stage='finished',url='',hostname='',origin='',pages='[]',collection_limitations='[]',report=NULL,assessment='{}',decisions='{}',error=NULL,lease_token=NULL,lease_expires_at=NULL WHERE expires_at<now() AND status NOT IN ('expired','deleted') RETURNING id");
    for (const row of expired.rows) await client.query("DELETE FROM website_audit_assessment_revisions WHERE audit_id=$1", [row.id]);
    await client.query("DELETE FROM website_audit_report_downloads WHERE expires_at<=now() OR audit_id IN (SELECT id FROM website_audits WHERE status IN ('expired','deleted'))");
    await client.query("DELETE FROM website_audits WHERE expires_at<now()-INTERVAL '1 day' AND status IN ('expired','deleted')");
    await client.query("DELETE FROM website_audit_workers WHERE last_seen_at<now()-INTERVAL '1 day'");
    await client.query("DELETE FROM website_audit_enquiries WHERE created_at<now()-INTERVAL '24 months'");
  });
}
