import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap,
  Bot,
  BarChart3,
  Megaphone,
  Palette,
  Code2,
  LineChart,
  Lightbulb,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services — Viviz Technologies",
  description:
    "AI Agent development, data science, marketing automation, SaaS development, and more — every service powered by intelligence.",
};

const services = [
  {
    id: "viviz-crm",
    icon: Zap,
    color: "#00D4FF",
    badge: "Flagship",
    title: "Viviz CRM",
    tagline: "AI-Powered Business Operating System",
    desc: "Our cornerstone product and service offering. We deploy Viviz CRM for businesses that want an all-in-one platform — from brand setup through AI-driven marketing and autonomous sales pipeline management. Sign up, describe your business, and the system builds and runs it.",
    features: [
      "10 integrated platform modules",
      "Business setup wizard with brand AI",
      "Website + social media auto-generation",
      "AI-driven CRM and sales pipeline",
      "Marketing automation across email, SMS, WhatsApp",
      "Real-time analytics and revenue forecasting",
    ],
    tech: ["Next.js 15", "Python FastAPI", "Claude API", "LangGraph", "PostgreSQL"],
  },
  {
    id: "ai-agents",
    icon: Bot,
    color: "#8B5CF6",
    badge: "Automation",
    title: "AI Agent Development",
    tagline: "Autonomous Workflow Automation",
    desc: "We design and deploy custom AI agents that handle repetitive, high-volume business workflows without human intervention. Whether you need a lead qualification agent, a customer support bot, or a multi-step sales outreach system — we build agents that execute 24/7.",
    features: [
      "Custom agent design and architecture",
      "Lead qualification and nurturing agents",
      "Customer support and onboarding agents",
      "Data enrichment and research agents",
      "Integration with your existing CRM and tools",
      "Monitoring, logging, and human-in-the-loop overrides",
    ],
    tech: ["Claude API", "LangGraph", "LangChain", "n8n", "FastAPI"],
  },
  {
    id: "data-science",
    icon: BarChart3,
    color: "#10D9A0",
    badge: "Intelligence",
    title: "Data Science & Predictive Analytics",
    tagline: "Machine Learning for Business Growth",
    desc: "We apply data science to your business data to surface insights that directly drive revenue. Lead scoring tells your sales team who to call first. Churn prediction flags customers before they leave. Revenue forecasting helps you plan with confidence.",
    features: [
      "Lead scoring models (who to prioritize)",
      "Churn prediction and early-warning alerts",
      "Customer Lifetime Value (CLV) modeling",
      "Revenue and demand forecasting",
      "RFM segmentation for marketing",
      "Custom ML pipelines and model deployment",
    ],
    tech: ["scikit-learn", "XGBoost", "Prophet", "Hugging Face", "ClickHouse"],
  },
  {
    id: "marketing-automation",
    icon: Megaphone,
    color: "#F59E0B",
    badge: "Growth",
    title: "Marketing Automation",
    tagline: "Multi-Channel Campaigns on Autopilot",
    desc: "We build intelligent marketing automation systems that send the right message, to the right person, at the right time — across email, SMS, WhatsApp, and paid ads. Smart segmentation, A/B testing, and AI copywriting make every campaign more effective.",
    features: [
      "Email, SMS, and WhatsApp automation flows",
      "Smart audience segmentation",
      "AI-generated copy and subject lines",
      "A/B testing and campaign optimization",
      "Ad campaign management (Google, Meta)",
      "Full funnel analytics and attribution",
    ],
    tech: ["n8n", "SendGrid", "Twilio", "Meta Ads API", "Google Ads API"],
  },
  {
    id: "brand-digital-presence",
    icon: Palette,
    color: "#EC4899",
    badge: "Launch",
    title: "Brand & Digital Presence",
    tagline: "From Identity to Full Online Presence",
    desc: "We use AI to accelerate the brand-building process — generating name options, logo concepts, color systems, and brand voice guidelines. Then we build your website with built-in SEO and connect all your social channels for consistent, automated publishing.",
    features: [
      "Brand name and identity generation",
      "Logo design and color system creation",
      "Brand voice and messaging guidelines",
      "AI-generated website with custom domain",
      "SEO optimization from day one",
      "Social media profile setup and content calendar",
    ],
    tech: ["Next.js", "Tailwind CSS", "GPT-4o", "Stable Diffusion", "Vercel"],
  },
  {
    id: "custom-saas",
    icon: Code2,
    color: "#00D4FF",
    badge: "Engineering",
    title: "Custom SaaS Development",
    tagline: "End-to-End Software Products",
    desc: "We design, build, and launch complete SaaS products — from the database schema and API design through to the frontend UI and deployment pipeline. Whether you have a validated idea or just a problem worth solving, we turn it into a production-ready product.",
    features: [
      "Product architecture and database design",
      "REST and GraphQL API development",
      "Next.js + React frontend engineering",
      "Multi-tenant architecture and auth",
      "Stripe billing and subscription management",
      "CI/CD pipelines and cloud deployment",
    ],
    tech: ["Next.js 15", "TypeScript", "Python FastAPI", "PostgreSQL", "Redis", "AWS"],
  },
  {
    id: "business-intelligence",
    icon: LineChart,
    color: "#8B5CF6",
    badge: "Insights",
    title: "Business Intelligence & Dashboards",
    tagline: "Real-Time Clarity for Every Decision",
    desc: "We build unified data pipelines that pull from every tool your business uses — your CRM, ads platforms, billing system, and operations tools — and surface the numbers that matter in interactive, real-time dashboards your whole team can use.",
    features: [
      "Unified data pipeline architecture",
      "Real-time KPI dashboards",
      "Custom metrics and reporting",
      "Data warehouse design (ClickHouse/BigQuery)",
      "Embedded analytics in your product",
      "Alerts and automated reporting",
    ],
    tech: ["ClickHouse", "Apache Kafka", "Metabase", "Recharts", "dbt"],
  },
  {
    id: "ai-strategy",
    icon: Lightbulb,
    color: "#10D9A0",
    badge: "Consulting",
    title: "AI Strategy & Consulting",
    tagline: "From Roadmap to Running System",
    desc: "Not sure where AI fits in your business? We assess your operations, identify the highest-impact use cases, recommend the right tools and models, and build a phased implementation plan — then execute it alongside you.",
    features: [
      "AI readiness assessment",
      "Use case identification and prioritization",
      "Tool and model selection",
      "Phased implementation roadmap",
      "Vendor and API evaluation",
      "Team training and handoff support",
    ],
    tech: ["Claude API", "OpenAI", "Hugging Face", "LangChain", "Custom pipelines"],
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#8B5CF6]/6 blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#8B5CF6]/20 bg-[#8B5CF6]/5 text-[#8B5CF6] text-xs font-semibold tracking-widest uppercase mb-6">
            Our Services
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
            Eight Services.
            <br />
            <span className="text-[#8B5CF6]">One Intelligence.</span>
          </h1>
          <p className="text-[#64748B] text-xl max-w-2xl mx-auto">
            Every service we offer is built around a core belief: intelligence should be
            built into the product from the start, not bolted on later.
          </p>
        </div>
      </section>

      {/* Services list */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {services.map(({ id, icon: Icon, color, badge, title, tagline, desc, features, tech }) => (
            <div
              key={id}
              id={id}
              className="group p-8 rounded-3xl border border-white/5 bg-[#0F1929] hover:border-white/10 transition-all duration-300"
            >
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                {/* Left */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${color}18` }}
                    >
                      <Icon size={24} style={{ color }} />
                    </div>
                    <span
                      className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
                      style={{ color, background: `${color}15` }}
                    >
                      {badge}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
                  <p className="text-sm font-semibold mb-4" style={{ color }}>
                    {tagline}
                  </p>
                  <p className="text-[#64748B] leading-relaxed">{desc}</p>

                  {/* Tech stack */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    {tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-[#94A3B8] border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: features */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-4 tracking-wide">
                    What's Included
                  </h3>
                  <ul className="space-y-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <CheckCircle
                          size={16}
                          className="mt-0.5 shrink-0"
                          style={{ color }}
                        />
                        <span className="text-sm text-[#94A3B8]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0F1929] to-[#111E30] p-12 text-center">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#8B5CF6]/5 blur-[80px]" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">
                Not Sure Which Service Fits?
              </h2>
              <p className="text-[#64748B] text-lg mb-8 max-w-xl mx-auto">
                Tell us your challenge. We'll recommend the right combination of services
                and give you a clear implementation plan.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#8B5CF6] text-white font-semibold hover:opacity-90 transition-opacity"
              >
                Get a Free Consultation <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
