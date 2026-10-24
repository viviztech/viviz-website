"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Download, ExternalLink, FileSearch, Globe2, LoaderCircle, LockKeyhole, RefreshCw, ShieldCheck, Sparkles, Trash2, X } from "lucide-react";
import type { CustomerAuditView, CustomerReport, BusinessAssessment, Confidence, RecommendationDecision } from "@/lib/website-audit/types";
import AssessmentFields from "./AssessmentFields";
import PdfDownloadDialog from "./PdfDownloadDialog";
import styles from "./audit.module.css";

type View = "overview" | "issues" | "growth" | "plan";
type Gap = CustomerReport["gaps"][number];
type Improvement = CustomerReport["improvements"][number];
const VIEWS: [View, string][] = [["overview", "Overview"], ["issues", "Areas to improve"], ["growth", "Useful additions"], ["plan", "Your next steps"]];
const STAGES = [["discovering", "Find public pages"], ["checking", "Review your website"], ["measuring", "Check the visitor experience"], ["recommending", "Prepare your plan"]];
const TERMINAL = new Set(["complete", "partial", "failed", "canceled", "expired", "deleted"]);
const LEVEL_LABELS = { essential: "Important", recommended: "Useful next step", optional: "Optional", not_needed_now: "Not needed now" };
const SEQUENCE_LABELS = { fix_first: "Start here", improve_next: "Improve next", consider_later: "Consider later" };
const PRIORITY_LABELS = { high: "Start here", medium: "Improve next", low: "When you are ready", info: "Worth reviewing" };
const CONFIDENCE_LABELS: Record<Confidence, string> = { high: "Clear from this review", medium: "Worth checking", low: "Needs your confirmation" };
const DECISION_LABELS: Record<RecommendationDecision, string> = { included: "Discuss with Viviz", not_relevant: "Not relevant", later: "Consider later" };

function date(value: string) { return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(value)); }
function safeLink(value: string) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; } }
function PageLinks({ pages }: { pages: string[] }) {
  const links = [...new Set(pages)].filter(value => safeLink(value));
  if (!links.length) return null;
  return <details className={styles.evidence}><summary>Where we looked ({links.length})</summary><ul>{links.map(url => <li key={url}><a href={safeLink(url)!} target="_blank" rel="noopener noreferrer">{url}<ExternalLink size={11} aria-hidden="true" /></a></li>)}</ul></details>;
}
function GapCard({ gap, selected, onSelect, disabled }: { gap: Gap; selected: boolean; onSelect: () => void; disabled: boolean }) {
  return <article className={styles.card} id={`finding-${gap.id}`}>
    <div className={styles.findingTitle}><h3>{gap.title}</h3><span className={`${styles.badge} ${gap.priority === "high" ? styles.amber : ""}`}>{PRIORITY_LABELS[gap.priority]}</span></div>
    <p className={styles.customerObservation}>{gap.observation}</p>
    <dl className={styles.customerExplanation}><div><dt>Why this matters to your business</dt><dd>{gap.why}</dd></div><div><dt>What you can do</dt><dd>{gap.action}</dd></div></dl>
    <p className={styles.customerCertainty}>{CONFIDENCE_LABELS[gap.confidence]}</p>
    <PageLinks pages={gap.pages} />
    <label className={styles.check} style={{ marginTop: 20, marginBottom: 0 }}><input type="checkbox" checked={selected} onChange={onSelect} disabled={disabled} />Discuss this improvement with Viviz</label>
  </article>;
}
function ImprovementCard({ item, decision, onDecision, disabled }: { item: Improvement; decision?: RecommendationDecision; onDecision: (decision: RecommendationDecision) => void; disabled: boolean }) {
  return <article className={styles.card} id={`recommendation-${item.id}`}>
    <div className={styles.findingTitle}><h3>{item.title}</h3><span className={`${styles.badge} ${styles.purple}`}>{LEVEL_LABELS[item.level]}</span></div>
    <p className={styles.customerObservation}>{item.reason}</p>
    <dl className={styles.customerExplanation}><div><dt>How this could help</dt><dd>{item.benefit}</dd></div><div><dt>Suggested next step</dt><dd>{item.action}</dd></div><div><dt>Before you choose</dt><dd>{item.tradeoff}</dd></div></dl>
    {item.prerequisites.length ? <details className={styles.evidence}><summary>What to confirm first</summary><ul>{item.prerequisites.map((need, index) => <li key={index}>{need}</li>)}</ul></details> : null}
    <p className={styles.customerCertainty}>{CONFIDENCE_LABELS[item.confidence]}</p>
    <div className={styles.decisionRow} aria-label={`Decision for ${item.title}`}>{(Object.entries(DECISION_LABELS) as [RecommendationDecision, string][]).map(([value, text]) => <button type="button" className={styles.secondary} aria-pressed={decision === value} disabled={disabled} onClick={() => onDecision(value)} key={value}>{decision === value ? <Check size={12} aria-hidden="true" /> : null}{text}</button>)}</div>
  </article>;
}

