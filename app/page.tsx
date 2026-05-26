import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BarChart3,
  Megaphone,
  Palette,
  Code2,
  LineChart,
  Lightbulb,
  CheckCircle,
  Zap,
  MoveRight,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { BASE_URL, COMPANY_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Viviz Technologies — AI Software for Small & Medium Businesses",
  description:
    "Viviz Technologies builds AI-powered CRM, marketing automation, data science tools, and custom SaaS products. One platform to launch, run, and grow your business.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Viviz Technologies — AI Software for Small & Medium Businesses",
    description:
      "One platform to launch, run, and grow your business with AI. CRM, marketing automation, data science, and autonomous AI agents — built for SMBs.",
    url: BASE_URL,
  },
};

const homepageFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What does Viviz Technologies build?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viviz Technologies builds AI-powered software products and services for small and medium businesses. Our flagship product is Viviz CRM — an all-in-one business operating system. We also offer AI agent development, data science solutions, marketing automation, custom SaaS development, and business intelligence services.",
      },
    },
    {
      "@type": "Question",
      name: "What is Viviz CRM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viviz CRM is an AI-powered Business Operating System for SMBs. A business owner signs up, describes their idea, and the platform builds their brand, website, CRM, marketing automation, and sales pipeline using AI. It includes 10 platform modules and 10 autonomous AI agents.",
      },
    },
    {
      "@type": "Question",
      name: "How much does Viviz CRM cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viviz CRM is priced in four tiers: Starter at $29/month, Growth at $79/month, Pro at $199/month, and Agency at $499/month. All plans include a free trial.",
      },
    },
    {
      "@type": "Question",
      name: "What AI technology does Viviz use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viviz Technologies uses Claude API by Anthropic, LangGraph, and LangChain for AI agent orchestration. The data science layer uses scikit-learn, XGBoost, and Prophet. The infrastructure is built on Next.js, Python FastAPI, PostgreSQL, Redis, and pgvector.",
      },
    },
  ],
};

const services = [
  { icon: Zap, color: "#00D4FF", num: "01", title: "Viviz CRM", brief: "All-in-one AI business operating system" },
  { icon: Bot, color: "#8B5CF6", num: "02", title: "AI Agent Development", brief: "Autonomous agents for your workflows" },
  { icon: BarChart3, color: "#10D9A0", num: "03", title: "Data Science & Analytics", brief: "Predictive models — leads, churn, revenue" },
  { icon: Megaphone, color: "#F59E0B", num: "04", title: "Marketing Automation", brief: "Email, SMS, WhatsApp campaigns on autopilot" },
  { icon: Palette, color: "#EC4899", num: "05", title: "Brand & Digital Presence", brief: "Identity, website, SEO, social media" },
  { icon: Code2, color: "#00D4FF", num: "06", title: "Custom SaaS Development", brief: "Full-stack products from MVP to production" },
  { icon: LineChart, color: "#8B5CF6", num: "07", title: "Business Intelligence", brief: "Real-time dashboards and data pipelines" },
  { icon: Lightbulb, color: "#10D9A0", num: "08", title: "AI Strategy & Consulting", brief: "Roadmap, tool selection, implementation" },
];

