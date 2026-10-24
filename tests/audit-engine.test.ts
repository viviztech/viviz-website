import assert from "node:assert/strict";
import test from "node:test";
import { CAPABILITY_CATALOG, validateCatalog } from "../lib/growth-planning/catalog";
import { deriveBusinessContext, observeCapabilities, resolvePrerequisites } from "../lib/growth-planning/planner";
import { analyzeWebsite, scoreCategory } from "../lib/website-audit/analyze";
import { SAMPLE_AUDIT } from "../lib/website-audit/sample";
import { EMPTY_ASSESSMENT, type AnalyzeInput, type BusinessAssessment, type PageObservation } from "../lib/website-audit/types";

const url = "https://fixture.example/";
function page(extra: Partial<PageObservation> = {}): PageObservation {
  return { url, status: "fetched", statusCode: 200, fetchedAt: "2026-10-24T00:00:00Z", title: "Professional services", description: "Useful professional support for your business.", h1: ["Our services"], language: "en", canonical: url, viewport: "width=device-width, initial-scale=1", robotsMeta: "", text: "We provide professional services for businesses. Our services help companies improve their public websites and communicate clearly with customers. Tell our team about the next stage of your business and discuss the right way to begin.", links: [], images: [], forms: [], structuredData: [], headers: {}, rendered: false, ...extra };
}
function assessment(extra: Partial<BusinessAssessment> = {}): BusinessAssessment {
  return { ...structuredClone(EMPTY_ASSESSMENT), ...extra };
}
function input(extra: Partial<AnalyzeInput> = {}): AnalyzeInput {
  return { url, pages: [page()], assessment: assessment(), ...extra };
}

test("catalog has unique versioned contracts and valid dependency references", () => {
  assert.equal(CAPABILITY_CATALOG.length, 20);
  assert.doesNotThrow(() => validateCatalog(CAPABILITY_CATALOG));
  assert.throws(() => validateCatalog([...CAPABILITY_CATALOG, CAPABILITY_CATALOG[0]]), /duplicate/);
  assert.throws(() => validateCatalog([{ ...CAPABILITY_CATALOG[0], requiresAll: ["invented"] }]), /Unknown/);
  assert.throws(() => validateCatalog([{ ...CAPABILITY_CATALOG[0], version: "latest" }]), /version/);
  assert.throws(() => validateCatalog([{ ...CAPABILITY_CATALOG[0], requiresAll: [CAPABILITY_CATALOG[0].code] }]), /cycle/);
});

test("unknown business answers stay unknown and do not prescribe internal software", () => {
  const report = analyzeWebsite(input());
  assert.equal(report.capabilities.find((item) => item.code === "crm_handoff")?.state, "unknown");
  assert.equal(report.capabilities.find((item) => item.code === "analytics")?.state, "unknown");
  assert.equal(report.readiness.find((item) => item.label === "Enquiry handling")?.state, "unknown");
  assert.ok(!report.recommendations.some((item) => ["crm_handoff", "follow_up", "ai_assistant", "appointments"].includes(item.code)));
  assert.ok(!report.facts.some((fact) => fact.source === "respondent_report"));
});

test("entirely failed collection has no healthy grades or missing public features", () => {
  const report = analyzeWebsite(input({ pages: [page({ status: "failed", statusCode: null, text: "", error: "Timeout" })], assessment: assessment({ businessType: "b2b_service", mainTask: "enquiry" }) }));
  assert.ok(report.categories.every((category) => category.score === null));
  assert.ok(report.capabilities.every((item) => item.state === "unknown"));
  assert.equal(report.recommendations.length, 0);
  assert.ok(report.findings.some((item) => item.id === "finding-collection-gaps"));
  assert.equal(report.categories.find((item) => item.category === "seo")?.coverage, "unavailable");
});

test("access blocks with response codes are never considered healthy", () => {
  const report = analyzeWebsite(input({ pages: [page({ status: "blocked", statusCode: 403, text: "" })] }));
  assert.ok(report.categories.every((category) => category.score !== 100));
  assert.ok(report.findings.some((item) => item.rule.startsWith("http-response@")));
  assert.ok(report.capabilities.every((item) => item.state === "unknown"));
});

