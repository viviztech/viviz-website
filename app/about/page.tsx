import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap,
  Brain,
  Target,
  Heart,
  Rocket,
  Shield,
  ArrowRight,
  Users,
  Globe,
  Code2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About — Viviz Technologies",
  description:
    "Viviz Technologies is an AI software company building intelligent systems that help businesses operate smarter, grow faster, and compete at scale.",
};

const values = [
  {
    icon: Brain,
    color: "#00D4FF",
    title: "Intelligence First",
    desc: "We don't add AI as a feature. We architect every product so intelligence is a first-class component — not an afterthought.",
  },
  {
    icon: Target,
    color: "#8B5CF6",
    title: "Outcome Obsessed",
    desc: "We measure success by the results our clients achieve — revenue growth, time saved, customers retained. Code is just the means.",
  },
  {
    icon: Shield,
    color: "#10D9A0",
    title: "Production Quality",
    desc: "Every system we build is designed for scale, security, and reliability. We ship things we'd trust our own businesses to run on.",
  },
  {
    icon: Rocket,
    color: "#F59E0B",
    title: "Move Fast, Stay Sound",
    desc: "Speed matters. But not at the cost of correctness. We work fast because we've built the right foundations — not by cutting corners.",
  },
  {
    icon: Heart,
    color: "#EC4899",
    title: "Accessible AI",
    desc: "The most powerful AI tools should be available to every business, not just enterprises with seven-figure technology budgets.",
  },
  {
    icon: Globe,
    color: "#00D4FF",
    title: "Built for Everyone",
    desc: "Our vision is a world where any entrepreneur — anywhere — can launch and run a business as effectively as a Fortune 500 company.",
  },
];

const techStack = [
  { category: "Frontend", items: ["Next.js 15", "React", "TypeScript", "Tailwind CSS"] },
  { category: "Backend", items: ["Python FastAPI", "Node.js", "PostgreSQL", "Redis"] },
  { category: "AI & ML", items: ["Claude API", "LangGraph", "LangChain", "scikit-learn", "XGBoost"] },
  { category: "Infrastructure", items: ["AWS", "Vercel", "Docker", "ClickHouse", "pgvector"] },
  { category: "Automation", items: ["n8n", "Celery", "Apache Kafka", "Stripe"] },
];

const milestones = [
  { year: "2024", label: "Company Founded", desc: "Viviz Technologies incorporated with a clear mission: AI-powered software for every business." },
  { year: "Q1 2025", label: "Viviz CRM Conception", desc: "Product research phase begins. Validated the gap between fragmented SMB tools and an all-in-one intelligent platform." },
  { year: "Q2 2025", label: "Architecture Complete", desc: "Full technical architecture, AI agent design, and data science pipeline specifications finalized." },
  { year: "2026", label: "Building Phase", desc: "Active development of Viviz CRM across 8 build phases, targeting a 16-month path to public launch." },
  { year: "2027", label: "Public Launch", desc: "Viviz CRM opens to the public. Target: 100 paying customers in Month 1, $1M ARR by end of year." },
];

export default function AboutPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/5 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#10D9A0]/5 blur-[80px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10D9A0]/20 bg-[#10D9A0]/5 text-[#10D9A0] text-xs font-semibold tracking-widest uppercase mb-6">
              About Us
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              We Build the Software
              <span className="text-[#8B5CF6]"> That Builds Businesses</span>
            </h1>
            <p className="text-[#64748B] text-xl leading-relaxed">
              Viviz Technologies is an AI-first software company. We believe every
              business — regardless of size or budget — deserves access to the
              intelligent systems that used to be reserved for enterprises. So we build
              them, and we make them accessible.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 border-y border-white/5 bg-[#080E1C]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-8 rounded-3xl border border-[#00D4FF]/10 bg-[#00D4FF]/3">
              <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/15 flex items-center justify-center mb-4">
                <Target size={20} className="text-[#00D4FF]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Our Mission</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                To democratize access to AI-powered business operations by building
                products that any entrepreneur can use to launch, grow, and scale their
                business — without needing a team of engineers, data scientists, or
                marketers.
              </p>
            </div>
            <div className="p-8 rounded-3xl border border-[#8B5CF6]/10 bg-[#8B5CF6]/3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 flex items-center justify-center mb-4">
                <Rocket size={20} className="text-[#8B5CF6]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Our Vision</h2>
              <p className="text-[#94A3B8] leading-relaxed">
                A world where every small and medium business runs on an intelligent
                system that learns, adapts, and grows alongside it — where the gap
                between a startup's ambition and a corporation's capabilities no longer
                exists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-[#00D4FF] text-xs font-semibold tracking-widest uppercase mb-4">
              Our Values
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">What We Believe</h2>
            <p className="text-[#64748B] text-lg max-w-xl mx-auto">
              These principles guide every product decision, every line of code, and
              every client engagement.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-white/5 bg-[#0F1929] hover:border-white/10 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-[#080E1C]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 text-[#8B5CF6] text-xs font-semibold tracking-widest uppercase mb-4">
              Our Journey
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">From Idea to Platform</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/5" />
              <div className="space-y-10">
                {milestones.map(({ year, label, desc }) => (
                  <div key={year} className="relative flex gap-6 pl-8">
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-[#8B5CF6] bg-[#0B1120]" />
                    <div>
                      <span className="text-xs font-bold text-[#8B5CF6] tracking-widest uppercase">
                        {year}
                      </span>
                      <h3 className="text-base font-bold text-white mt-0.5 mb-1">{label}</h3>
                      <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#10D9A0]/20 bg-[#10D9A0]/5 text-[#10D9A0] text-xs font-semibold tracking-widest uppercase mb-4">
              Technology
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Built on the Best Stack</h2>
            <p className="text-[#64748B] text-lg max-w-xl mx-auto">
              Every technology choice is deliberate — chosen for performance, scalability,
              and the ability to support AI workloads at every layer.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {techStack.map(({ category, items }) => (
              <div
                key={category}
                className="p-5 rounded-2xl border border-white/5 bg-[#0F1929]"
              >
                <h3 className="text-xs font-bold text-[#64748B] tracking-widest uppercase mb-4">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Code2 size={12} className="text-[#00D4FF]" />
                      <span className="text-sm text-[#94A3B8]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F1929] to-[#111E30] p-12 text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full bg-[#10D9A0]/5 blur-[80px]" />
            </div>
            <div className="relative">
              <Users size={32} className="text-[#10D9A0] mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Want to Work With Us?
              </h2>
              <p className="text-[#64748B] text-lg mb-8 max-w-xl mx-auto">
                Whether you want to use our products, partner with us, or explore how
                AI can transform your business — we'd love to talk.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Get in Touch <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
