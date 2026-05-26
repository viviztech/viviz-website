"use client";

import { useState } from "react";
import { Mail, Link2, X, GitFork, Send, CheckCircle, MapPin, Clock } from "lucide-react";

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

export default function ContactPage() {
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

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#00D4FF]/5 blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-[#00D4FF] text-xs font-semibold tracking-widest uppercase mb-6">
            Contact Us
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Let's Build Something
            <span className="text-[#00D4FF]"> Together</span>
          </h1>
          <p className="text-[#64748B] text-xl max-w-2xl mx-auto">
            Tell us about your business challenge. We'll get back to you within one
            business day with a clear path forward.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left sidebar info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Company info */}
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0F1929]">
                <h2 className="text-base font-bold text-white mb-6">Get in Touch</h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-[#00D4FF]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B] mb-0.5">Email</div>
                      <a
                        href="mailto:viviztechnologies@gmail.com"
                        className="text-sm text-white hover:text-[#00D4FF] transition-colors"
                      >
                        viviztechnologies@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B] mb-0.5">Location</div>
                      <span className="text-sm text-white">Remote · Worldwide</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#10D9A0]/10 flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-[#10D9A0]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B] mb-0.5">Response Time</div>
                      <span className="text-sm text-white">Within 1 business day</span>
                    </div>
                  </div>
                </div>

                {/* Social links */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
                  <a
                    href="mailto:viviztechnologies@gmail.com"
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#64748B] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                    aria-label="Email"
                  >
                    <Mail size={16} />
                  </a>
                  <a
                    href="https://twitter.com/viviztechnologies"
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#64748B] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                    aria-label="Twitter"
                  >
                    <X size={16} />
                  </a>
                  <a
                    href="https://linkedin.com/company/viviz-technologies"
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#64748B] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Link2 size={16} />
                  </a>
                  <a
                    href="https://github.com/viviz-technologies"
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-[#64748B] hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors"
                    aria-label="GitHub"
                  >
                    <GitFork size={16} />
                  </a>
                </div>
              </div>

              {/* What to expect */}
              <div className="p-6 rounded-2xl border border-white/5 bg-[#0F1929]">
                <h2 className="text-base font-bold text-white mb-4">What Happens Next</h2>
                <ol className="space-y-4">
                  {[
                    { step: "1", text: "We review your message and understand your challenge." },
                    { step: "2", text: "We reply within 1 business day with initial thoughts and questions." },
                    { step: "3", text: "We schedule a 30-minute discovery call to go deeper." },
                    { step: "4", text: "We send a clear proposal with scope, timeline, and pricing." },
                  ].map(({ step, text }) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#00D4FF]/15 text-[#00D4FF] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {step}
                      </span>
                      <span className="text-sm text-[#64748B]">{text}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <div className="h-full flex items-center justify-center p-12 rounded-2xl border border-[#10D9A0]/20 bg-[#10D9A0]/5">
                  <div className="text-center">
                    <CheckCircle size={48} className="text-[#10D9A0] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
                    <p className="text-[#64748B] max-w-sm">
                      Thanks for reaching out. We'll get back to you within one business
                      day at{" "}
                      <span className="text-white">{form.email || "your email"}</span>.
                    </p>
                  </div>
                </div>
              ) : (
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

                  {error && (
                    <p className="text-xs text-red-400 text-center">{error}</p>
                  )}

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
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