test("thin client-rendered shells do not establish absent content or features", () => {
  const report = analyzeWebsite(input({ pages: [page({ text: "Loading...", title: "App" })], assessment: assessment({ businessType: "b2b_service", mainTask: "enquiry" }) }));
  assert.ok(report.capabilities.every((item) => item.state === "unknown"));
  assert.equal(report.recommendations.length, 0);
  assert.equal(report.collectionMode, "html");
  assert.ok(report.limitations.some((item) => item.includes("does not render JavaScript")));
});

test("repeated page defects are grouped without multiplying rule weights", () => {
  const first = analyzeWebsite(input({ pages: [page({ description: "" })] }));
  const many = analyzeWebsite(input({ pages: [page({ description: "" }), page({ url: `${url}services`, description: "" })] }));
  const findings = many.findings.filter((item) => item.rule.startsWith("html-description@"));
  assert.equal(findings.length, 1);
  assert.equal(findings[0].affectedCount, 2);
  assert.equal(findings[0].checkedCount, 2);
  assert.equal(findings[0].evidence.length, 2);
  assert.equal(first.categories.find((item) => item.category === "seo")?.score, many.categories.find((item) => item.category === "seo")?.score);
});

test("unknown score weight is excluded and low coverage hides the score", () => {
  const limited = scoreCategory("seo", [{ category: "seo", weight: 2, result: "pass" }, { category: "seo", weight: 2, result: "unknown" }], "sample");
  assert.equal(limited.score, null);
  assert.equal(limited.coverage, "limited");
  assert.equal(limited.assessed, 2);
  assert.equal(limited.applicable, 4);
  const assessed = scoreCategory("seo", [{ category: "seo", weight: 3, result: "pass" }, { category: "seo", weight: 1, result: "unknown" }], "sample");
  assert.equal(assessed.score, 100);
  assert.equal(assessed.passed, 3);
});

test("HTML metadata never produces full accessibility, mobile or performance grades", () => {
  const report = analyzeWebsite(input());
  for (const category of ["accessibility", "mobile", "performance", "content", "conversion"]) assert.equal(report.categories.find((item) => item.category === category)?.score, null);
  assert.equal(report.categories.find((item) => item.category === "performance")?.coverage, "unavailable");
  assert.equal(report.explanationMode, "rules");
});

test("missing image alt and form label signals include scoped evidence", () => {
  const report = analyzeWebsite(input({ pages: [page({ images: [{ src: `${url}team.jpg`, alt: null, width: null, height: null }, { src: `${url}decoration.jpg`, alt: "", width: null, height: null }], forms: [{ action: "/contact", inputs: [{ name: "email", type: "email", label: "", required: true }, { name: "token", type: "hidden", label: "", required: false }] }] })] }));
  assert.ok(report.findings.find((item) => item.rule.startsWith("image-alt-signal@"))?.evidence[0].detail.includes("1 of 2"));
  const labels = report.findings.find((item) => item.rule.startsWith("form-label-review@"));
  assert.equal(labels?.type, "manual_review");
  assert.ok(!labels?.evidence[0].detail.includes("token"));
});

test("reported adequate CRM suppresses replacement and attributes process advice", () => {
  const a = assessment({ businessType: "b2b_service", teamSize: "multiple", painPoints: ["missed_enquiries"], tools: { ...EMPTY_ASSESSMENT.tools, crm: "adequate" } });
  const report = analyzeWebsite(input({ assessment: a }));
  assert.ok(!report.recommendations.some((item) => item.code === "crm_handoff"));
  const followUp = report.recommendations.find((item) => item.code === "follow_up");
  assert.ok(followUp);
  assert.ok(followUp.action.includes("existing CRM"));
  assert.ok(followUp.evidence.some((item) => item.detail.includes("Respondent-reported")));
  assert.ok(report.facts.some((item) => item.key === "tools.crm" && item.source === "respondent_report"));
  assert.ok(!report.findings.some((item) => /CRM/.test(item.title)));
});