function AssessmentEditor({ audit, disabled, onSave }: { audit: CustomerAuditView; disabled: boolean; onSave: (value: BusinessAssessment) => Promise<void> }) {
  const [assessment, setAssessment] = useState(audit.assessment);
  return <details className={styles.disclosure}><summary>Tell us more about your business · optional</summary><form onSubmit={event => { event.preventDefault(); void onSave(assessment); }}><AssessmentFields value={assessment} onChange={setAssessment} disabled={disabled} /><button type="submit" className={styles.secondary} disabled={disabled}><RefreshCw size={14} aria-hidden="true" /> Update recommendations</button><p className={styles.hint} style={{ marginTop: 12 }}>Your answers help us suggest changes that fit your business. We use the pages already reviewed. Check your selections after updating your answers.</p></form></details>;
}

function EnquiryForm({ audit, selectedFindings, disabled, onSubmitted, onError, onConflict }: { audit: CustomerAuditView; selectedFindings: Gap[]; disabled: boolean; onSubmitted: () => void; onError: (message: string) => void; onConflict: () => Promise<void> }) {
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const requestKey = useRef<{ fingerprint: string; key: string } | null>(null);
  const selectedModules = audit.report?.improvements.filter(item => audit.decisions[item.id] === "included") ?? [];
  const hasSelection = selectedFindings.length + selectedModules.length > 0;
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending || disabled || !hasSelection) return;
    setSending(true);
    const payload = { revision: audit.revision, name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, message: message.trim() || undefined, consent, selectedFindingIds: selectedFindings.map(item => item.id) };
    const fingerprint = JSON.stringify(payload);
    if (requestKey.current?.fingerprint !== fingerprint) requestKey.current = { fingerprint, key: crypto.randomUUID() };
    try {
      const response = await fetch(`/api/audits/${encodeURIComponent(audit.id)}/enquiry`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, idempotencyKey: requestKey.current.key }) });
      const data = await response.json() as { ok?: boolean; error?: string };
      if (response.status === 409) { requestKey.current = null; await onConflict(); throw new Error("Your report changed. Review the current improvements and send your enquiry again."); }
      if (!response.ok || !data.ok) throw new Error(data.error || "Your enquiry could not be sent. Please try again.");
      setSuccess(true); onSubmitted();
    } catch (cause) { onError(cause instanceof Error ? cause.message : "Your enquiry could not be sent. Please try again."); } finally { setSending(false); }
  }
  if (success) return <div className={`${styles.notice} ${styles.success}`} role="status"><CheckCircle2 size={21} aria-hidden="true" style={{ marginBottom: 12 }} /><strong>Your implementation enquiry has been sent.</strong><p style={{ marginTop: 8 }}>Viviz will review your selected improvements and contact you using the details you provided. A scope and quotation come next.</p><Link href="/products">Explore our website packages</Link></div>;
  return <div className={styles.card} id="implementation-enquiry"><div className={styles.heading}><p className={styles.eyebrow}>An optional next step</p><h2 style={{ marginTop: 10 }}>Get help with your improvements</h2><p>Choose the improvements you want to discuss. Viviz can explain the work, answer your questions and prepare a quotation.</p></div>{hasSelection ? <ul className={styles.reviewList}>{selectedFindings.map(item => <li key={item.id}><Check size={13} aria-hidden="true" /><span>{item.title} <span className={styles.hint}>· website improvement</span></span></li>)}{selectedModules.map(item => <li key={item.id}><Check size={13} aria-hidden="true" /><span>{item.title} <span className={styles.hint}>· {SEQUENCE_LABELS[item.sequence]}</span></span></li>)}</ul> : <p className={styles.empty}>Choose at least one improvement above to prepare your enquiry.</p>}<form onSubmit={send} style={{ marginTop: 23 }}><div className={styles.fieldGrid}><label className={styles.label}>Your name<input className={styles.input} required minLength={2} autoComplete="name" maxLength={100} value={name} onChange={event => setName(event.target.value)} disabled={disabled || sending} /></label><label className={styles.label}>Email address<input className={styles.input} type="email" required autoComplete="email" maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={disabled || sending} /></label></div><label className={styles.label}>Phone number <span className={styles.hint}>Optional</span><input className={styles.input} type="tel" autoComplete="tel" maxLength={40} value={phone} onChange={event => setPhone(event.target.value)} disabled={disabled || sending} /></label><label className={styles.label}>Anything else we should know? <span className={styles.hint}>Optional · avoid confidential or customer information.</span><textarea className={styles.textarea} maxLength={2000} value={message} onChange={event => setMessage(event.target.value)} disabled={disabled || sending} /></label><label className={styles.check}><input type="checkbox" required checked={consent} onChange={event => setConsent(event.target.checked)} disabled={disabled || sending} /><span>I agree to send my contact details, audit summary, selected improvements and optional business answers to Viviz so they can respond to this enquiry. <Link href="/privacy#website-audit" className={styles.textLink}>Privacy details</Link></span></label><button className={styles.button} type="submit" disabled={disabled || sending || !hasSelection}>{sending ? <><LoaderCircle size={14} className={styles.spin} aria-hidden="true" /> Sending enquiry…</> : <>Send implementation enquiry <ArrowRight size={14} aria-hidden="true" /></>}</button></form></div>;
}

