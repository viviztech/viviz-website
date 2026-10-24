import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySessionFromCookies } from "@/lib/session";
import { listInvoices } from "@/lib/invoices";
import InvoiceManager from "@/components/invoice/InvoiceManager";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function InvoicePage() {
  // Defense in depth alongside proxy.ts, which only does an optimistic cookie
  // check.
  if (!(await verifySessionFromCookies())) {
    redirect("/invoice/login");
  }

  const invoices = await listInvoices();

  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white">Invoice Generator</h1>
          <Link href="/invoice/website-audits" className="rounded-lg border border-cyan-700 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-950">Website technical reports</Link>
        </div>
        <InvoiceManager initialInvoices={invoices} />
      </div>
    </div>
  );
}
