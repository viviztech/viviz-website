"use client";

import { useState } from "react";
import { IndianRupee, Loader2, ShieldCheck } from "lucide-react";
import type { WebsitePackagePayment } from "@/lib/website-packages";

export default function PaymentForm({
  selectedPackage,
}: {
  selectedPackage: WebsitePackagePayment | null;
}) {
  const [payerName, setPayerName] = useState("");
  const [payerEmail, setPayerEmail] = useState("");
  const [payerMobile, setPayerMobile] = useState("");
  const [amount, setAmount] = useState(selectedPackage ? String(selectedPackage.amount) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pay/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerName,
          payerEmail,
          payerMobile,
          amount: Number(amount),
          packageId: selectedPackage?.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      // Hand off to SabPaisa's hosted checkout: a hidden form POST, same
      // mechanism their own SDK uses. encData/clientCode are meaningless
      // without the server-side keys, so this is safe to build client-side.
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.url;

      const encDataInput = document.createElement("input");
      encDataInput.type = "hidden";
      encDataInput.name = "encData";
      encDataInput.value = data.encData;
      form.appendChild(encDataInput);

      const clientCodeInput = document.createElement("input");
      clientCodeInput.type = "hidden";
      clientCodeInput.name = "clientCode";
      clientCodeInput.value = data.clientCode;
      form.appendChild(clientCodeInput);

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start payment.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md p-8 rounded-2xl border border-white/5 bg-[#0F1929] space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center shrink-0">
          <IndianRupee size={16} className="text-[#00D4FF]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">
            {selectedPackage ? selectedPackage.name : "Pay Viviz Technologies"}
          </h1>
          {selectedPackage && (
            <p className="text-xs text-[#64748B] mt-0.5">Website package payment</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Full Name</label>
          <input
            required
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Email</label>
          <input
            required
            type="email"
            value={payerEmail}
            onChange={(e) => setPayerEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Mobile Number</label>
          <input
            required
            type="tel"
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            value={payerMobile}
            onChange={(e) => setPayerMobile(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors"
            placeholder="10-digit mobile number"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Amount (₹)</label>
          <input
            required
            type="number"
            min={1}
            max={1000000}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            readOnly={Boolean(selectedPackage)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors read-only:text-[#00D4FF] read-only:font-bold read-only:cursor-not-allowed"
            placeholder="0.00"
          />
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
        ) : selectedPackage ? (
          `Pay ₹${selectedPackage.amount.toLocaleString("en-IN")}`
        ) : (
          "Proceed to Pay"
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#475569]">
        <ShieldCheck size={12} />
        Secured by SabPaisa
      </p>
    </form>
  );
}
