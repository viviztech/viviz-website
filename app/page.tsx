import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Bot,
  BarChart3,
  Megaphone,
  Palette,
  Code2,
  LineChart,
  Lightbulb,
  CheckCircle,
  Zap,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

const services = [
  {
    icon: Zap,
    color: "#00D4FF",
    title: "Viviz CRM",
    tagline: "AI Business Operating System",
    desc: "An all-in-one platform where any business can sign up, describe their idea, and let AI build and run their entire operation — brand, website, marketing, sales, and beyond.",
  },
  {
    icon: Bot,
    color: "#8B5CF6",
    title: "AI Agent Development",
    tagline: "Autonomous Workflow Automation",
    desc: "Custom AI agents that work 24/7 — qualifying leads, nurturing prospects, managing customer support, and executing business workflows without human intervention.",
  },
  {
    icon: BarChart3,
    color: "#10D9A0",
    title: "Data Science & Analytics",
    tagline: "Predictive Intelligence",
    desc: "Lead scoring, churn prediction, customer lifetime value modeling, and revenue forecasting powered by machine learning tailored to your business data.",
  },
  {
    icon: Megaphone,
    color: "#F59E0B",
    title: "Marketing Automation",
    tagline: "Multi-Channel Campaigns",
    desc: "Automated email, SMS, and WhatsApp sequences with smart segmentation, A/B testing, and ad campaign management that converts at every stage of the funnel.",
  },
  {
    icon: Palette,
    color: "#EC4899",
    title: "Brand & Digital Presence",
    tagline: "Identity to Launch",
    desc: "AI-generated brand identity, professional website creation, SEO optimization, and full social media setup so you launch with a complete, cohesive digital presence.",
  },
  {
    icon: Code2,
    color: "#00D4FF",
    title: "Custom SaaS Development",
    tagline: "End-to-End Software Products",
    desc: "Full-stack SaaS products built with Next.js, Python FastAPI, and modern cloud infrastructure — from MVP to production-ready platforms with scalable architecture.",
  },
  {
    icon: LineChart,
    color: "#8B5CF6",
    title: "Business Intelligence",
    tagline: "Real-Time Dashboards",
    desc: "Unified data pipelines and interactive dashboards that surface the metrics that matter — giving leadership the clarity to make faster, smarter decisions.",
  },
  {
    icon: Lightbulb,
    color: "#10D9A0",
    title: "AI Strategy & Consulting",
    tagline: "Roadmap to Implementation",
    desc: "Strategic AI adoption planning, tool selection, and hands-on implementation to integrate intelligence into your existing business — without disruption.",
  },
];

const stats = [
  { value: "10+", label: "Platform Modules", icon: Zap },
  { value: "10", label: "AI Agents", icon: Bot },
  { value: "30+", label: "Integrations", icon: Shield },
  { value: "16", label: "Month Build Plan", icon: TrendingUp },
];

