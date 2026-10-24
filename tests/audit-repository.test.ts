import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import test from "node:test";
import { loadEnvConfig } from "@next/env";
import { analyzeWebsite } from "../lib/website-audit/analyze";
import { AuditError } from "../lib/website-audit/errors";
import { SAMPLE_AUDIT } from "../lib/website-audit/sample";
import { EMPTY_ASSESSMENT, type AuditReport, type AuditView, type BusinessAssessment, type CrawlResult } from "../lib/website-audit/types";
import type { EnquiryInput } from "../lib/website-audit/repository";

const status = (expected: number) => (error: unknown) => error instanceof AuditError && error.status === expected;
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Explicit opt-in only. These tests write to a local, migrated development database. */
test("local Postgres audit repository integration", { skip: process.env.AUDIT_DB_TESTS !== "true", timeout: 60000 }, async (t) => {
  loadEnvConfig(process.cwd());
  assert.ok(process.env.DATABASE_URL, "AUDIT_DB_TESTS requires a local DATABASE_URL.");
  const destination = new URL(process.env.DATABASE_URL);
  assert.ok(["postgres:", "postgresql:"].includes(destination.protocol), "Repository tests require a Postgres connection.");
  assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(destination.hostname), "Refusing repository integration tests against a non-local database.");
  assert.ok(!["host", "hostaddr", "service"].some((key) => destination.searchParams.has(key)), "Refusing connection parameters that can replace the local database host.");

  // Import database modules only after loading and checking the connection configuration.
  const repository = await import("../lib/website-audit/repository");
  const { auditPool } = await import("../lib/website-audit/database");
  const pool = auditPool();
  const runId = randomUUID();
  const workerId = `repository-test-${runId}`;
  const owners = new Set<string>();
  const previousEnvironment = {
    AUDIT_ENABLED: process.env.AUDIT_ENABLED,
    AUDIT_SESSION_DAILY_LIMIT: process.env.AUDIT_SESSION_DAILY_LIMIT,
    AUDIT_IP_DAILY_LIMIT: process.env.AUDIT_IP_DAILY_LIMIT,
    AUDIT_GLOBAL_DAILY_LIMIT: process.env.AUDIT_GLOBAL_DAILY_LIMIT,
    AUDIT_AI_ENABLED: process.env.AUDIT_AI_ENABLED,
    AUDIT_MAX_CONCURRENT: process.env.AUDIT_MAX_CONCURRENT,
    AUDIT_EXECUTION_MODE: process.env.AUDIT_EXECUTION_MODE,
    AUDIT_WORKER_URL: process.env.AUDIT_WORKER_URL,
    AUDIT_WORKER_SECRET: process.env.AUDIT_WORKER_SECRET,
  };
  process.env.AUDIT_ENABLED = "true";
  process.env.AUDIT_SESSION_DAILY_LIMIT = "100";
  process.env.AUDIT_IP_DAILY_LIMIT = "1000";
  process.env.AUDIT_GLOBAL_DAILY_LIMIT = "10000";
  process.env.AUDIT_AI_ENABLED = "false";
  process.env.AUDIT_MAX_CONCURRENT = "2";
  process.env.AUDIT_EXECUTION_MODE = "standalone";
  const newOwner = () => {
    const owner = createHash("sha256").update(`${runId}:${randomUUID()}`).digest("hex");
    owners.add(owner);
    return owner;
  };
  const ipHash = createHash("sha256").update(`${runId}:fictional-ip`).digest("hex");
  const create = async (owner = newOwner(), assessment = clone(SAMPLE_AUDIT.assessment)) => {
    const url = `https://fixture-${randomUUID()}.example/`;
    return repository.createQueuedAudit({ owner, url, ipHash, idempotencyKey: randomUUID(), assessment });
  };
  const seedReport = async (owner = newOwner(), assessment = clone(SAMPLE_AUDIT.assessment)): Promise<AuditView> => {
    const audit = await create(owner, assessment);
    const origin = new URL(audit.url).origin;
    const pages = JSON.parse(JSON.stringify(SAMPLE_AUDIT.report!.pages).replaceAll("https://northstarstudio.example", origin)) as AuditReport["pages"];
    const collectionNotes = ["Repository test fixture: no network request was made."];
    const report = analyzeWebsite({ url: audit.url, pages, assessment, limitations: collectionNotes });
    await pool.query(
      "UPDATE website_audits SET status='partial',stage='finished',pages=$2::jsonb,report=$3::jsonb,checked_count=$4,discovered_count=$4,collection_limitations=$5::jsonb WHERE id=$1",
      [audit.id, JSON.stringify(pages), JSON.stringify(report), pages.length, JSON.stringify(collectionNotes)],
    );
    return repository.getOwnedAudit(audit.id, owner);
  };
  const enquiry = (audit: AuditView, overrides: Partial<EnquiryInput> = {}): EnquiryInput => ({
    revision: audit.revision, idempotencyKey: randomUUID(), name: "Fictional Test Owner", email: "owner@fixture.example", phone: "", message: "Local repository test; do not deliver.", selectedFindingIds: audit.report?.findings[0] ? [audit.report.findings[0].id] : [], ...overrides,
  });
  const download = (audit: AuditView) => ({
    revision: audit.revision, idempotencyKey: randomUUID(), name: "Fictional Report Reader", email: "reader@fixture.example",
  });
  const selectRecommendation = (audit: AuditView) => {
    const recommendation = audit.report?.recommendations.find((item) => item.level !== "not_needed_now");
    assert.ok(recommendation, "The fixture must contain an applicable recommendation.");
    return recommendation;
  };
  const collection: CrawlResult = {
    pages: clone(SAMPLE_AUDIT.report!.pages), discovered: SAMPLE_AUDIT.report!.pages.length,
    limitations: ["Fictional local repository fixture."], performance: [], fieldPerformance: { status: "unavailable", reason: "Fixture has no measurements." },
  };
  try {
    await repository.heartbeatWorker(workerId);

    await t.test("service availability refuses a disabled scan before creating a row", async () => {
      const owner = newOwner();
      process.env.AUDIT_ENABLED = "false";
      try {
        assert.equal(await repository.workerOnline(), false);
        await assert.rejects(create(owner), status(503));
        const rows = await pool.query<{ count: string }>("SELECT count(*) FROM website_audits WHERE owner_hash=$1", [owner]);
        assert.equal(Number(rows.rows[0].count), 0);
      } finally { process.env.AUDIT_ENABLED = "true"; }
      assert.equal(await repository.workerOnline(), true);
    });

    await t.test("configured background execution accepts work without a heartbeat while retaining quotas", async () => {
      const owner = newOwner();
      process.env.AUDIT_EXECUTION_MODE = "netlify";
      process.env.AUDIT_WORKER_URL = "https://viviz-audit-fixture.netlify.app/.netlify/functions/audit";
      process.env.AUDIT_WORKER_SECRET = "a".repeat(64);
      process.env.AUDIT_SESSION_DAILY_LIMIT = "1";
      await pool.query("DELETE FROM website_audit_workers WHERE id=$1", [workerId]);
      try {
        const online = await pool.query("SELECT 1 FROM website_audit_workers WHERE last_seen_at>now()-INTERVAL '90 seconds'");
        assert.equal(online.rowCount, 0, "Run repository tests without a separate active local worker.");
        assert.equal(await repository.workerOnline(), true);
        const audit = await create(owner);
        assert.equal(audit.status, "queued");
        await assert.rejects(create(owner), status(429));
        await repository.cancelOwnedAudit(audit.id, owner);
      } finally {
        process.env.AUDIT_SESSION_DAILY_LIMIT = "100";
        process.env.AUDIT_EXECUTION_MODE = "standalone";
        delete process.env.AUDIT_WORKER_URL;
        delete process.env.AUDIT_WORKER_SECRET;
        await repository.heartbeatWorker(workerId);
      }
    });

    await t.test("incomplete or unsupported execution configuration refuses work before inserting it", async () => {
      const owner = newOwner();
      try {
        for (const configuration of [
          { mode: "netlify", url: "", secret: "a".repeat(64) },
          { mode: "netlify", url: "https://viviz-audit-fixture.netlify.app/.netlify/functions/audit", secret: "short" },
          { mode: "unsupported", url: "", secret: "" },
        ]) {
          process.env.AUDIT_EXECUTION_MODE = configuration.mode;
          process.env.AUDIT_WORKER_URL = configuration.url;
          process.env.AUDIT_WORKER_SECRET = configuration.secret;
          assert.equal(await repository.workerOnline(), false);
          await assert.rejects(create(owner), status(503));
        }
        const rows = await pool.query<{ count: string }>("SELECT count(*) FROM website_audits WHERE owner_hash=$1", [owner]);
        assert.equal(Number(rows.rows[0].count), 0);
      } finally {
        process.env.AUDIT_EXECUTION_MODE = "standalone";
        delete process.env.AUDIT_WORKER_URL;
        delete process.env.AUDIT_WORKER_SECRET;
      }
    });

    await t.test("background callbacks claim only their exact audit and cannot replay active or completed work", async () => {
      const unrelatedOwner = newOwner();
      const unrelated = await create(unrelatedOwner);
      const target = await create();
      await pool.query("UPDATE website_audits SET created_at=now()-INTERVAL '1 minute' WHERE id=$1", [unrelated.id]);
      assert.equal(await repository.claimAudit("invalid-audit-id"), null);
      assert.equal(await repository.claimAudit(randomUUID()), null);
      const duplicates = await Promise.all(Array.from({ length: 4 }, () => repository.claimAudit(target.id)));
      const claims = duplicates.filter((claim) => claim !== null);
      assert.equal(claims.length, 1, "Concurrent callbacks must share one fenced claim.");
      assert.equal(claims[0].id, target.id);
      assert.equal((await repository.getOwnedAudit(unrelated.id, unrelatedOwner)).status, "queued");
      assert.equal(await repository.claimAudit(target.id), null);
      await repository.finishAudit(target.id, claims[0].leaseToken, collection);
      assert.equal(await repository.claimAudit(target.id), null);
      assert.equal((await repository.getOwnedAudit(unrelated.id, unrelatedOwner)).status, "queued");
      await repository.cancelOwnedAudit(unrelated.id, unrelatedOwner);
    });

    await t.test("dispatch discovery returns bounded identifiers for pending or recoverable work only", async () => {
      const queued = await create();
      const recoverable = await create();
      const active = await create();
      const exhausted = await create();
      const old = await create();
      const expired = await create();
      const completed = await seedReport();
      await pool.query("UPDATE website_audits SET created_at=now()-INTERVAL '14 minutes' WHERE id=ANY($1::uuid[])", [[queued.id, recoverable.id]]);
      await pool.query("UPDATE website_audits SET status='running',attempts=1,lease_token=$2,lease_expires_at=now()-INTERVAL '1 second',started_at=now()-INTERVAL '1 minute' WHERE id=$1", [recoverable.id, randomUUID()]);
      await pool.query("UPDATE website_audits SET status='running',attempts=1,lease_token=$2,lease_expires_at=now()+INTERVAL '90 seconds',started_at=now() WHERE id=$1", [active.id, randomUUID()]);
      await pool.query("UPDATE website_audits SET attempts=2 WHERE id=$1", [exhausted.id]);
      await pool.query("UPDATE website_audits SET created_at=now()-INTERVAL '16 minutes' WHERE id=$1", [old.id]);
      await pool.query("UPDATE website_audits SET expires_at=now()-INTERVAL '1 second' WHERE id=$1", [expired.id]);
      assert.equal(await repository.hasDispatchableAudit(queued.id), true);
      assert.equal(await repository.hasDispatchableAudit(recoverable.id), true);
      const excluded = [active.id, exhausted.id, old.id, expired.id, completed.id];
      for (const id of [...excluded, randomUUID(), "invalid-audit-id"]) assert.equal(await repository.hasDispatchableAudit(id), false);
      const defaultIds = await repository.listDispatchableAuditIds();
      assert.ok(defaultIds.length <= 2);
      const ids = await repository.listDispatchableAuditIds(1000);
      assert.ok(ids.length <= 10);
      assert.ok(ids.includes(queued.id));
      assert.ok(ids.includes(recoverable.id));
      assert.ok(!ids.some((id) => excluded.includes(id)));
      assert.ok(ids.every((id) => typeof id === "string" && /^[\da-f-]{36}$/i.test(id)));
      assert.ok((await repository.listDispatchableAuditIds(Number.NaN)).length <= 2);
      // Leave no active fixture lease for subsequent repository tests.
      await pool.query("UPDATE website_audits SET status='canceled',lease_token=NULL,lease_expires_at=NULL WHERE id=ANY($1::uuid[])", [[queued.id, recoverable.id, active.id, exhausted.id, old.id, expired.id]]);
    });

    await t.test("ownership checks hide reports and mutations from a different browser", async () => {
      const owner = newOwner();
      const intruder = newOwner();
      const audit = await seedReport(owner);
      const recommendation = selectRecommendation(audit);
      await assert.rejects(repository.getOwnedAudit(audit.id, intruder), status(404));
      await assert.rejects(repository.getOwnedAudit(audit.id, null), status(404));
      await assert.rejects(repository.updateOwnedAssessment(audit.id, intruder, audit.revision, clone(EMPTY_ASSESSMENT)), status(404));
      await assert.rejects(repository.decideOwnedRecommendation(audit.id, intruder, audit.revision, recommendation.id, "included"), status(404));
      await assert.rejects(repository.submitOwnedEnquiry(audit.id, intruder, enquiry(audit)), status(404));
      await assert.rejects(repository.cancelOwnedAudit(audit.id, intruder), status(404));
      await assert.rejects(repository.deleteOwnedAudit(audit.id, intruder), status(404));
      assert.equal((await repository.getOwnedAudit(audit.id, owner)).id, audit.id);
    });

    await t.test("scan idempotency returns one row and rejects a changed URL or assessment", async () => {
      const owner = newOwner();
      const assessment = clone(EMPTY_ASSESSMENT);
      const input = { owner, ipHash, url: `https://idempotency-${randomUUID()}.example/`, idempotencyKey: randomUUID(), assessment };
      const [first, replay] = await Promise.all([repository.createQueuedAudit(input), repository.createQueuedAudit(clone(input))]);
      assert.equal(first.id, replay.id);
      const count = await pool.query<{ count: string }>("SELECT count(*) FROM website_audits WHERE owner_hash=$1 AND idempotency_key=$2", [owner, input.idempotencyKey]);
      assert.equal(Number(count.rows[0].count), 1);
      await assert.rejects(repository.createQueuedAudit({ ...input, url: "https://changed-payload.example/" }), status(409));
      await assert.rejects(repository.createQueuedAudit({ ...input, assessment: { ...assessment, mainTask: "booking" } }), status(409));
      const reordered: BusinessAssessment = { ...assessment, tools: { whatsapp: "unknown", analytics: "unknown", booking: "unknown", crm: "unknown" } };
      assert.equal((await repository.createQueuedAudit({ ...input, assessment: reordered })).id, first.id, "Object-key order must not change the canonical request digest.");
    });

    await t.test("decision revisions reject stale tabs and enquiries retain a reviewed immutable snapshot", async () => {
      const owner = newOwner();
      const audit = await seedReport(owner);
      const recommendation = selectRecommendation(audit);
      const selected = await repository.decideOwnedRecommendation(audit.id, owner, audit.revision, recommendation.id, "included");
      assert.equal(selected.revision, audit.revision + 1);
      await assert.rejects(repository.decideOwnedRecommendation(audit.id, owner, audit.revision, recommendation.id, "later"), status(409));
      await assert.rejects(repository.updateOwnedAssessment(audit.id, owner, audit.revision, clone(EMPTY_ASSESSMENT)), status(409));
      await assert.rejects(repository.submitOwnedEnquiry(audit.id, owner, enquiry(audit)), status(409));
      await assert.rejects(repository.submitOwnedEnquiry(audit.id, owner, enquiry(selected, { selectedFindingIds: ["finding-does-not-exist"] })), status(409));
      const finding = selected.report!.findings[0];
      assert.ok(finding);
      const input = enquiry(selected, { selectedFindingIds: [finding.id] });
      const id = await repository.submitOwnedEnquiry(audit.id, owner, input);
      const saved = await pool.query<{ snapshot: Record<string, unknown>; assessment_revision: number }>("SELECT snapshot,assessment_revision FROM website_audit_enquiries WHERE id=$1", [id]);
      assert.equal(saved.rows[0].assessment_revision, selected.revision);
      assert.deepEqual(saved.rows[0].snapshot.recommendations, [recommendation]);
      assert.deepEqual(saved.rows[0].snapshot.findings, [{ id: finding.id, title: finding.title, action: finding.action, verification: finding.verification }]);
      const changed = await repository.decideOwnedRecommendation(audit.id, owner, selected.revision, recommendation.id, "later");
      await repository.updateOwnedAssessment(audit.id, owner, changed.revision, { ...clone(SAMPLE_AUDIT.assessment), businessType: "local_service" });
      const unchanged = await pool.query<{ snapshot: Record<string, unknown> }>("SELECT snapshot FROM website_audit_enquiries WHERE id=$1", [id]);
      assert.deepEqual(unchanged.rows[0].snapshot, saved.rows[0].snapshot, "Later assessment and selection changes must not alter submitted work.");
    });

    await t.test("cancellation and deletion revoke worker leases and cannot be undone by late writes", async () => {
      const owner = newOwner();
      const audit = await create(owner);
      const lease = randomUUID();
      await pool.query("UPDATE website_audits SET status='running',lease_token=$2,lease_expires_at=now()+INTERVAL '90 seconds',started_at=now() WHERE id=$1", [audit.id, lease]);
      assert.equal((await repository.cancelOwnedAudit(audit.id, owner)).status, "canceled");
      assert.equal(await repository.renewAuditLease(audit.id, lease), false);
      const progress = { stage: "checking" as const, checked: collection.pages.length, discovered: collection.discovered, pages: collection.pages };
      await assert.rejects(repository.checkpointAudit(audit.id, lease, progress), status(409));
      await repository.finishAudit(audit.id, lease, collection);
      await repository.failAudit(audit.id, lease);
      const canceled = await repository.getOwnedAudit(audit.id, owner);
      assert.equal(canceled.status, "canceled");
      assert.equal(canceled.report, null);
      assert.equal(canceled.progress.checked, 0);
      await repository.deleteOwnedAudit(audit.id, owner);
      await assert.rejects(repository.getOwnedAudit(audit.id, owner), status(404));
      await assert.rejects(repository.checkpointAudit(audit.id, lease, progress), status(409));
      await repository.finishAudit(audit.id, lease, collection);
      await repository.failAudit(audit.id, lease);
      const tombstone = await pool.query<{ status: string; report: unknown; pages: unknown[]; url: string }>("SELECT status,report,pages,url FROM website_audits WHERE id=$1", [audit.id]);
      assert.equal(tombstone.rows[0].status, "deleted");
      assert.equal(tombstone.rows[0].report, null);
      assert.deepEqual(tombstone.rows[0].pages, []);
      assert.equal(tombstone.rows[0].url, "");
      const revisions = await pool.query<{ count: string }>("SELECT count(*) FROM website_audit_assessment_revisions WHERE audit_id=$1", [audit.id]);
      assert.equal(Number(revisions.rows[0].count), 0);
    });

    await t.test("reassessment removes an obsolete general-only limitation while retaining collection facts", async () => {
      const owner = newOwner();
      const audit = await seedReport(owner, { ...clone(SAMPLE_AUDIT.assessment), businessType: "ecommerce" });
      assert.equal(audit.report!.specialistCoverage, "general");
      assert.ok(audit.report!.limitations.some((note) => note.includes("receives general checks")));
      const updated = await repository.updateOwnedAssessment(audit.id, owner, audit.revision, clone(SAMPLE_AUDIT.assessment));
      assert.equal(updated.report!.specialistCoverage, "specialist");
      assert.ok(!updated.report!.limitations.some((note) => note.includes("receives general checks")));
      assert.ok(updated.report!.limitations.includes("Repository test fixture: no network request was made."));
      assert.equal(updated.assessment.businessType, "b2b_service");
    });

    await t.test("concurrent enquiry retries create one record and bind every submitted field", async () => {
      const owner = newOwner();
      const audit = await seedReport(owner);
      const input = enquiry(audit);
      const ids = await Promise.all(Array.from({ length: 6 }, () => repository.submitOwnedEnquiry(audit.id, owner, clone(input))));
      assert.equal(new Set(ids).size, 1);
      const rows = await pool.query<{ count: string }>("SELECT count(*) FROM website_audit_enquiries WHERE owner_hash=$1 AND idempotency_key=$2", [owner, input.idempotencyKey]);
      assert.equal(Number(rows.rows[0].count), 1);
      for (const changed of [{ name: "Changed owner" }, { phone: "12345" }, { message: "Different submitted scope" }, { email: "another@fixture.example" }, { selectedFindingIds: [] }]) {
        await assert.rejects(repository.submitOwnedEnquiry(audit.id, owner, { ...input, ...changed }), status(409));
      }
      const second = await seedReport(owner);
      await assert.rejects(repository.submitOwnedEnquiry(second.id, owner, { ...input, revision: second.revision }), status(409));
    });

    await t.test("PDF contact capture requires ownership and a current, available report", async () => {
      const owner = newOwner();
      const audit = await seedReport(owner);
      const input = download(audit);
      await assert.rejects(repository.recordOwnedReportDownload(audit.id, newOwner(), input), status(404));
      await assert.rejects(repository.recordOwnedReportDownload(audit.id, null, input), status(404));
      await assert.rejects(repository.recordOwnedReportDownload(randomUUID(), owner, input), status(404));
      await assert.rejects(repository.recordOwnedReportDownload("invalid-audit-id", owner, input), status(404));
      await assert.rejects(repository.recordOwnedReportDownload(audit.id, owner, { ...input, revision: audit.revision + 1 }), status(409));

      const pendingOwner = newOwner();
      const pending = await create(pendingOwner);
      await assert.rejects(repository.recordOwnedReportDownload(pending.id, pendingOwner, download(pending)), status(409));
      await pool.query("UPDATE website_audits SET status='partial',report=NULL WHERE id=$1", [pending.id]);
      await assert.rejects(repository.recordOwnedReportDownload(pending.id, pendingOwner, download(pending)), status(409));
      await pool.query("UPDATE website_audits SET status='running',report=$2::jsonb WHERE id=$1", [pending.id, JSON.stringify(audit.report)]);
      await assert.rejects(repository.recordOwnedReportDownload(pending.id, pendingOwner, download(pending)), status(409));

      await pool.query("UPDATE website_audits SET expires_at=now()-INTERVAL '1 second' WHERE id=$1", [audit.id]);
      await assert.rejects(repository.recordOwnedReportDownload(audit.id, owner, input), status(410));
      const contacts = await pool.query<{ count: string }>("SELECT count(*) FROM website_audit_report_downloads WHERE owner_hash=ANY($1::text[])", [[owner, pendingOwner]]);
      assert.equal(Number(contacts.rows[0].count), 0, "Rejected downloads must not retain contact details.");
    });

    await t.test("concurrent PDF retries save one private contact without changing the report or creating an enquiry", async () => {
      const owner = newOwner();
      const audit = await seedReport(owner);
      const input = download(audit);
      const reports = await Promise.all(Array.from({ length: 6 }, () => repository.recordOwnedReportDownload(audit.id, owner, clone(input))));
      for (const returned of reports) {
        assert.equal(returned.id, audit.id);
        assert.equal(returned.revision, audit.revision, "Downloading must not invalidate another report action.");
        assert.deepEqual(returned.report, audit.report);
        assert.deepEqual(Object.keys(returned).sort(), Object.keys(audit).sort());
        assert.ok(!JSON.stringify(returned).includes(input.name));
        assert.ok(!JSON.stringify(returned).includes(input.email));
        assert.ok(!JSON.stringify(returned).includes(input.idempotencyKey));
      }
      assert.deepEqual(await repository.getOwnedAudit(audit.id, owner), audit);
      const contacts = await pool.query<{ audit_id: string; name: string; email: string; report_revision: number; expires_at: Date; requested_at: Date }>(
        "SELECT audit_id,name,email,report_revision,expires_at,requested_at FROM website_audit_report_downloads WHERE owner_hash=$1 AND idempotency_key=$2",
        [owner, input.idempotencyKey],
      );
      assert.equal(contacts.rowCount, 1);
      assert.equal(contacts.rows[0].audit_id, audit.id);
      assert.equal(contacts.rows[0].name, input.name);
      assert.equal(contacts.rows[0].email, input.email);
      assert.equal(contacts.rows[0].report_revision, audit.revision);
      assert.ok(contacts.rows[0].requested_at instanceof Date);
      assert.equal(contacts.rows[0].expires_at.toISOString(), audit.expiresAt);
      const enquiries = await pool.query<{ count: string }>("SELECT count(*) FROM website_audit_enquiries WHERE owner_hash=$1", [owner]);
      assert.equal(Number(enquiries.rows[0].count), 0, "A PDF download must not create an implementation enquiry.");

      for (const changed of [{ name: "Different Reader" }, { email: "different@fixture.example" }, { revision: audit.revision + 1 }]) {
        await assert.rejects(repository.recordOwnedReportDownload(audit.id, owner, { ...input, ...changed }), status(409));
      }
      const second = await seedReport(owner);
      await assert.rejects(repository.recordOwnedReportDownload(second.id, owner, { ...input, revision: second.revision }), status(409));
      const recommendation = selectRecommendation(audit);
      const changed = await repository.decideOwnedRecommendation(audit.id, owner, audit.revision, recommendation.id, "included");
      await assert.rejects(repository.recordOwnedReportDownload(audit.id, owner, input), status(409));
      const later = await repository.recordOwnedReportDownload(audit.id, owner, download(changed));
      assert.equal(later.revision, changed.revision);
      assert.deepEqual(later.report, changed.report);
    });

    await t.test("deleting a report removes PDF contacts and prevents later retries from recreating them", async () => {
      const owner = newOwner();
      const audit = await seedReport(owner);
      const input = download(audit);
      await repository.recordOwnedReportDownload(audit.id, owner, input);
      await repository.deleteOwnedAudit(audit.id, owner);
      await assert.rejects(repository.recordOwnedReportDownload(audit.id, owner, input), status(404));
      await assert.rejects(repository.recordOwnedReportDownload(audit.id, owner, download(audit)), status(404));
      const contacts = await pool.query<{ count: string }>("SELECT count(*) FROM website_audit_report_downloads WHERE audit_id=$1", [audit.id]);
      assert.equal(Number(contacts.rows[0].count), 0);
    });

    await t.test("concurrent scan requests cannot exceed the browser quota", async () => {
      const owner = newOwner();
      process.env.AUDIT_SESSION_DAILY_LIMIT = "1";
      try {
        const attempts = await Promise.allSettled(Array.from({ length: 4 }, () => create(owner)));
        assert.equal(attempts.filter((attempt) => attempt.status === "fulfilled").length, 1);
        const failures = attempts.filter((attempt) => attempt.status === "rejected");
        assert.equal(failures.length, 3);
        assert.ok(failures.every((attempt) => attempt.status === "rejected" && status(429)(attempt.reason)));
        const rows = await pool.query<{ count: string }>("SELECT count(*) FROM website_audits WHERE owner_hash=$1", [owner]);
        assert.equal(Number(rows.rows[0].count), 1);
      } finally { process.env.AUDIT_SESSION_DAILY_LIMIT = "100"; }
    });

    await t.test("expired reports reject reads, retries and mutations", async () => {
      const owner = newOwner();
      const assessment = clone(EMPTY_ASSESSMENT);
      const input = { owner, ipHash, url: `https://expired-${randomUUID()}.example/`, idempotencyKey: randomUUID(), assessment };
      const audit = await repository.createQueuedAudit(input);
      await pool.query("UPDATE website_audits SET expires_at=now()-INTERVAL '1 second' WHERE id=$1", [audit.id]);
      await assert.rejects(repository.getOwnedAudit(audit.id, owner), status(410));
      await assert.rejects(repository.createQueuedAudit(input), status(410));
      await assert.rejects(repository.updateOwnedAssessment(audit.id, owner, audit.revision, assessment), status(410));
      await assert.rejects(repository.cancelOwnedAudit(audit.id, owner), status(410));
      await assert.rejects(repository.submitOwnedEnquiry(audit.id, owner, enquiry(audit)), status(410));
    });

    await t.test("the three-enquiry owner limit remains atomic across different report rows", async () => {
      const owner = newOwner();
      const reports: AuditView[] = [];
      for (let index = 0; index < 4; index++) reports.push(await seedReport(owner));
      const attempts = await Promise.allSettled(reports.map((audit) => repository.submitOwnedEnquiry(audit.id, owner, enquiry(audit))));
      const successes = attempts.filter((attempt) => attempt.status === "fulfilled");
      const failures = attempts.filter((attempt) => attempt.status === "rejected");
      assert.equal(successes.length, 3);
      assert.equal(failures.length, 1);
      assert.ok(failures.every((attempt) => attempt.status === "rejected" && status(429)(attempt.reason)));
      const rows = await pool.query<{ count: string }>("SELECT count(*) FROM website_audit_enquiries WHERE owner_hash=$1", [owner]);
      assert.equal(Number(rows.rows[0].count), 3);
    });
  } finally {
    try {
      const owned = [...owners];
      await pool.query("DELETE FROM website_audit_report_downloads WHERE owner_hash=ANY($1::text[])", [owned]);
      await pool.query("DELETE FROM website_audit_enquiries WHERE owner_hash=ANY($1::text[])", [owned]);
      await pool.query("DELETE FROM website_audit_assessment_revisions WHERE audit_id IN (SELECT id FROM website_audits WHERE owner_hash=ANY($1::text[]))", [owned]);
      await pool.query("DELETE FROM website_audits WHERE owner_hash=ANY($1::text[])", [owned]);
      await pool.query("DELETE FROM website_audit_workers WHERE id=$1", [workerId]);
    } finally {
      for (const [key, value] of Object.entries(previousEnvironment)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
      }
      await pool.end();
    }
  }
});
