import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap,
  Bot,
  Globe,
  Share2,
  Users,
  Megaphone,
  BarChart3,
  Brain,
  Building2,
  Plug,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Target,
  Shield,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Products — Viviz Technologies",
  description:
    "Viviz CRM: the AI-powered Business Operating System for SMBs. One platform for brand, website, CRM, marketing, and autonomous AI operations.",
};

const modules = [
  {
    icon: Zap,
    color: "#00D4FF",
    name: "Business Setup Wizard",
    desc: "Sign up, describe your business idea, industry, and goals. AI generates your complete business profile and activates the platform instantly.",
  },
  {
    icon: Palette2,
    color: "#EC4899",
    name: "Brand Studio",
    desc: "AI-generated brand names, logos, color palettes, typography, and brand voice guidelines — a complete brand kit in minutes.",
  },
  {
    icon: Globe,
    color: "#10D9A0",
    name: "Website Builder",
    desc: "AI-generated website with custom domain, on-page SEO, blog integration, and automatic updates — no developer needed.",
  },
  {
    icon: Share2,
    color: "#F59E0B",
    name: "Social Media Suite",
    desc: "Auto-posting across all platforms, content calendar, AI content generation, and social listening — all managed from one dashboard.",
  },
  {
    icon: Users,
    color: "#00D4FF",
    name: "CRM & Sales Pipeline",
    desc: "Contacts, deals, tasks, invoices, and Stripe payments in one unified system. Full pipeline visibility with AI-powered follow-up suggestions.",
  },
  {
    icon: Megaphone,
    color: "#8B5CF6",
    name: "Marketing Automation",
    desc: "Multi-channel sequences across email, SMS, and WhatsApp. Smart segmentation, A/B testing, and ad campaign management built in.",
  },
  {
    icon: BarChart3,
    color: "#10D9A0",
    name: "Data Science Layer",
    desc: "Lead scoring, churn prediction, customer lifetime value, and revenue forecasting — machine learning working continuously in the background.",
  },
  {
    icon: Bot,
    color: "#8B5CF6",
    name: "AI Agents Command Center",
    desc: "10 autonomous agents handling lead qualification, customer onboarding, content creation, support, ad management, and more — 24/7.",
  },
  {
    icon: Building2,
    color: "#F59E0B",
    name: "Business Operations",
    desc: "Bookings and scheduling, team management, financial reporting, and customer support ticketing — your entire back office in one place.",
  },
  {
    icon: Plug,
    color: "#00D4FF",
    name: "Integrations Hub",
    desc: "30+ pre-built integrations with Stripe, Zapier, Slack, Google Workspace, Meta, Shopify, QuickBooks, and more.",
  },
];

const agents = [
  { name: "Lead Scout", role: "Researches and qualifies inbound leads automatically" },
  { name: "Outreach Agent", role: "Sends personalized cold outreach sequences at scale" },
  { name: "Nurture Agent", role: "Follows up with leads based on behavior and timing" },
  { name: "Onboarding Agent", role: "Walks new customers through setup automatically" },
  { name: "Support Agent", role: "Handles Tier 1 customer support 24/7" },
  { name: "Content Creator", role: "Generates blog posts, captions, and ad copy" },
  { name: "Ad Manager", role: "Optimizes ad spend across Google and Meta" },
  { name: "Data Analyst", role: "Surfaces insights and generates scheduled reports" },
  { name: "Invoice Agent", role: "Creates, sends, and follows up on invoices" },
  { name: "Growth Advisor", role: "Recommends next actions based on business data" },
];

const pricing = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    desc: "For solopreneurs and new businesses",
    features: ["5 platform modules", "2 AI agents", "1,000 contacts", "Email automation", "Basic analytics"],
    color: "#64748B",
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$79",
    period: "/mo",
    desc: "For growing teams and SMBs",
    features: ["All 10 modules", "5 AI agents", "10,000 contacts", "Email + SMS + WhatsApp", "Data science layer", "Priority support"],
    color: "#00D4FF",
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Pro",
    price: "$199",
    period: "/mo",
    desc: "For established businesses scaling fast",
    features: ["Everything in Growth", "All 10 AI agents", "Unlimited contacts", "Ad campaign management", "Custom integrations", "Dedicated onboarding"],
    color: "#8B5CF6",
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Agency",
    price: "$499",
    period: "/mo",
    desc: "For agencies managing multiple clients",
    features: ["Multi-tenant white-label", "Unlimited workspaces", "API access", "Custom branding", "SLA support", "Team permissions"],
    color: "#10D9A0",
    cta: "Contact Sales",
    highlight: false,
  },
];