const terminalLines = [
  { type: "cmd", text: "$ viviz deploy --project=\"my-retail-store\"" },
  { type: "ok", text: "✓ Business profile created" },
  { type: "ok", text: "✓ Brand identity generated (logo, colors, voice)" },
  { type: "ok", text: "✓ Website deployed → myretailstore.viviz.app" },
  { type: "ok", text: "✓ CRM activated — contacts imported" },
  { type: "ok", text: "✓ Email sequences live (3 flows)" },
  { type: "ok", text: "✓ Lead scoring model trained (94.2% accuracy)" },
  { type: "ok", text: "✓ 10 AI agents running" },
  { type: "info", text: "→ Your business is operational." },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={homepageFaqSchema} />

      {/* Announcement bar */}
      <div className="bg-[#00D4FF]/10 border-b border-[#00D4FF]/15 text-center py-2.5 px-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#00D4FF] font-medium hover:gap-3 transition-all"
        >
          Viviz CRM is in development — join the early access waitlist
          <MoveRight size={14} />
        </Link>
      </div>

      {/* Hero — asymmetric two-column */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/5 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-10rem)]">
            {/* Left */}
            <div>
              <p className="text-[#00D4FF] text-xs font-bold tracking-[0.2em] uppercase mb-5">
                {COMPANY_NAME}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                One platform.
                <br />
                Every tool your
                <br />
                <span className="text-[#00D4FF]">business needs.</span>
              </h1>
              <p className="text-[#94A3B8] text-lg leading-relaxed mb-4 max-w-lg">
                We're building Viviz CRM — a single platform that replaces the 12 tools
                most SMBs juggle today. Sign up, describe your business, and the system
                builds and runs it.
              </p>
              <p className="text-[#64748B] text-sm mb-8 max-w-lg">
                Alongside the product, we offer AI agent development, data science,
                marketing automation, and custom SaaS builds for businesses that want to
                move faster with intelligence built in.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00D4FF] text-[#0B1120] font-semibold text-sm hover:bg-[#00BFEA] transition-colors"
                >
                  See Viviz CRM <ArrowRight size={15} />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/10 text-[#94A3B8] font-semibold text-sm hover:border-white/20 hover:text-white transition-colors"
                >
                  Our Services
                </Link>
              </div>
            </div>

            {/* Right — terminal */}
            <div className="relative">
              <div className="rounded-xl border border-white/10 bg-[#080E1C] overflow-hidden shadow-2xl shadow-black/40">
                {/* Terminal bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-[#0F1929]">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                  <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                  <span className="w-3 h-3 rounded-full bg-[#28C840]" />
                  <span className="ml-3 text-xs text-[#475569] font-mono">
                    viviz-cli — bash
                  </span>
                </div>
                {/* Terminal body */}
                <div className="p-5 font-mono text-sm space-y-2">
                  {terminalLines.map((line, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {line.type === "cmd" && (
                        <span className="text-[#F8FAFC] whitespace-nowrap">{line.text}</span>
                      )}
                      {line.type === "ok" && (
                        <span className="text-[#10D9A0]">{line.text}</span>
                      )}
                      {line.type === "info" && (
                        <span className="text-[#00D4FF] font-semibold">{line.text}</span>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center gap-1 pt-1">
                    <span className="text-[#F8FAFC]">$ </span>
                    <span className="w-2 h-4 bg-[#00D4FF] animate-pulse" />
                  </div>
                </div>
              </div>
              {/* Floating stat */}
              <div className="absolute -bottom-4 -left-4 bg-[#111E30] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                <div className="text-[10px] text-[#64748B] mb-0.5">Lead Score Accuracy</div>
                <div className="text-xl font-bold text-[#10D9A0]">94.2%</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#111E30] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
                <div className="text-[10px] text-[#64748B] mb-0.5">AI Agents Running</div>
                <div className="text-xl font-bold text-[#8B5CF6]">10 Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services — numbered list, not card grid */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-16">
            {/* Left: heading */}
            <div className="lg:col-span-1">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#8B5CF6] mb-4">
                What we do
              </p>
              <h2 className="text-3xl font-bold text-white leading-tight mb-4">
                Eight services. All intelligence-first.
              </h2>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                We don't add AI as a feature. We start from it. Every service we offer
                is built around a machine learning model, an autonomous agent, or a
                data pipeline — not bolted on later.
              </p>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-[#8B5CF6] text-sm font-semibold hover:gap-3 transition-all"
              >
                Full service detail <ArrowRight size={15} />
              </Link>
            </div>

            {/* Right: numbered list */}
            <div className="lg:col-span-2">
              <div className="divide-y divide-white/5">
                {services.map(({ icon: Icon, color, num, title, brief }) => (
                  <div
                    key={num}
                    className="flex items-center gap-5 py-4 group hover:pl-2 transition-all duration-200"
                  >
                    <span className="text-xs font-mono text-[#334155] w-6 shrink-0">
                      {num}
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}18` }}
                    >
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-white">{title}</span>
                      <span className="text-[#475569] mx-2 text-xs">—</span>
                      <span className="text-sm text-[#64748B]">{brief}</span>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-[#334155] group-hover:text-[#64748B] transition-colors shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product spotlight */}
      <section className="py-20 bg-[#080E1C]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#10D9A0] mb-4">
                Flagship product
              </p>
              <h2 className="text-4xl font-bold text-white leading-tight mb-4">
                Viviz CRM replaces your entire software stack.
              </h2>
              <p className="text-[#64748B] text-base leading-relaxed mb-6">
                Most SMBs run their business across 8–15 different tools: Wix for the
                website, HubSpot for CRM, Mailchimp for email, Canva for design, Buffer
                for social. The switching costs, integration headaches, and monthly
                fees add up fast.
              </p>
              <p className="text-[#94A3B8] text-base leading-relaxed mb-8">
                Viviz CRM is one platform with 10 modules, all connected, all
                AI-powered. A new business owner can sign up Monday morning and have
                their brand, website, CRM, and first marketing campaign running by
                Monday afternoon.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  "10 modules: brand, website, social, CRM, marketing, analytics, AI agents",
                  "10 autonomous AI agents working 24/7",
                  "94% lead scoring accuracy (ML model, trained on your data)",
                  "Pricing from $29/month — no per-seat fees",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-[#10D9A0] mt-0.5 shrink-0" />
                    <span className="text-sm text-[#94A3B8]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00D4FF] text-[#0B1120] font-semibold text-sm hover:bg-[#00BFEA] transition-colors"
              >
                Deep-dive into Viviz CRM <ArrowRight size={15} />
              </Link>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Platform Modules", value: "10", sub: "all connected", color: "#00D4FF" },
                { label: "Autonomous Agents", value: "10", sub: "running 24/7", color: "#8B5CF6" },
                { label: "Lead Score Accuracy", value: "94%", sub: "XGBoost model", color: "#10D9A0" },
                { label: "Tools Replaced", value: "12+", sub: "per business", color: "#F59E0B" },
                { label: "Starter Price", value: "$29", sub: "per month", color: "#EC4899" },
                { label: "Build Timeline", value: "16mo", sub: "to public launch", color: "#00D4FF" },
              ].map(({ label, value, sub, color }) => (
                <div
                  key={label}
                  className="p-5 rounded-xl border border-white/5 bg-[#0F1929]"
                >
                  <div className="text-2xl font-bold mb-0.5" style={{ color }}>
                    {value}
                  </div>
                  <div className="text-xs font-semibold text-white mb-0.5">{label}</div>
                  <div className="text-xs text-[#475569]">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto strip */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <blockquote className="max-w-3xl">
            <p className="text-2xl sm:text-3xl font-medium text-white leading-relaxed">
              "The most powerful business tools in the world should be available to
              every entrepreneur — not just those who can afford a team of engineers,
              data scientists, and marketers."
            </p>
            <footer className="mt-4 text-[#64748B] text-sm">
              — Viviz Technologies
            </footer>
          </blockquote>
        </div>
      </section>

      {/* How we work */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#00D4FF] mb-4">
              How it works
            </p>
            <h2 className="text-3xl font-bold text-white">
              From problem to production in four steps.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              {
                n: "1",
                heading: "Tell us your challenge",
                body: "One call or a short email. What problem are you solving, who for, and what's already been tried.",
              },
              {
                n: "2",
                heading: "We scope and propose",
                body: "A specific proposal with technology choices, timeline, and pricing. No vague estimates.",
              },
              {
                n: "3",
                heading: "We build with you",
                body: "Weekly demos, direct Slack access, and full transparency on what's being built and why.",
              },
              {
                n: "4",
                heading: "You launch with confidence",
                body: "Production-grade code, monitoring, and a handoff that actually makes sense to your team.",
              },
            ].map(({ n, heading, body }, i) => (
              <div
                key={n}
                className="relative p-6 border-t border-white/5 first:border-l border-l-0 sm:border-l"
              >
                <span className="text-6xl font-bold text-white/[0.04] absolute top-4 right-4 select-none leading-none">
                  {n}
                </span>
                <div className="text-xs font-mono text-[#00D4FF] mb-3">Step {n}</div>
                <h3 className="text-base font-bold text-white mb-2">{heading}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — AEO section */}
      <section className="py-20 bg-[#080E1C]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#64748B] mb-4">
              Common questions
            </p>
            <h2 className="text-3xl font-bold text-white">
              Frequently asked questions
            </h2>
          </div>
          <dl className="space-y-6">
            {[
              {
                q: "What does Viviz Technologies build?",
                a: "We build AI-powered software for small and medium businesses. Our flagship product is Viviz CRM — an all-in-one business operating system. We also take on custom work: AI agent development, data science pipelines, marketing automation systems, and full-stack SaaS products.",
              },
              {
                q: "What is Viviz CRM and how is it different?",
                a: "Viviz CRM is a business operating system, not just a CRM. A new user can sign up, describe their business, and the platform builds their brand, website, CRM, and marketing automation automatically. It includes 10 platform modules and 10 autonomous AI agents. Unlike HubSpot or Salesforce, it's designed for SMBs from day one — not enterprise software scaled down.",
              },
              {
                q: "How much does Viviz CRM cost?",
                a: "Four tiers: Starter ($29/month), Growth ($79/month), Pro ($199/month), and Agency ($499/month). No per-seat fees. All plans include a free trial.",
              },
              {
                q: "Can you build a custom AI solution for my business?",
                a: "Yes. We design and build custom AI agents, data science pipelines, and automation systems. Projects typically start with a 30-minute discovery call where we assess your data, your workflow, and the highest-value use cases. Reach out via the contact page.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-white/5 pb-6">
                <dt className="text-base font-semibold text-white mb-2">{q}</dt>
                <dd className="text-sm text-[#64748B] leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-white/8 rounded-2xl p-10 sm:p-14 bg-[#0F1929]">
            <div className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#00D4FF] mb-4">
                Get in touch
              </p>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Tell us what you're trying to build.
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed mb-8">
                We reply within one business day with a straight answer — whether
                that's a proposal, a recommendation, or an honest "that's not a fit."
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#00D4FF] text-[#0B1120] font-semibold text-sm hover:bg-[#00BFEA] transition-colors"
                >
                  Start a conversation <ArrowRight size={15} />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-white/10 text-[#94A3B8] font-semibold text-sm hover:border-white/20 hover:text-white transition-colors"
                >
                  About us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