test("booking is suppressed when explicitly unnecessary, even for local services", () => {
  const report = analyzeWebsite(input({ assessment: assessment({ businessType: "local_service", appointmentsNeeded: "no", mainTask: "enquiry", goals: ["more_bookings"] }) }));
  assert.equal(report.capabilities.find((item) => item.code === "appointments")?.state, "not_applicable");
  assert.ok(!report.recommendations.some((item) => item.code === "appointments"));
});

test("external scheduler satisfies booking instead of prescribing replacement", () => {
  const report = analyzeWebsite(input({ assessment: assessment({ businessType: "local_service", appointmentsNeeded: "yes", mainTask: "booking" }), pages: [page({ links: [{ url: "https://calendly.com/fixture/consultation", text: "Book an appointment" }] })] }));
  assert.equal(report.capabilities.find((item) => item.code === "appointments")?.state, "present");
  assert.ok(!report.recommendations.some((item) => item.code === "appointments"));
});

test("telephone booking is a valid alternative and newsletter forms are not enquiry routes", () => {
  const phone = analyzeWebsite(input({ assessment: assessment({ businessType: "local_service", appointmentsNeeded: "yes", mainTask: "booking" }), pages: [page({ text: `${page().text} Call us to book an appointment.`, links: [{ url: "tel:+441234567890", text: "Telephone our team" }] })] }));
  assert.equal(phone.capabilities.find((item) => item.code === "appointments")?.state, "present");
  assert.ok(!phone.recommendations.some((item) => item.code === "appointments"));
  const newsletter = analyzeWebsite(input({ pages: [page({ forms: [{ action: "https://fixture.example/newsletter/subscribe", inputs: [{ name: "email", type: "email", label: "Email", required: true }] }] })] }));
  assert.equal(newsletter.capabilities.find((item) => item.code === "service_enquiries")?.state, "not_observed");
});

test("B2B and local packs produce contextual differences and preserve industry exceptions", () => {
  const b2b = analyzeWebsite(input({ assessment: assessment({ businessType: "b2b_service" }) }));
  assert.ok(b2b.recommendations.some((item) => item.code === "case_studies"));
  const local = analyzeWebsite(input({ assessment: assessment({ businessType: "local_service" }), pages: [page({ text: "Our mobile repair service offers on-site service at your home. We repair household appliances using appropriate parts and useful advice. We come to you and discuss the best way to complete the work. Our services are tailored to the customer and their needs." })] }));
  assert.ok(local.recommendations.some((item) => item.code === "service_areas"));
  assert.ok(!local.recommendations.some((item) => item.code === "case_studies"));
  const realEstate = analyzeWebsite(input({ assessment: assessment({ businessType: "real_estate", mainTask: "enquiry" }) }));
  assert.equal(realEstate.specialistCoverage, "general");
  assert.ok(!realEstate.recommendations.some((item) => /inventory|listing|checkout/.test(item.code)));
});

test("non-English content does not generate unsupported missing-content recommendations", () => {
  const report = analyzeWebsite(input({ pages: [page({ language: "fr", text: "Nous proposons des services professionnels aux entreprises. Notre équipe accompagne ses clients dans leurs projets et répond aux questions. Découvrez les informations utiles à votre demande et contactez nos collaborateurs pour préparer la prochaine étape." })], assessment: assessment({ businessType: "b2b_service", mainTask: "enquiry" }) }));
  assert.equal(report.categories.find((item) => item.category === "content")?.coverage, "unavailable");
  assert.equal(report.recommendations.length, 0);
});

