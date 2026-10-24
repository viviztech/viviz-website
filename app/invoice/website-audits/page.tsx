import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuditError } from "@/lib/website-audit/errors";
import { listStaffAudits } from "@/lib/website-audit/staff";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Website audits | Viviz staff", robots: { index: false, follow: false } };

export default async function StaffWebsiteAuditsPage() {
  let audits;
  try {
    audits = await listStaffAudits();
  } catch (error) {
    if (error instanceof AuditError && error.status === 401) redirect("/invoice/login");
    return <main className="mx-auto max-w-5xl px-5 py-16"><h1 className="text-3xl font-bold">Website audits</h1><p role="status" className="mt-5 text-slate-300">{error instanceof AuditError ? error.message : "Technical reports are temporarily unavailable. Please try again shortly."}</p><Link href="/invoice" className="mt-6 inline-block text-cyan-300 underline">Back to staff dashboard</Link></main>;
  }
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
    <Link href="/invoice" className="text-sm text-cyan-300 underline">Staff dashboard</Link>
    <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-cyan-300">Viviz staff only</p>
    <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Website technical reports</h1>
    <p className="mt-4 max-w-2xl text-slate-300">The latest 50 active reports. Review measured issues, collected evidence, customer choices and provisional AI suggestions before proposing implementation.</p>
    <div className="mt-8 grid gap-4">
      {audits.length === 0 && <p className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-300">No active website audits are available.</p>}
      {audits.map((audit) => <article key={audit.id} className="rounded-xl border border-slate-700 bg-slate-900 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0"><h2 className="break-words text-xl font-semibold">{audit.hostname}</h2><p className="mt-2 text-sm text-slate-300">{audit.status} · {audit.checked} / {audit.discovered} pages checked · Revision {audit.revision}</p><p className="mt-1 text-xs text-slate-400">Created {new Date(audit.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p></div>
        <Link href={`/invoice/website-audits/${audit.id}`} className="mt-5 inline-block shrink-0 rounded-lg border border-cyan-700 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 sm:mt-0">View technical report<span className="sr-only"> for {audit.hostname}</span></Link>
      </article>)}
    </div>
  </main>;
}
