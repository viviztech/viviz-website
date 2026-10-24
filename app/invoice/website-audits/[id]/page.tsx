import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AuditError } from "@/lib/website-audit/errors";
import { getStaffAudit } from "@/lib/website-audit/staff";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Technical website report | Viviz staff", robots: { index: false, follow: false } };

const words = (value: string) => value.replaceAll("_", " ");
const card = "rounded-xl border border-slate-700 bg-slate-900 p-5 sm:p-6";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section className="mt-10"><h2 className="mb-4 text-2xl font-semibold">{title}</h2><div className="grid gap-4">{children}</div></section>;
}

function Source({ url, children }: { url: string; children?: ReactNode }) {
  let safe = false;
  try { safe = ["http:", "https:"].includes(new URL(url).protocol); } catch { /* Display invalid references as text only. */ }
  return safe ? <a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-cyan-300 underline">{children ?? url}</a> : <span className="break-all">{children ?? url}</span>;
}

function Evidence({ items }: { items: { url: string; detail: string }[] }) {
  return <ul className="mt-4 grid gap-3 border-t border-slate-700 pt-4 text-sm text-slate-300">{items.map((item, index) => <li key={index}><Source url={item.url} /><p className="mt-1 whitespace-pre-wrap break-words">{item.detail}</p></li>)}</ul>;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return <div className="mt-3"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-200">{children}</dd></div>;
}