test("alternative prerequisites recognize existing routes and preserve unresolved ownership", () => {
  const observedInput = input({ pages: [page({ links: [{ url: `${url}contact`, text: "Contact us" }] })] });
  const context = deriveBusinessContext(observedInput);
  const observations = observeCapabilities(observedInput, context);
  const prerequisites = resolvePrerequisites("crm_handoff", observations, new Set());
  assert.equal(prerequisites.find((item) => item.label.startsWith("One of:"))?.state, "satisfied");
  assert.ok(prerequisites.some((item) => item.label === "Responsible recipient" && item.state === "unresolved"));
  assert.equal(resolvePrerequisites("reminders", observations, new Set(["appointments"]))[0].state, "planned");
  assert.equal(resolvePrerequisites("reminders", observations, new Set(), new Set(["appointments"]))[0].state, "blocked");
  assert.throws(() => resolvePrerequisites("invented", observations, new Set()), /Unregistered/);
});

test("AI is conditional assessment only and suppressed for healthcare", () => {
  const a = assessment({ businessType: "b2b_service", teamSize: "multiple", goals: ["save_time"], painPoints: ["repeated_questions"] });
  const pages = [page({ links: [{ url: `${url}faq`, text: "FAQ" }, { url: `${url}contact`, text: "Contact us" }] })];
  const report = analyzeWebsite(input({ pages, assessment: a }));
  const suggestion = report.recommendations.find((item) => item.code === "ai_assistant");
  assert.equal(suggestion?.delivery, "assessment_only");
  assert.ok(suggestion?.prerequisites.some((item) => item.state === "unresolved"));
  assert.ok(!analyzeWebsite(input({ pages, assessment: { ...a, businessType: "healthcare" } })).recommendations.some((item) => item.code === "ai_assistant"));
});

test("performance samples retain device, date and laboratory-field distinction", () => {
  const report = analyzeWebsite(input({ performance: [{ url, device: "mobile", status: "measured", fetchedAt: "2026-10-24T00:00:00Z", lighthouseVersion: "13.0.0", scores: { performance: 35, accessibility: 81, seo: 90, bestPractices: 100 }, metrics: { lcpMs: 5500, cls: 0.3, tbtMs: 1000 } }] }));
  assert.equal(report.categories.find((item) => item.category === "performance")?.score, null);
  const finding = report.findings.find((item) => item.category === "performance");
  assert.ok(finding?.evidence[0].detail.includes("mobile"));
  assert.ok(finding?.evidence[0].detail.includes("13.0.0"));
  assert.ok(finding?.action.includes("TBT"));
  assert.equal(report.fieldPerformance.status, "unavailable");
});

test("every report finding and recommendation has evidence and a controlled code", () => {
  assert.ok(SAMPLE_AUDIT.report);
  assert.ok(SAMPLE_AUDIT.hostname.endsWith(".example"));
  assert.ok(SAMPLE_AUDIT.report.limitations.some((item) => item.includes("ILLUSTRATIVE EXAMPLE")));
  for (const finding of SAMPLE_AUDIT.report.findings) {
    assert.ok(finding.evidence.length > 0);
    assert.ok(finding.evidence.every((item) => item.url.startsWith("https://")));
    assert.ok(finding.checkedCount >= finding.affectedCount || finding.rule.startsWith("checked-link-errors"));
  }
  for (const recommendation of SAMPLE_AUDIT.report.recommendations) {
    assert.ok(CAPABILITY_CATALOG.some((item) => item.code === recommendation.code));
    assert.ok(recommendation.evidence.length > 0);
    assert.ok(recommendation.ruleIds.length > 0);
    assert.ok(["assessment_only", "custom_implementation"].includes(recommendation.delivery));
  }
  assert.deepEqual(SAMPLE_AUDIT.decisions, {});
});

test("performance finding IDs fit enquiry validation even for long URLs", () => {
  const target = `${url}${"a-long-service-name-".repeat(70)}`;
  const report = analyzeWebsite(input({ performance: [{ url: target, device: "mobile", status: "measured", fetchedAt: "2026-10-24T00:00:00Z", scores: { performance: 25, accessibility: null, seo: null, bestPractices: null } }] }));
  const finding = report.findings.find((item) => item.category === "performance");
  assert.ok(finding);
  assert.ok(finding.id.length <= 100);
  assert.equal(finding.evidence[0].url, target);
  assert.equal(analyzeWebsite(input({ performance: report.performance })).findings.find((item) => item.category === "performance")?.id, finding.id);
});
