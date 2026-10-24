"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Globe2, LoaderCircle, LockKeyhole } from "lucide-react";
import { EMPTY_ASSESSMENT, type AuditView, type BusinessAssessment } from "@/lib/website-audit/types";
import AssessmentFields from "./AssessmentFields";
import styles from "./audit.module.css";

export default function AuditStartForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [assessment, setAssessment] = useState<BusinessAssessment>(EMPTY_ASSESSMENT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const attempt = useRef<{ url: string; key: string } | null>(null);
  async function start(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    const enteredUrl = url.trim();
    const normalized = /^[a-z][a-z0-9+.-]*:\/\//i.test(enteredUrl) ? enteredUrl : `https://${enteredUrl}`;
    try {
      const parsed = new URL(normalized);
      if (!["https:", "http:"].includes(parsed.protocol) || !parsed.hostname.includes(".") || parsed.username || parsed.password) throw new Error();
    } catch { setError("Enter a public website address, such as https://yourbusiness.com."); return; }
    setBusy(true);
    if (attempt.current?.url !== normalized) attempt.current = { url: normalized, key: crypto.randomUUID() };
    try {
      const response = await fetch("/api/audits", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: normalized, idempotencyKey: attempt.current.key, assessment }) });
      const data = await response.json() as { audit?: AuditView; error?: string };
      if (!response.ok || !data.audit) throw new Error(data.error || "The audit could not start. Please try again.");
      router.push(`/website-audit/${encodeURIComponent(data.audit.id)}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The connection failed. Check your connection and try again."); setBusy(false); }
  }
  return <form className={styles.formPanel} onSubmit={start} id="start-audit" aria-label="Start a free website audit">
    <div className={styles.panelTitle}><Globe2 size={20} aria-hidden="true" /> See where your website can improve</div>
    <label className={styles.label} htmlFor="audit-url">Your website address<input id="audit-url" name="url" className={styles.input} type="text" inputMode="url" autoComplete="url" autoCapitalize="off" spellCheck={false} placeholder="https://yourbusiness.com" value={url} onChange={event => setUrl(event.target.value)} required maxLength={2048} disabled={busy} aria-describedby="audit-url-hint" /><span className={styles.hint} id="audit-url-hint">Public websites only. We inspect up to 25 pages.</span></label>
    <AssessmentFields value={assessment} onChange={setAssessment} extended={false} disabled={busy} />
    <details className={styles.disclosure}><summary>Tailor my recommendations <span className={styles.hint}>· optional</span></summary><AssessmentFields value={assessment} onChange={setAssessment} disabled={busy} /></details>
    {error ? <p className={styles.error} role="alert">{error}</p> : null}
    <button type="submit" className={`${styles.button} ${styles.fullWidth}`} disabled={busy}>{busy ? <><LoaderCircle size={16} className={styles.spin} aria-hidden="true" /> Starting your audit…</> : <>Analyse my website <ArrowRight size={16} aria-hidden="true" /></>}</button>
    <p className={styles.formNote}><LockKeyhole size={13} aria-hidden="true" /><span>No email required. Your report stays private to this browser for 30 days. Clearing cookies loses access. Read our <Link href="/privacy#website-audit">audit privacy details</Link>.</span></p>
  </form>;
}