export default async function StaffAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let audit;
  try { audit = await getStaffAudit(id); }
  catch (error) {
    if (error instanceof AuditError && error.status === 401) redirect("/invoice/login");
    if (error instanceof AuditError && error.status === 404) notFound();
    return <main className="mx-auto max-w-5xl px-5 py-16"><h1 className="text-3xl font-bold">Technical report unavailable</h1><p role="status" className="mt-5 text-slate-300">{error instanceof AuditError ? error.message : "Technical reports are temporarily unavailable. Please try again shortly."}</p><Link href="/invoice/website-audits" className="mt-6 inline-block text-cyan-300 underline">Back to website audits</Link></main>;
  }
  const report = audit.report;
  const ready = report && ["complete", "partial"].includes(audit.status);
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
    <Link href="/invoice/website-audits" className="text-sm text-cyan-300 underline">All website audits</Link>
    <div className="mt-8 flex flex-wrap items-start justify-between gap-5">
      <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Viviz staff only / technical report</p><h1 className="mt-3 break-words text-3xl font-bold sm:text-4xl">{audit.hostname}</h1><p className="mt-3 break-all text-xs text-slate-400">Report ID {audit.id} · Revision {audit.revision}</p></div>
      {ready && <a href={`/api/invoices/website-audits/${audit.id}/report`} className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Download technical PDF</a>}
    </div>
    <div className={`${card} mt-6`}><p className="text-sm text-slate-300">{audit.status} · Stage {audit.stage} · {audit.progress.checked} of {audit.progress.discovered} discovered pages checked · Collection limit {audit.progress.limit}</p><p className="mt-2 text-xs text-slate-400">Created {audit.createdAt} · Updated {audit.updatedAt} · Expires {audit.expiresAt}</p><p className="mt-3 text-sm"><Source url={audit.url} /></p>{audit.error && <p className="mt-3 text-amber-200">{audit.error}</p>}</div>
    {!report && <p role="status" className="mt-6 rounded-xl border border-amber-800 bg-amber-950/30 p-5 text-amber-100">A completed analysis is not yet available. Collected page observations and customer context appear below.</p>}
    {report && <>
      <Section title="Analysis and category coverage">
        <div className={card}><p className="whitespace-pre-wrap text-slate-200">{report.summary}</p><p className="mt-4 text-xs text-slate-400">Analysis {report.version} · Generated {report.generatedAt} · {report.collectionMode} collection · {words(report.explanationMode)} · {report.specialistCoverage} business coverage</p></div>
        <div className="grid gap-4 sm:grid-cols-2">{report.categories.map((item) => <article key={item.category} className={card}><h3 className="font-semibold">{item.label}: {item.score === null ? "Not scored" : `${item.score}/100`}</h3><p className="mt-2 text-sm text-slate-300">{item.note}</p><p className="mt-3 text-xs text-slate-400">{item.coverage} · {item.assessed} assessed / {item.applicable} applicable / {item.passed} passed</p></article>)}</div>
      </Section>
      <Section title="Technical findings and evidence">
        {report.findings.length === 0 && <p className={card}>No rule findings were generated for the checked pages.</p>}
        {report.findings.map((item) => <article key={item.id} className={card}>
          <p className="text-xs text-cyan-300">{words(item.type)} · {item.category} · {item.severity} priority · {item.confidence} confidence · {item.effort} effort</p><h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
          <p className="mt-2 break-words font-mono text-xs text-slate-400">{item.id} / {item.rule} · Affected {item.affectedCount} / {item.checkedCount} checked</p>
          <dl><Detail label="Observed">{item.observation}</Detail><Detail label="Why it matters">{item.why}</Detail><Detail label="Implementation action">{item.action}</Detail><Detail label="Verification">{item.verification}</Detail></dl><Evidence items={item.evidence} />
        </article>)}
      </Section>
      <Section title="Measured performance">
        <div className={card}><h3 className="font-semibold">Real visitor performance (CrUX)</h3><dl>{Object.entries(report.fieldPerformance).map(([key, value]) => <Detail key={key} label={words(key)}>{String(value)}</Detail>)}</dl></div>
        {report.performance.map((item, index) => <article key={index} className={card}><h3 className="font-semibold">{item.device}: {item.status}</h3><p className="mt-2 text-sm"><Source url={item.url} /></p><p className="mt-2 text-xs text-slate-400">Fetched {item.fetchedAt}{item.lighthouseVersion ? ` · Lighthouse ${item.lighthouseVersion}` : ""}</p><dl>{item.scores && <Detail label="Lighthouse scores">{Object.entries(item.scores).map(([key, value]) => `${key}: ${value ?? "unavailable"}`).join(" · ")}</Detail>}{item.metrics && <Detail label="Metrics">LCP {item.metrics.lcpMs ?? "unavailable"} ms · CLS {item.metrics.cls ?? "unavailable"} · TBT {item.metrics.tbtMs ?? "unavailable"} ms</Detail>}{item.error && <Detail label="Measurement limitation">{item.error}</Detail>}</dl>{item.diagnostics?.map((diagnostic) => <div key={diagnostic.id} className="mt-4 border-t border-slate-700 pt-4"><p className="text-sm font-semibold">{diagnostic.title}</p><p className="mt-1 text-xs text-slate-400">{diagnostic.id}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-300">{diagnostic.detail}</p></div>)}</article>)}
      </Section>
      <Section title="Capabilities and implementation recommendations">
        {report.capabilities.map((item) => <details key={item.code} className={card}><summary className="cursor-pointer font-semibold">{words(item.code)}: {words(item.state)}</summary><p className="mt-3 text-sm text-slate-300">{item.detail}</p><Evidence items={item.evidence} /></details>)}
        {report.recommendations.map((item) => <article key={item.id} className={card}><p className="text-xs text-cyan-300">{words(item.level)} · {words(item.sequence)} · {item.confidence} confidence · {item.effort} effort</p><h3 className="mt-2 text-lg font-semibold">{item.title}</h3><p className="mt-2 text-sm text-amber-200">Customer choice: {words(audit.decisions[item.id] ?? "not_selected")}</p><dl><Detail label="Reason">{item.reason}</Detail><Detail label="Benefit hypothesis">{item.benefit}</Detail><Detail label="Existing alternative">{item.currentAlternative}</Detail><Detail label="Implementation action">{item.action}</Detail><Detail label="Tradeoff">{item.tradeoff}</Detail><Detail label="Prerequisites">{item.prerequisites.map((need) => `${need.label} (${need.state})`).join("; ") || "None listed"}</Detail><Detail label="Verification">{item.verification}</Detail><Detail label="Rule references">{item.ruleIds.join(", ")}</Detail></dl><Evidence items={item.evidence} /></article>)}
      </Section>
      {report.aiAnalysis && <Section title="AI interpretation — provisional review">
        <div className={card}><p className="text-sm text-amber-200">AI interpretations require Viviz review. Evidence references point to retained findings, capabilities or page observations; they do not independently verify missing functionality or market trends.</p><p className="mt-4 text-slate-200">{report.aiAnalysis.summary}</p></div>
        {report.aiAnalysis.strengths.map((item, index) => <article key={index} className={card}><h3 className="font-semibold">Observed strength</h3><p className="mt-3 text-sm text-slate-200">{item.text}</p><p className="mt-3 break-words font-mono text-xs text-slate-400">Evidence: {item.evidenceIds.join(", ")}</p></article>)}
        {report.aiAnalysis.findingExplanations.map((item) => <article key={item.findingId} className={card}><p className="break-words font-mono text-xs text-slate-400">Finding explanation: {item.findingId}</p><h3 className="mt-2 font-semibold">{item.title}</h3><dl><Detail label="Observation">{item.observation}</Detail><Detail label="Why it matters">{item.why}</Detail><Detail label="Suggested action">{item.action}</Detail></dl></article>)}
        {report.aiAnalysis.recommendationExplanations.map((item) => <article key={item.recommendationId} className={card}><p className="break-words font-mono text-xs text-slate-400">Recommendation explanation: {item.recommendationId}</p><h3 className="mt-2 font-semibold">{item.title}</h3><dl><Detail label="Reason">{item.reason}</Detail><Detail label="Benefit hypothesis">{item.benefit}</Detail><Detail label="Suggested action">{item.action}</Detail><Detail label="Tradeoff">{item.tradeoff}</Detail></dl></article>)}
        {report.aiAnalysis.insights.map((item) => <article key={item.id} className={card}><h3 className="font-semibold">{item.title}</h3><p className="mt-3 text-sm text-slate-200">{item.reason}</p><dl><Detail label="Suggestion to investigate">{item.suggestion}</Detail><Detail label="Question for the business">{item.question}</Detail><Detail label="Evidence references">{item.evidenceIds.join(", ")}</Detail></dl></article>)}
        <ol className={`${card} list-inside list-decimal space-y-3 text-sm text-slate-200`}>{report.aiAnalysis.nextSteps.map((step, index) => <li key={index}>{step}</li>)}</ol>
      </Section>}
      <Section title="Business facts and readiness"><div className={card}><dl>{report.facts.map((fact, index) => <Detail key={index} label={fact.key}>{fact.value}<span className="mt-1 block text-xs text-slate-400">{words(fact.source)} · {fact.confidence} confidence · {fact.reference}</span></Detail>)}</dl></div>{report.readiness.map((item, index) => <article key={index} className={card}><h3 className="font-semibold">{item.label}: {words(item.state)}</h3><p className="mt-3 text-sm text-slate-300">{item.basis}</p></article>)}</Section>
      <Section title="Analysis limitations"><ul className={`${card} list-inside list-disc space-y-3 text-sm text-slate-300`}>{report.limitations.map((item, index) => <li key={index}>{item}</li>)}</ul></Section>
    </>}
    <Section title="Customer supplied business context"><div className={card}><dl><Detail label="Business type">{words(audit.assessment.businessType)}</Detail><Detail label="Customer type">{audit.assessment.customerType}</Detail><Detail label="Primary customer task">{words(audit.assessment.mainTask)}</Detail><Detail label="Goals">{audit.assessment.goals.map(words).join(", ") || "Not supplied"}</Detail><Detail label="Pain points">{audit.assessment.painPoints.map(words).join(", ") || "Not supplied"}</Detail><Detail label="Existing tools">{Object.entries(audit.assessment.tools).map(([key, value]) => `${key}: ${words(value)}`).join(" · ")}</Detail><Detail label="Appointments needed">{audit.assessment.appointmentsNeeded}</Detail><Detail label="Team size">{audit.assessment.teamSize}</Detail></dl></div></Section>
    <Section title="Collected page observations">
      {audit.collectionLimitations.length > 0 && <ul className={`${card} list-inside list-disc space-y-2 text-sm text-slate-300`}>{audit.collectionLimitations.map((item, index) => <li key={index}>{item}</li>)}</ul>}
      {audit.collectedPages.map((page, index) => <details key={`${page.url}-${index}`} className={card}><summary className="cursor-pointer break-words text-sm font-semibold">{page.status} {page.statusCode ? `/ HTTP ${page.statusCode}` : ""} · {page.url}</summary><dl><Detail label="Fetched at">{page.fetchedAt} · {page.rendered ? "Rendered" : "Public HTML"}</Detail><Detail label="Title">{page.title || "Not observed"}</Detail><Detail label="Description">{page.description || "Not observed"}</Detail><Detail label="Main headings">{page.h1.join("; ") || "Not observed"}</Detail><Detail label="Language">{page.language || "Not observed"}</Detail><Detail label="Canonical">{page.canonical || "Not observed"}</Detail><Detail label="Viewport">{page.viewport || "Not observed"}</Detail><Detail label="Robots directives">{page.robotsMeta || "Not observed"}</Detail>{page.error && <Detail label="Collection issue">{page.error}</Detail>}<Detail label="Structured data">{page.structuredData.map((data) => `${data.valid ? "Valid JSON" : "Invalid JSON"}: ${data.types.join(", ") || "No types"}`).join("; ") || "Not observed"}</Detail><Detail label="Public response headers">{Object.entries(page.headers).filter(([key]) => /^(content-type|cache-control|x-robots-tag|content-security-policy|strict-transport-security|x-frame-options|x-content-type-options|referrer-policy|permissions-policy)$/i.test(key)).map(([key, value]) => `${key}: ${value}`).join("\n") || "Not observed"}</Detail><Detail label="Page text">{page.text || "No page text collected"}</Detail></dl>
        {page.links.length > 0 && <details className="mt-5 border-t border-slate-700 pt-4"><summary className="cursor-pointer text-sm font-semibold">Links ({page.links.length})</summary><ul className="mt-3 grid gap-2 text-sm">{page.links.map((link, linkIndex) => <li key={linkIndex}><Source url={link.url} />{link.text && <span className="ml-2 text-slate-400">{link.text}</span>}</li>)}</ul></details>}
        {page.images.length > 0 && <details className="mt-5 border-t border-slate-700 pt-4"><summary className="cursor-pointer text-sm font-semibold">Images ({page.images.length})</summary><ul className="mt-3 grid gap-3 text-sm text-slate-300">{page.images.map((image, imageIndex) => <li key={imageIndex} className="break-all">{image.src}<span className="block text-slate-400">Alt: {image.alt === null ? "Missing attribute" : image.alt || "Empty"} · Dimensions {image.width ?? "unspecified"} × {image.height ?? "unspecified"}</span></li>)}</ul></details>}
        {page.forms.length > 0 && <details className="mt-5 border-t border-slate-700 pt-4"><summary className="cursor-pointer text-sm font-semibold">Forms ({page.forms.length})</summary>{page.forms.map((form, formIndex) => <div key={formIndex} className="mt-3 text-sm text-slate-300"><p className="break-all">Action: {form.action || "Current page"}</p><ul className="mt-2 list-inside list-disc space-y-1">{form.inputs.map((input, inputIndex) => <li key={inputIndex} className="break-words">{input.type} · {input.name || "Unnamed"} · Label: {input.label || "Not observed"} · {input.required ? "Required" : "Optional"}</li>)}</ul></div>)}</details>}
      </details>)}
    </Section>
  </main>;
}