const whyUs = [
  "End-to-end AI implementation — not just consulting",
  "Production-grade code with enterprise scalability",
  "Data science layer built into every product",
  "Multi-tenant SaaS architecture expertise",
  "Claude AI + LangGraph agent orchestration",
  "Continuous iteration and support post-launch",
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#00D4FF]/5 blur-[120px]" />
          <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/8 blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#10D9A0]/6 blur-[80px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#00D4FF 1px, transparent 1px), linear-gradient(90deg, #00D4FF 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-[#00D4FF] text-xs font-semibold tracking-widest uppercase mb-8">
              <Zap size={12} />
              AI-Powered Software Company
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6">
              We Build Software
              <br />
              <span className="bg-gradient-to-r from-[#00D4FF] via-[#8B5CF6] to-[#10D9A0] bg-clip-text text-transparent">
                That Thinks For You
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[#94A3B8] leading-relaxed max-w-2xl mb-10">
              Viviz Technologies creates AI-powered products and services that automate
              your business operations, predict what happens next, and help you grow
              without limits. From idea to intelligent system — we build it all.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                See Our Products
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Talk to Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-[#080E1C]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#00D4FF]/10 mb-3">
                  <Icon size={18} className="text-[#00D4FF]" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-sm text-[#64748B]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 text-[#8B5CF6] text-xs font-semibold tracking-widest uppercase mb-4">
              What We Do
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Every Service, Powered by AI
            </h2>
            <p className="text-[#64748B] text-lg max-w-2xl mx-auto">
              Eight specialized services — all unified by a single mission: to make
              intelligence accessible for every business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map(({ icon: Icon, color, title, tagline, desc }) => (
              <div
                key={title}
                className="group relative p-6 rounded-2xl border border-white/5 bg-[#0F1929] hover:border-white/10 hover:bg-[#111E30] transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <p
                  className="text-[11px] font-semibold tracking-widest uppercase mb-1"
                  style={{ color }}
                >
                  {tagline}
                </p>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-[#00D4FF] text-sm font-semibold hover:gap-3 transition-all"
            >
              View All Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Product spotlight */}
      <section className="py-24 bg-[#080E1C]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10D9A0]/20 bg-[#10D9A0]/5 text-[#10D9A0] text-xs font-semibold tracking-widest uppercase mb-6">
                Flagship Product
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Viviz CRM —<br />
                <span className="text-[#00D4FF]">Your Entire Business in One App</span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed mb-8">
                Sign up, describe your business idea, and Viviz CRM builds and runs
                everything — your brand, website, social media, CRM, marketing
                automation, and sales pipeline. Powered by 10 AI Agents working around
                the clock.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "10 platform modules, one unified dashboard",
                  "Autonomous AI agents handle repetitive work",
                  "Built-in data science: churn, leads, revenue",
                  "Multi-channel marketing on autopilot",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[#10D9A0] mt-0.5 shrink-0" />
                    <span className="text-[#94A3B8] text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Explore Viviz CRM <ArrowRight size={16} />
              </Link>
            </div>

            {/* Visual card grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "AI Agents", value: "10 Active", color: "#00D4FF", icon: Bot },
                { label: "Lead Score", value: "94% Accuracy", color: "#10D9A0", icon: Brain },
                { label: "Users", value: "Growing Fast", color: "#8B5CF6", icon: Users },
                { label: "Revenue", value: "↑ 340% Avg", color: "#F59E0B", icon: TrendingUp },
              ].map(({ label, value, color, icon: Icon }) => (
                <div
                  key={label}
                  className="p-5 rounded-2xl border border-white/5 bg-[#0F1929]"
                >
                  <Icon size={20} style={{ color }} className="mb-3" />
                  <div className="text-xs text-[#64748B] mb-1">{label}</div>
                  <div className="text-base font-bold text-white">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="grid grid-cols-1 gap-4">
              {whyUs.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#0F1929]"
                >
                  <CheckCircle size={18} className="text-[#00D4FF] shrink-0" />
                  <span className="text-sm text-[#94A3B8]">{item}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-[#00D4FF] text-xs font-semibold tracking-widest uppercase mb-6">
                Why Viviz
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                We Don't Just Build Software.
                <span className="text-[#8B5CF6]"> We Build Intelligent Systems.</span>
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed mb-8">
                Every line of code we write has intelligence built in. We combine
                cutting-edge AI, rigorous data science, and proven engineering to deliver
                products that get smarter as you use them.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[#8B5CF6] text-sm font-semibold hover:gap-3 transition-all"
              >
                Learn about our mission <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F1929] to-[#111E30] p-12 text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#00D4FF]/5 blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Build Something
                <span className="text-[#00D4FF]"> Intelligent?</span>
              </h2>
              <p className="text-[#64748B] text-lg mb-8 max-w-xl mx-auto">
                Tell us about your business challenge and we'll show you how AI can
                transform it. No fluff — just results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Start a Project <ArrowRight size={16} />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Browse Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
