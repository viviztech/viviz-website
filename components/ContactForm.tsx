"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

const services = [
  "Viviz CRM (Early Access)",
  "AI Agent Development",
  "Data Science & Analytics",
  "Marketing Automation",
  "Brand & Digital Presence",
  "Custom SaaS Development",
  "Business Intelligence",
  "AI Strategy & Consulting",
  "Other / Not sure yet",
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    service: "",
    message: "",
  });

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send. Please email us directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (submitted) {
    return (
      <div className="h-full flex items-center justify-center p-12 rounded-2xl border border-[#10D9A0]/20 bg-[#10D9A0]/5">
        <div className="text-center">
          <CheckCircle size={48} className="text-[#10D9A0] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-[#64748B] max-w-sm">
            Thanks for reaching out. We'll get back to you within one business day at{" "}
            <span className="text-white">{form.email || "your email"}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 rounded-2xl border border-white/5 bg-[#0F1929] space-y-6"
    >
      <h2 className="text-lg font-bold text-white">Send Us a Message</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="you@company.com"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#94A3B8] mb-2">
          Company / Business Name
        </label>
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Your company (optional)"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#94A3B8] mb-2">
          What are you interested in?
        </label>
        <select
          name="service"
          value={form.service}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl bg-[#0B1120] border border-white/8 text-white text-sm focus:outline-none focus:border-[#00D4FF]/40 transition-colors appearance-none"
        >
          <option value="" disabled>
            Select a service...
          </option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#94A3B8] mb-2">
          Tell us about your challenge *
        </label>
        <textarea
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Describe what you're trying to solve or build. The more context you give, the better we can help."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#475569] text-sm focus:outline-none focus:border-[#00D4FF]/40 focus:bg-white/8 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-400 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Sending…" : <><span>Send Message</span><Send size={16} /></>}
      </button>

      <p className="text-xs text-[#475569] text-center">
        We typically reply within 1 business day. Your information is never
        shared with third parties.
      </p>
    </form>
  );
}
