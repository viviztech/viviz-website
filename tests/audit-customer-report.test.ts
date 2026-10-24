import assert from "node:assert/strict";
import test from "node:test";
import { toCustomerAudit } from "../lib/website-audit/customer-report";
import { customerAuditJson } from "../lib/website-audit/http";
import { SAMPLE_AUDIT } from "../lib/website-audit/sample";
import type { AuditAiAnalysis } from "../lib/website-audit/types";

test("customer responses retain selection IDs but exclude technical observations and diagnostics", async () => {
  const audit = structuredClone(SAMPLE_AUDIT);
  const report = audit.report!;
  const marker = "STAFF_ONLY_DIAGNOSTIC";
  report.pages[0].headers["content-security-policy"] = marker;
  report.pages[0].text = marker;
  report.pages[0].canonical = `https://fixture.example/${marker}`;
  report.findings.forEach(item => { item.title = marker; item.observation = marker; item.why = marker; item.action = marker; item.verification = marker; item.evidence.forEach(evidence => evidence.detail = marker); });
  report.summary = marker;
  audit.error = marker;
  report.categories.forEach(item => item.note = marker);
  report.limitations.push(marker);
  report.fieldPerformance = { status: "unavailable", reason: marker };
  const before = structuredClone(audit);
  const customer = toCustomerAudit(audit);
  assert.deepEqual(audit, before, "Projection must not change the retained technical report.");
  assert.deepEqual(customer.report!.gaps.map(item => item.id), report.findings.map(item => item.id));
  assert.deepEqual(customer.report!.improvements.map(item => item.id), report.recommendations.map(item => item.id));
  assert.equal(customer.revision, audit.revision);
  assert.deepEqual(customer.decisions, audit.decisions);
  assert.equal(customer.report!.analysisMode, "rules");
  const response = customerAuditJson(audit);
  assert.equal(response.headers.get("cache-control"), "private, no-store, max-age=0");
  const serialized = await response.text();
  assert.ok(!serialized.includes(marker));
  for (const field of ["headers", "canonical", "structuredData", "performance", "fieldPerformance", "categories", "verification", "ruleIds", "collectionMode", "aiAnalysis"]) {
    assert.ok(!serialized.includes(`"${field}":`), `${field} must stay out of the customer response.`);
  }
  assert.ok(serialized.includes("Some pages did not open"));
  assert.ok(serialized.includes("We did not sign in, submit forms"));
});

test("customer report has useful plain-language fallback for every implemented finding", () => {
  const audit = structuredClone(SAMPLE_AUDIT);
  const template = audit.report!.findings[0];
  const codes = ["http-response", "https-entry", "checked-link-errors", "collection-gaps", "html-title", "html-description", "html-main-heading", "canonical-url", "structured-data-json", "duplicate-title-review", "noindex-review", "image-alt-signal", "html-language", "form-label-review", "accessibility-manual-journey", "mobile-viewport", "lab-performance-mobile-1234", "field-core-web-vitals", "offering-clarity-review", "customer-contact-route", "form-delivery-manual"];
  audit.report!.findings = codes.map(code => ({ ...template, id: `finding-${code}`, rule: `${code}@1.0.0` }));
  const customer = toCustomerAudit(audit).report!;
  assert.equal(customer.gaps.length, codes.length);
  for (const gap of customer.gaps) {
    assert.ok(gap.title.length > 10);
    assert.notEqual(gap.title, "Ask your website team to review this area", gap.id);
    assert.ok(!/HTTP|JSON|canonical|viewport|H1|HTML|Core Web Vitals/i.test([gap.title, gap.observation, gap.why, gap.action].join(" ")), gap.id);
  }
  const exclusion = customer.gaps.find(item => item.id === "finding-noindex-review")!;
  assert.match(exclusion.observation, /may be intentional/);
  const delivery = customer.gaps.find(item => item.id === "finding-form-delivery-manual")!;
  assert.match(delivery.observation, /did not submit/);
});

test("AI analysis stays advisory, uses the same selections, and resolves known page references", () => {
  const audit = structuredClone(SAMPLE_AUDIT);
  const report = audit.report!;
  const findingId = report.findings[0].id;
  const recommendationId = report.recommendations[0].id;
  const analysis: AuditAiAnalysis = {
    summary: "Visitors could benefit from a clearer route through your services.",
    strengths: [{ text: "There is public information about your services.", evidenceIds: ["p1"] }],
    findingExplanations: [{ findingId, title: "Help visitors reach your pages", observation: "Some checked pages did not open.", why: "Visitors may be unable to find useful information.", action: "Review those pages with your website team." }],
    recommendationExplanations: [{ recommendationId, title: "Make the next step easier", reason: "Visitors may need more guidance.", benefit: "Help people choose a useful next step.", action: "Review the existing contact options.", tradeoff: "Someone needs to keep the information accurate." }],
    insights: [{ id: "ai-opportunity-1", title: "Help visitors prepare for a conversation", reason: "A short guide could help visitors decide what to ask.", suggestion: "Consider explaining what happens during an introductory call.", evidenceIds: ["p1", findingId, "unknown-source"], question: "What do customers usually ask before a call?" }],
    nextSteps: ["Review the important pages with your website team."],
  };
  report.aiAnalysis = analysis;
  report.explanationMode = "ai_assisted";
  const customer = toCustomerAudit(audit).report!;
  assert.equal(customer.analysisMode, "ai_assisted");
  assert.equal(customer.summary, analysis.summary);
  assert.equal(customer.gaps[0].id, findingId);
  assert.equal(customer.gaps[0].title, analysis.findingExplanations[0].title);
  assert.equal(customer.improvements[0].id, recommendationId);
  assert.equal(customer.ideas.length, 1);
  assert.ok(customer.ideas[0].pages.includes(report.pages[0].url));
  assert.ok(!JSON.stringify(customer).includes("unknown-source"));
  assert.match(customer.scopeNote, /ideas to confirm/);
  assert.ok(!customer.gaps.some(item => item.id === analysis.insights[0].id), "Advisory ideas cannot become selected technical findings.");
});

test("customer projection handles old, pending and unreadable reports without implying a healthy website", () => {
  const pending = structuredClone(SAMPLE_AUDIT);
  pending.report = null;
  pending.status = "queued";
  assert.equal(toCustomerAudit(pending).report, null);
  const audit = structuredClone(SAMPLE_AUDIT);
  audit.url = "https://fixture.example/path?private=value#section";
  audit.report!.pages.forEach(page => { page.status = "failed"; page.statusCode = null; });
  const customer = toCustomerAudit(audit);
  assert.equal(customer.url, "https://fixture.example/path");
  assert.match(customer.report!.summary, /could not read enough/);
  assert.deepEqual(customer.report!.strengths, []);
  assert.equal(customer.report!.analysisMode, "rules");
});

test("customer scope distinguishes available real-visitor data from a separate loading test", () => {
  const audit = structuredClone(SAMPLE_AUDIT);
  audit.report!.performance = [];
  audit.report!.fieldPerformance = { status: "measured", scope: "origin", lcpMs: 2100 };
  const customer = toCustomerAudit(audit).report!;
  assert.match(customer.scopeNote, /sample of real visits/);
  assert.ok(!customer.scopeNote.includes("Loading speed was not measured"));
});
