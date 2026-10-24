"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { Download, LoaderCircle, X } from "lucide-react";
import type { AuditView } from "@/lib/website-audit/types";
import styles from "./audit.module.css";

type Props = {
  audit: AuditView;
  open: boolean;
  onClose: () => void;
  onBusyChange: (busy: boolean) => void;
  onConflict: () => Promise<void>;
};

export default function PdfDownloadDialog({ audit, open, onClose, onBusyChange, onConflict }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const requestKey = useRef<{ fingerprint: string; key: string } | null>(null);
  const inFlight = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reportChanged, setReportChanged] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const privacyId = useId();
  const errorId = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element || !open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element.showModal();
    nameInput.current?.focus();
    return () => {
      element.close();
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  function close() {
    if (inFlight.current) return;
    setError("");
    setReportChanged(false);
    onClose();
  }

  async function download(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || reportChanged) return;
    const payload = { revision: audit.revision, name: name.trim(), email: email.trim() };
    if (payload.name.length < 2 || payload.name.length > 100) {
      setError("Enter your name using 2 to 100 characters.");
      nameInput.current?.focus();
      return;
    }
    if (!payload.email || payload.email.length > 254 || !emailInput.current?.validity.valid) {
      setError("Enter a valid email address using no more than 254 characters.");
      emailInput.current?.focus();
      return;
    }
    const fingerprint = JSON.stringify({ auditId: audit.id, ...payload });
    if (requestKey.current?.fingerprint !== fingerprint) requestKey.current = { fingerprint, key: crypto.randomUUID() };
    inFlight.current = true;
    setSending(true);
    setError("");
    onBusyChange(true);
    let completed = false;
    try {
      const response = await fetch(`/api/audits/${encodeURIComponent(audit.id)}/report`, {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, idempotencyKey: requestKey.current.key }),
      });
      if (response.status === 409) {
        requestKey.current = null;
        setReportChanged(true);
        try { await onConflict(); }
        catch { throw new Error("Your report changed and could not be refreshed. Close this dialog, reload the report and review it before downloading again."); }
        throw new Error("Your report changed. Close this dialog and review the updated report before downloading again.");
      }
      if (!response.ok) {
        const data = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(data?.error || "The PDF could not be prepared. Please try again.");
      }
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `viviz-website-audit-${audit.hostname || "report"}.pdf`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(href);
      requestKey.current = null;
      completed = true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The PDF could not be downloaded. Please try again.");
    } finally {
      inFlight.current = false;
      setSending(false);
      onBusyChange(false);
    }
    if (completed) close();
  }

  return <dialog
    ref={dialog}
    className={styles.pdfDialog}
    aria-labelledby={titleId}
    aria-describedby={`${descriptionId} ${privacyId}`}
    aria-modal="true"
    onCancel={event => { event.preventDefault(); close(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }}
  >
    <div className={styles.pdfDialogHeader}>
      <div><p className={styles.eyebrow}>Your website report</p><h2 id={titleId}>Download your PDF</h2></div>
      <button type="button" className={styles.pdfDialogClose} onClick={close} disabled={sending} aria-label="Close PDF download"><X size={20} aria-hidden="true" /></button>
    </div>
    <p id={descriptionId} className={styles.pdfDialogDescription}>Enter your name and email to download a copy of this report.</p>
    <form onSubmit={download} onInvalid={event => {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      setError(input.validationMessage);
      input.focus();
    }} aria-busy={sending}>
      <label className={styles.label}>Your name<input ref={nameInput} className={styles.input} required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={event => setName(event.target.value)} disabled={sending} aria-describedby={error ? errorId : undefined} /></label>
      <label className={styles.label}>Email address<input ref={emailInput} className={styles.input} type="email" required maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={sending} aria-describedby={error ? errorId : undefined} /></label>
      <p id={privacyId} className={styles.pdfPrivacy}>Your name and email are saved with this report download. This does not submit an implementation enquiry. <Link href="/privacy#website-audit">Privacy details</Link></p>
      {error ? <p className={styles.error} role="alert" id={errorId}>{error}</p> : null}
      <div className={styles.pdfDialogActions}>
        <button type="button" className={styles.secondary} onClick={close} disabled={sending}>Cancel</button>
        {reportChanged ? <button type="button" className={styles.button} onClick={close}>Review report</button> : <button type="submit" className={styles.button} disabled={sending}>{sending ? <><LoaderCircle size={14} className={styles.spin} aria-hidden="true" /> Preparing PDF…</> : <><Download size={14} aria-hidden="true" /> Download PDF</>}</button>}
      </div>
    </form>
  </dialog>;
}