function Palette2({ size, color }: { size?: number; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? 24}
      height={size ?? 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill={color ?? "currentColor"} />
      <circle cx="17.5" cy="10.5" r=".5" fill={color ?? "currentColor"} />
      <circle cx="8.5" cy="7.5" r=".5" fill={color ?? "currentColor"} />
      <circle cx="6.5" cy="12.5" r=".5" fill={color ?? "currentColor"} />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

export default function ProductsPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[#00D4FF]/5 blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10D9A0]/20 bg-[#10D9A0]/5 text-[#10D9A0] text-xs font-semibold tracking-widest uppercase mb-6">
              Flagship Product
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Viviz CRM
              <br />
              <span className="text-[#00D4FF]">Your Entire Business,</span>
              <br />
              <span className="text-[#8B5CF6]">Powered by AI</span>
            </h1>
            <p className="text-[#64748B] text-xl leading-relaxed mb-8">
              The world's first AI Business Operating System for SMBs. Sign up, describe
              your business, and Viviz CRM builds your brand, launches your website,
              runs your marketing, and grows your pipeline — all autonomously.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Request Early Access <ArrowRight size={16} />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key stats */}
      <section className="border-y border-white/5 bg-[#080E1C]/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "10", label: "Platform Modules", icon: Zap, color: "#00D4FF" },
              { value: "10", label: "Autonomous AI Agents", icon: Bot, color: "#8B5CF6" },
              { value: "30+", label: "App Integrations", icon: Plug, color: "#10D9A0" },
              { value: "94%", label: "Lead Score Accuracy", icon: Target, color: "#F59E0B" },
            ].map(({ value, label, icon: Icon, color }) => (
              <div key={label}>
                <Icon size={20} style={{ color }} className="mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-sm text-[#64748B]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Modules */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-[#00D4FF] text-xs font-semibold tracking-widest uppercase mb-4">
              Platform Modules
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">10 Modules. One Platform.</h2>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
              Every module works independently — and becomes more powerful when combined.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {modules.map(({ icon: Icon, color, name, desc }) => (
              <div
                key={name}
                className="p-5 rounded-2xl border border-white/5 bg-[#0F1929] hover:border-white/10 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{name}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section className="py-24 bg-[#080E1C]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 text-[#8B5CF6] text-xs font-semibold tracking-widest uppercase mb-6">
                AI Agents
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                10 Autonomous Agents
                <span className="text-[#8B5CF6]"> Working for Your Business</span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed mb-6">
                Each agent is specialized, always on, and gets smarter over time. They
                coordinate with each other, escalate to humans when needed, and handle
                the repetitive work that consumes your team.
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#8B5CF6]">24/7</div>
                  <div className="text-xs text-[#64748B]">Always Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#00D4FF]">10x</div>
                  <div className="text-xs text-[#64748B]">Output Multiplier</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#10D9A0]">0</div>
                  <div className="text-xs text-[#64748B]">Extra Headcount</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {agents.map(({ name, role }) => (
                <div
                  key={name}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#0F1929]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-[#8B5CF6]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{name}</div>
                    <div className="text-xs text-[#64748B]">{role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Science */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10D9A0]/20 bg-[#10D9A0]/5 text-[#10D9A0] text-xs font-semibold tracking-widest uppercase mb-4">
              Data Science Layer
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Intelligence in Every Decision</h2>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
              Machine learning models built into the platform that continuously analyze
              your data and surface the insights that drive growth.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, color: "#10D9A0", label: "Lead Scoring", stat: "94% accuracy", desc: "ML model ranks every lead so your team knows exactly who to call first." },
              { icon: TrendingUp, color: "#00D4FF", label: "Revenue Forecast", stat: "±8% error", desc: "Prophet time-series model predicts monthly revenue 90 days ahead." },
              { icon: Shield, color: "#8B5CF6", label: "Churn Prediction", stat: "30 day warning", desc: "XGBoost model identifies at-risk customers before they cancel." },
              { icon: Clock, color: "#F59E0B", label: "CLV Modeling", stat: "Full lifecycle", desc: "Customer lifetime value model segments your best customers automatically." },
            ].map(({ icon: Icon, color, label, stat, desc }) => (
              <div
                key={label}
                className="p-6 rounded-2xl border border-white/5 bg-[#0F1929]"
              >
                <Icon size={24} style={{ color }} className="mb-4" />
                <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color }}>
                  {stat}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{label}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#080E1C]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-[#00D4FF] text-xs font-semibold tracking-widest uppercase mb-4">
              Pricing
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[#64748B] text-lg max-w-xl mx-auto">
              Start free. Scale when you're ready. No setup fees, no contracts.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricing.map(({ name, price, period, desc, features, color, cta, highlight }) => (
              <div
                key={name}
                className={`relative p-6 rounded-2xl border transition-all ${
                  highlight
                    ? "border-[#00D4FF]/30 bg-gradient-to-b from-[#00D4FF]/5 to-[#0F1929]"
                    : "border-white/5 bg-[#0F1929]"
                }`}
              >
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00D4FF] text-[#0B1120]">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color }}>
                  {name}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">{price}</span>
                  <span className="text-[#64748B] text-sm mb-1">{period}</span>
                </div>
                <p className="text-xs text-[#64748B] mb-6">{desc}</p>
                <ul className="space-y-2.5 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color }} />
                      <span className="text-xs text-[#94A3B8]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    highlight
                      ? "bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white hover:opacity-90"
                      : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Put Your Business on{" "}
            <span className="text-[#00D4FF]">Autopilot?</span>
          </h2>
          <p className="text-[#64748B] text-lg mb-8 max-w-xl mx-auto">
            Join the waitlist for Viviz CRM early access and be the first to experience
            a business that runs itself.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Request Early Access <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