export default function AuditReport({ id, initialAudit = null, demo = false }: { id: string; initialAudit?: CustomerAuditView | null; demo?: boolean }) {
  const [audit, setAudit] = useState<CustomerAuditView | null>(initialAudit);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(!initialAudit);
  const [busy, setBusy] = useState("");
  const [pdfOpen, setPdfOpen] = useState(false);
  const [view, setView] = useState<View>("overview");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [confirm, setConfirm] = useState<"cancel" | "delete" | null>(null);
  const [deleted, setDeleted] = useState(false);
  const mounted = useRef(true);
  const revision = useRef(initialAudit?.revision ?? 0);
  const updatedAt = useRef(initialAudit?.updatedAt ?? "");
  const endpoint = `/api/audits/${encodeURIComponent(id)}`;

  useEffect(() => {
    if (confirm) document.getElementById("confirm-audit-control")?.focus();
  }, [confirm]);

  function apply(next: CustomerAuditView) {
    if (next.revision < revision.current || (next.revision === revision.current && next.updatedAt < updatedAt.current)) return;
    revision.current = next.revision; updatedAt.current = next.updatedAt;
    setAudit(next);
    setSelected(previous => new Set([...previous].filter(key => next.report?.gaps.some(item => item.id === key))));
  }
  useEffect(() => {
    mounted.current = true;
    if (demo || deleted) return () => { mounted.current = false; };
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let inFlight = false;
    let failures = 0;
    let finished = false;
    function schedule(delay = 3000) { if (!disposed && !finished) timer = setTimeout(poll, delay); }
    async function poll() {
      if (disposed || finished || inFlight) return;
      if (document.hidden) { schedule(); return; }
      inFlight = true;
      controller = new AbortController();
      try {
        const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
        const data = await response.json() as { audit?: CustomerAuditView; error?: string };
        if (!response.ok || !data.audit) { if ([401, 403, 404, 410].includes(response.status)) finished = true; throw new Error(data.error || "The report could not be loaded. Try again."); }
        if (disposed) return;
        const next = data.audit;
        setAudit(previous => next.revision < (previous?.revision ?? 0) || (next.revision === previous?.revision && next.updatedAt < previous.updatedAt) ? previous : next);
        revision.current = Math.max(revision.current, next.revision);
        if (next.updatedAt > updatedAt.current) updatedAt.current = next.updatedAt;
        setError(""); failures = 0; finished = TERMINAL.has(next.status);
      } catch (cause) { if (disposed || (cause instanceof Error && cause.name === "AbortError")) return; failures++; setError(cause instanceof Error ? cause.message : "Connection lost. We will retry while this page is visible."); }
      finally { inFlight = false; if (!disposed) { setLoading(false); schedule(Math.min(30000, 3000 * 2 ** failures)); } }
    }
    function onVisibility() { if (!document.hidden && !finished) { clearTimeout(timer); void poll(); } }
    document.addEventListener("visibilitychange", onVisibility);
    void poll();
    return () => { disposed = true; mounted.current = false; clearTimeout(timer); controller?.abort(); document.removeEventListener("visibilitychange", onVisibility); };
  }, [endpoint, demo, retry, deleted]);

  async function refresh() {
    const response = await fetch(endpoint, { cache: "no-store" });
    const data = await response.json() as { audit?: CustomerAuditView; error?: string };
    if (!response.ok || !data.audit) throw new Error(data.error || "The report could not be refreshed.");
    if (mounted.current) apply(data.audit);
  }
  async function mutate(path: string, method: string, body?: object, message?: string) {
    if (demo || busy || !audit) return;
    setBusy(path); setError(""); setNotice("");
    try {
      const response = await fetch(`${endpoint}${path}`, { method, headers: { "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}) });
      const data = await response.json() as { audit?: CustomerAuditView; error?: string };
      if (response.status === 409) { await refresh(); throw new Error("Your report changed in another tab. Review the updated recommendations and your selections, then try again."); }
      if (!response.ok || !data.audit) throw new Error(data.error || "The change could not be saved. Please try again.");
      if (mounted.current) { apply(data.audit); if (message) setNotice(message); }
    } catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : "The change could not be saved. Check your connection and try again."); }
    finally { if (mounted.current) { setBusy(""); setConfirm(null); } }
  }
  async function remove() {
    if (demo || busy) return;
    setBusy("delete"); setError("");
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      if (!response.ok) { const data = await response.json() as { error?: string }; throw new Error(data.error || "The report could not be deleted. Try again."); }
      setDeleted(true); setAudit(null);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The report could not be deleted."); }
    finally { setBusy(""); setConfirm(null); }
  }
  function toggleFinding(key: string) { setSelected(previous => { const next = new Set(previous); if (next.has(key)) next.delete(key); else next.add(key); return next; }); }
  function showEnquiry() { setView("plan"); setTimeout(() => document.getElementById("implementation-enquiry")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }), 40); }

  if (deleted) return <div className={styles.root}><div className={styles.wrap}><div className={styles.progressPanel}><Trash2 size={25} aria-hidden="true" /><h1 className={styles.smallHeading} style={{ marginTop: 17 }}>Your report has been deleted.</h1><p>The report is no longer available. An enquiry you already sent follows the retention policy in our privacy notice.</p><Link href="/website-audit" className={styles.button} style={{ marginTop: 23 }}>Start another audit <ArrowRight size={14} aria-hidden="true" /></Link></div></div></div>;
  const report = audit?.report;
  const running = audit ? !TERMINAL.has(audit.status) : false;
  const unavailable = audit && ["failed", "canceled", "expired", "deleted"].includes(audit.status) && !report;
  const selectedFindings = report?.gaps.filter(item => selected.has(item.id)) ?? [];
  const selectedModules = report?.improvements.filter(item => audit?.decisions[item.id] === "included") ?? [];
  const selectionCount = selectedFindings.length + selectedModules.length;
  const disabled = demo || !!busy || running || !audit || !["complete", "partial"].includes(audit.status);
  const recommended = report?.improvements.filter(item => item.level !== "not_needed_now") ?? [];
  const checkedPages = report ? [...new Set([...report.gaps.flatMap(item => item.pages), ...report.ideas.flatMap(item => item.pages)])] : [];

  return <div className={styles.root}>
    {audit && report && !demo ? <PdfDownloadDialog audit={audit} open={pdfOpen} onClose={() => setPdfOpen(false)} onBusyChange={value => setBusy(value ? "pdf" : "")} onConflict={refresh} /> : null}
    <div className={styles.reportHeader}><div className={styles.wrap}>
      <Link href="/website-audit" className={styles.breadcrumb}><ArrowLeft size={12} aria-hidden="true" /> Website Audit</Link>
      <div className={styles.reportTitle}><div><p className={styles.eyebrow}>{demo ? "A sample website improvement plan" : "Your private website improvement plan"}</p><h1>{audit?.hostname || (loading ? "Preparing your report…" : "Website audit")}</h1>{audit ? <p className={styles.url}>{audit.url}</p> : null}</div>
        <div className={styles.actions}>{report ? <button type="button" className={styles.secondary} onClick={() => setPdfOpen(true)} aria-haspopup="dialog" disabled={disabled}>{busy === "pdf" ? <LoaderCircle size={14} className={styles.spin} aria-hidden="true" /> : <Download size={14} aria-hidden="true" />}Download PDF</button> : null}{demo ? <Link className={styles.button} href="/website-audit">Audit my website <ArrowRight size={14} aria-hidden="true" /></Link> : <span className={styles.badge}><LockKeyhole size={11} aria-hidden="true" /> Private to this browser</span>}</div>
      </div>
      {audit ? <div className={styles.meta}><span><Globe2 size={12} aria-hidden="true" /> {audit.progress.checked} public pages reviewed</span><span><Clock3 size={12} aria-hidden="true" /> {demo ? "Illustrative report" : `Started ${date(audit.createdAt)}`}</span>{!demo ? <span>Available until {date(audit.expiresAt)}</span> : null}</div> : null}
    </div></div>
    <div className={`${styles.wrap} ${styles.reportContent}`}>
      {demo ? <div className={styles.notice}><strong>This is an illustrative sample.</strong> The business and observations are fictional. Selections, editing, enquiries and downloads are disabled. <Link href="/website-audit">Start your own free audit</Link>.</div> : null}
      {error ? <div className={styles.error} role="alert"><p>{error}</p><button type="button" className={styles.secondary} style={{ marginTop: 10 }} onClick={() => { setError(""); setRetry(value => value + 1); }}><RefreshCw size={12} aria-hidden="true" /> Reload report</button>{!audit ? <p className={styles.hint} style={{ marginTop: 12 }}>Open this link in the browser you used to create the report. Reports are available for 30 days.</p> : null}</div> : null}
      {notice ? <div className={`${styles.notice} ${styles.success}`} role="status" style={{ marginTop: 15 }}>{notice}</div> : null}
      {loading ? <div className={styles.progressPanel} role="status"><LoaderCircle size={23} className={styles.spin} aria-hidden="true" /><h2>Loading your private report</h2><p>Checking access and getting your latest results.</p></div> : null}
      {audit && running ? <section className={styles.progressPanel} aria-labelledby="audit-progress-title">
        <span className={styles.badge}><LoaderCircle size={12} className={styles.spin} aria-hidden="true" /> {audit.status === "queued" ? "Waiting to start" : "Review in progress"}</span>
        <h2 id="audit-progress-title">{audit.stage === "queued" ? "Your website review is in the queue." : audit.stage === "discovering" ? "Finding your public pages." : audit.stage === "checking" ? "Reviewing your website." : audit.stage === "measuring" ? "Checking the visitor experience." : "Preparing a clear plan for your business."}</h2>
        <p role="status">{audit.progress.checked} pages reviewed so far. We review up to {audit.progress.limit} public pages and show progress here.</p>
        <div className={styles.progressTrack} aria-hidden="true"><span style={{ width: `${audit.stage === "queued" ? 7 : audit.stage === "recommending" ? 90 : Math.min(80, 15 + (audit.progress.checked / Math.max(1, audit.progress.limit)) * 65)}%` }} /></div>
        <div className={styles.stageList}>{STAGES.map(([stage, text]) => <span key={stage} data-current={audit.stage === stage}>{audit.stage === stage ? <LoaderCircle size={12} className={styles.spin} aria-hidden="true" /> : <span aria-hidden="true">·</span>}{text}</span>)}</div>
        <p className={styles.bottomNote}>You can return in this browser. We review public pages without logging in or sending forms.</p><button type="button" className={styles.secondary} style={{ marginTop: 20 }} disabled={!!busy} onClick={() => setConfirm("cancel")}><X size={13} aria-hidden="true" /> Cancel audit</button>
      </section> : null}
      {unavailable ? <div className={styles.progressPanel}><FileSearch size={25} aria-hidden="true" /><h2>{audit.status === "canceled" ? "This audit was canceled." : audit.status === "expired" ? "This report has expired." : audit.status === "deleted" ? "This report has been deleted." : "We could not review this website."}</h2><p>{audit.error || "No report is available. Start a new audit or try another public website."}</p><Link className={styles.button} href="/website-audit" style={{ marginTop: 23 }}>Start a new audit <ArrowRight size={14} aria-hidden="true" /></Link></div> : null}
      {audit && report ? <>
        {audit.status === "partial" ? <div className={styles.notice} style={{ marginTop: 20 }}><strong>We could review part of your website.</strong> Some pages or checks were unavailable. The suggestions below explain what we could learn from the pages reviewed.</div> : null}
        <div className={styles.reportLayout}><div className={styles.mainColumn}>
          <nav className={styles.tabs} aria-label="Report sections">{VIEWS.map(([key, text]) => <button type="button" key={key} aria-pressed={view === key} onClick={() => setView(key)}>{text}</button>)}</nav>
          {view === "overview" ? <>
            <section className={styles.customerSummary}><p className={styles.eyebrow}>Your website, in everyday terms</p><h2>What this means for your business</h2><p>{report.summary}</p><span className={styles.badge}>{report.analysisMode === "ai_assisted" ? "AI-assisted review" : "Website review"}</span></section>
            {report.strengths.length ? <section className={styles.reportSection}><div className={styles.heading}><h2>A good starting point</h2><p>Keep these strengths as you improve the website.</p></div><ul className={styles.customerStrengths}>{report.strengths.map((strength, index) => <li key={index}><CheckCircle2 size={18} aria-hidden="true" /><span>{strength}</span></li>)}</ul></section> : null}
            <section className={styles.reportSection}><div className={styles.heading}><h2>Where to focus first</h2><p>Start with the changes that make it easier for people to understand and use your website.</p></div>{report.gaps.length ? <div className={styles.stack}>{report.gaps.slice(0, 3).map(item => <article className={styles.card} key={item.id}><div className={styles.findingTitle}><h3>{item.title}</h3><span className={styles.badge}>{PRIORITY_LABELS[item.priority]}</span></div><p className={styles.customerObservation}>{item.why}</p><p style={{ marginTop: 10 }}>{item.action}</p><button type="button" className={styles.secondary} style={{ marginTop: 17 }} onClick={() => setView("issues")}>See what to improve <ArrowRight size={12} aria-hidden="true" /></button></article>)}</div> : <p className={styles.empty}>The available checks did not establish a specific problem. A wider review may find other opportunities.</p>}</section>
            {recommended.length ? <section className={styles.reportSection}><div className={styles.heading}><h2>Useful additions to consider</h2><p>Features should support how your business works. A suggestion is a starting point for a conversation.</p></div><div className={styles.stack}>{recommended.slice(0, 2).map(item => <article className={styles.card} key={item.id}><h3>{item.title}</h3><p>{item.benefit}</p><button type="button" className={styles.secondary} style={{ marginTop: 17 }} onClick={() => setView("growth")}>Explore this addition <ArrowRight size={12} aria-hidden="true" /></button></article>)}</div></section> : null}
            <section className={styles.reportSection}><div className={styles.heading}><h2>Help us understand your business</h2><p>{report.businessContext}</p></div><AssessmentEditor key={JSON.stringify(audit.assessment)} audit={audit} disabled={disabled} onSave={async assessment => { await mutate("/assessment", "PATCH", { revision: audit.revision, assessment }, "Your business answers have been updated. Review your revised suggestions and selections."); }} /></section>
          </> : null}
          {view === "issues" ? <section><div className={styles.heading}><h2>Areas to improve</h2><p>See what we noticed, why it matters and a practical next step. Choose any improvements you want to discuss with Viviz.</p></div><div className={styles.stack}>{report.gaps.map(gap => <GapCard key={gap.id} gap={gap} selected={selected.has(gap.id)} onSelect={() => toggleFinding(gap.id)} disabled={disabled || (!selected.has(gap.id) && selected.size >= 30)} />)}</div>{!report.gaps.length ? <p className={styles.empty}>No specific problems were established from the checks available. This does not cover everything a person could review.</p> : null}</section> : null}
          {view === "growth" ? <section><div className={styles.heading}><h2>Useful additions for your business</h2><p>These suggestions connect your website to customer needs. Check what you already use and what the work involves before deciding.</p></div><div className={styles.notice} style={{ marginBottom: 22 }}>Something we did not find on public pages may already exist elsewhere in your business. Tell us about your current process before planning a change.</div>{(["fix_first", "improve_next", "consider_later"] as const).map(sequence => { const items = report.improvements.filter(item => item.sequence === sequence); return items.length ? <section className={styles.reportSection} key={sequence}><h3 className={styles.smallHeading}>{SEQUENCE_LABELS[sequence]}</h3><div className={styles.stack}>{items.map(item => <ImprovementCard key={item.id} item={item} decision={audit.decisions[item.id]} onDecision={decision => void mutate(`/recommendations/${encodeURIComponent(item.id)}/decision`, "POST", { revision: audit.revision, decision }, "Your selection has been saved.")} disabled={disabled} />)}</div></section> : null; })}{!report.improvements.length ? <p className={styles.empty}>We need more information to suggest a useful addition. Add your business answers in Overview to help us understand your goals.</p> : null}
            {report.ideas.length ? <section className={styles.reportSection}><div className={styles.heading}><h2>Ideas to discuss</h2><p>AI suggested these possibilities from the review. They need your confirmation and are not established website problems. Mention an idea in your enquiry if you want to explore it.</p></div><div className={styles.stack}>{report.ideas.map(idea => <article className={`${styles.card} ${styles.customerIdea}`} key={idea.id}><span className={`${styles.badge} ${styles.purple}`}>Idea to discuss</span><h3 style={{ marginTop: 15 }}>{idea.title}</h3><p>{idea.reason}</p><dl className={styles.customerExplanation}><div><dt>A possible next step</dt><dd>{idea.suggestion}</dd></div><div><dt>A question for you</dt><dd>{idea.question}</dd></div></dl><PageLinks pages={idea.pages} /></article>)}</div></section> : null}
          </section> : null}
          {view === "plan" ? <section><div className={styles.heading}><h2>Your next steps</h2><p>A manageable starting point. You decide which improvements to take forward.</p></div>{report.nextSteps.length ? <ol className={styles.customerSteps}>{report.nextSteps.map((step, index) => <li key={index}><span className={styles.number} aria-hidden="true">{index + 1}</span><p>{step}</p></li>)}</ol> : null}{selectionCount ? <section className={styles.reportSection}><h3 className={styles.smallHeading}>What you would like to discuss</h3><div className={styles.stack}>{selectedFindings.map(item => <article key={item.id} className={styles.card}><h3>{item.title}</h3><p>{item.action}</p><button type="button" className={styles.secondary} style={{ marginTop: 16 }} disabled={disabled} onClick={() => toggleFinding(item.id)}>Remove from enquiry</button></article>)}{selectedModules.map(item => <article key={item.id} className={styles.card}><h3>{item.title}</h3><p>{item.action}</p><p style={{ marginTop: 12 }}>{item.tradeoff}</p><span className={styles.badge} style={{ marginTop: 14 }}>{SEQUENCE_LABELS[item.sequence]}</span></article>)}</div></section> : null}<section className={styles.reportSection}><EnquiryForm audit={audit} selectedFindings={selectedFindings} disabled={disabled} onSubmitted={() => setNotice("Your enquiry was sent to Viviz. Your report remains available in this browser.")} onError={message => setError(message)} onConflict={refresh} /></section></section> : null}
          <section className={styles.reportSection}><details className={styles.evidence}><summary>What this review covers</summary><p>{report.scopeNote}</p>{checkedPages.length ? <PageLinks pages={checkedPages} /> : null}</details></section>
        </div><aside className={styles.sidebar} aria-label="Selected improvements"><div className={styles.card}><div className={styles.panelTitle} style={{ fontSize: 14, marginBottom: 10 }}><Sparkles size={16} aria-hidden="true" /> Your chosen improvements</div><p style={{ fontSize: 12 }}>{selectionCount ? `${selectionCount} ${selectionCount === 1 ? "improvement" : "improvements"} ready to discuss.` : "Choose the changes you would like help with."}</p>{selectionCount ? <ul>{[...selectedFindings.map(item => ({ id: item.id, title: item.title })), ...selectedModules].map(item => <li key={item.id}><Check size={12} aria-hidden="true" /><span>{item.title}</span></li>)}</ul> : <p className={styles.hint} style={{ marginBlock: 16 }}>Select an area to improve or a useful addition to prepare your enquiry.</p>}<button type="button" className={`${styles.button} ${styles.fullWidth}`} onClick={showEnquiry} disabled={demo}>Review enquiry <ArrowRight size={13} aria-hidden="true" /></button><p className={styles.hint}>Review your choices before sending. Viviz will discuss the scope and cost with you.</p></div><div className={styles.card}><ShieldCheck size={20} aria-hidden="true" style={{ color: "#9bcfe9", marginBottom: 13 }} /><h3 style={{ fontSize: 13 }}>You stay in control</h3><p style={{ fontSize: 11 }}>Suggestions are options to consider. Results depend on your customers, your business and how changes are carried out.</p><Link href="/products" className={styles.textLink}>Explore website packages <ArrowRight size={11} aria-hidden="true" /></Link></div></aside></div>
      </> : null}
      {audit && !demo ? <details className={styles.controls}><summary>Report privacy and controls</summary><p className={styles.bottomNote}>This report is private to this browser and available until {date(audit.expiresAt)}. Authorized Viviz staff can review the technical details. Sharing the link does not give another browser access. Deleting the report removes access and stops any review in progress. Enquiries you already sent are kept separately under our privacy policy.</p><button type="button" className={styles.danger} style={{ marginTop: 17 }} onClick={() => setConfirm("delete")} disabled={!!busy}><Trash2 size={13} aria-hidden="true" /> Delete this report</button></details> : null}
      {confirm ? <div className={styles.confirm} role="alertdialog" aria-labelledby="confirm-audit-control"><h2 className={styles.smallHeading} id="confirm-audit-control" tabIndex={-1}>{confirm === "delete" ? "Delete this report?" : "Cancel this audit?"}</h2><p>{confirm === "delete" ? "Your report and the information collected for it will be removed. This cannot be undone. An enquiry already sent is kept separately under our privacy policy." : "The website review will stop. You can start a new audit later."}</p><div className={styles.actions}><button type="button" className={styles.danger} disabled={!!busy} onClick={() => confirm === "delete" ? void remove() : void mutate("/cancel", "POST", undefined, "The audit was canceled.")}>{busy ? "Please wait…" : confirm === "delete" ? "Delete report" : "Cancel audit"}</button><button type="button" className={styles.secondary} disabled={!!busy} onClick={() => setConfirm(null)}>Keep report</button></div></div> : null}
    </div>
  </div>;
}
