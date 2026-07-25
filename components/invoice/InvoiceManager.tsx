"use client";

import { useState } from "react";
import { Plus, Trash2, FileDown, Loader2 } from "lucide-react";
import { GST_STATES } from "@/lib/gst";
import { calculateTotals, type InvoiceLineItem } from "@/lib/invoice-calc";
import { fromPaise } from "@/lib/money";
import { COMPANY_STATE_CODE } from "@/lib/config";
import type { InvoiceRecord } from "@/lib/invoices";

const emptyLineItem: InvoiceLineItem = { description: "", hsnSac: "", quantity: 1, rate: 0 };

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors";
const labelClass = "block text-xs font-semibold text-[#94A3B8] mb-2";

export default function InvoiceManager({
  initialInvoices,
}: {
  initialInvoices: InvoiceRecord[];
}) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientGstin, setClientGstin] = useState("");
  const [clientStateCode, setClientStateCode] = useState(COMPANY_STATE_CODE);
  const [invoiceDate, setInvoiceDate] = useState(todayIso());
  const [dueDate, setDueDate] = useState("");
  const [gstRate, setGstRate] = useState(18);
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([{ ...emptyLineItem }]);

  const preview = calculateTotals(lineItems, gstRate, clientStateCode);

  function updateLineItem(index: number, field: keyof InvoiceLineItem, value: string) {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === "quantity" || field === "rate") {
          return { ...item, [field]: Number(value) || 0 };
        }
        return { ...item, [field]: value };
      })
    );
  }

  function addLineItem() {
    setLineItems((prev) => [...prev, { ...emptyLineItem }]);
  }

  function removeLineItem(index: number) {
    setLineItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function resetForm() {
    setClientName("");
    setClientAddress("");
    setClientGstin("");
    setClientStateCode(COMPANY_STATE_CODE);
    setInvoiceDate(todayIso());
    setDueDate("");
    setGstRate(18);
    setNotes("");
    setLineItems([{ ...emptyLineItem }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientAddress,
          clientGstin: clientGstin || null,
          clientStateCode,
          invoiceDate,
          dueDate: dueDate || null,
          gstRate,
          notes: notes || null,
          lineItems,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setInvoices((prev) => [data.invoice, ...prev]);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-3 p-8 rounded-2xl border border-white/5 bg-[#0F1929] space-y-6"
      >
        <h2 className="text-lg font-bold text-white">New Invoice</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Client Name *</label>
            <input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className={inputClass}
              placeholder="Client / company name"
            />
          </div>
          <div>
            <label className={labelClass}>Client GSTIN</label>
            <input
              value={clientGstin}
              onChange={(e) => setClientGstin(e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Client Address *</label>
          <textarea
            required
            rows={2}
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Billing address"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Client State *</label>
            <select
              required
              value={clientStateCode}
              onChange={(e) => setClientStateCode(e.target.value)}
              className={`${inputClass} bg-[#0B1120] appearance-none`}
            >
              {GST_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Invoice Date *</label>
            <input
              required
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Line items */}
        <div>
          <label className={labelClass}>Line Items *</label>
          <div className="space-y-3">
            {lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <input
                  required
                  value={item.description}
                  onChange={(e) => updateLineItem(i, "description", e.target.value)}
                  placeholder="Description"
                  className={`${inputClass} col-span-5`}
                />
                <input
                  value={item.hsnSac}
                  onChange={(e) => updateLineItem(i, "hsnSac", e.target.value)}
                  placeholder="HSN/SAC"
                  className={`${inputClass} col-span-2`}
                />
                <input
                  required
                  type="number"
                  min={0}
                  step="any"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(i, "quantity", e.target.value)}
                  placeholder="Qty"
                  className={`${inputClass} col-span-2`}
                />
                <input
                  required
                  type="number"
                  min={0}
                  step="any"
                  value={item.rate}
                  onChange={(e) => updateLineItem(i, "rate", e.target.value)}
                  placeholder="Rate"
                  className={`${inputClass} col-span-2`}
                />
                <button
                  type="button"
                  onClick={() => removeLineItem(i)}
                  disabled={lineItems.length === 1}
                  className="col-span-1 h-full flex items-center justify-center rounded-xl bg-white/5 text-[#64748B] hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Remove line item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addLineItem}
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#00D4FF] hover:opacity-80 transition-opacity"
          >
            <Plus size={14} /> Add line item
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>GST Rate (%) *</label>
            <input
              required
              type="number"
              min={0}
              max={100}
              step="any"
              value={gstRate}
              onChange={(e) => setGstRate(Number(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Live totals preview */}
        <div className="p-4 rounded-xl bg-white/5 space-y-1.5 text-sm">
          <div className="flex justify-between text-[#94A3B8]">
            <span>Subtotal</span>
            <span>{formatCurrency(fromPaise(preview.subtotalPaise))}</span>
          </div>
          {preview.cgstPaise > 0 || preview.sgstPaise > 0 ? (
            <>
              <div className="flex justify-between text-[#94A3B8]">
                <span>CGST</span>
                <span>{formatCurrency(fromPaise(preview.cgstPaise))}</span>
              </div>
              <div className="flex justify-between text-[#94A3B8]">
                <span>SGST</span>
                <span>{formatCurrency(fromPaise(preview.sgstPaise))}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-[#94A3B8]">
              <span>IGST</span>
              <span>{formatCurrency(fromPaise(preview.igstPaise))}</span>
            </div>
          )}
          <div className="flex justify-between text-white font-bold pt-1.5 border-t border-white/10">
            <span>Total</span>
            <span>{formatCurrency(fromPaise(preview.totalPaise))}</span>
          </div>
        </div>

        {error && <p className="text-xs text-red-400 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <span>Create Invoice</span>
          )}
        </button>
      </form>

      {/* Past invoices */}
      <div className="lg:col-span-2 p-6 rounded-2xl border border-white/5 bg-[#0F1929] h-fit">
        <h2 className="text-base font-bold text-white mb-6">Past Invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-[#64748B]">No invoices yet.</p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <a
                key={inv.id}
                href={`/api/invoices/${inv.id}/pdf`}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors group"
              >
                <div>
                  <div className="text-sm text-white font-semibold">{inv.invoiceNumber}</div>
                  <div className="text-xs text-[#64748B]">
                    {inv.clientName} · {inv.invoiceDate}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white">{formatCurrency(inv.total)}</span>
                  <FileDown size={16} className="text-[#64748B] group-hover:text-[#00D4FF] transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
