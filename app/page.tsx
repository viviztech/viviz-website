import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Smartphone,
  Brain,
  BarChart3,
  Cloud,
  CheckCircle,
  Users,
  Briefcase,
  Award,
  Code2,
  Layers,
  ShoppingCart,
  Heart,
  GraduationCap,
  Building2,
  Truck,
  Zap,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { BASE_URL, COMPANY_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: `${COMPANY_NAME} — IT Solutions & Software Development Company`,
  description:
    "Viviz Technologies is a software development and IT solutions company based in Karur, Tamil Nadu. We build custom web apps, mobile apps, AI solutions, and enterprise software for businesses across industries.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: `${COMPANY_NAME} — IT Solutions & Software Development`,
    description:
      "Custom software development, web & mobile apps, AI/ML, data science, and cloud solutions — built by Viviz Technologies, Karur.",
    url: BASE_URL,
  },
};

const homepageFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What services does Viviz Technologies offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viviz Technologies offers custom software development, web application development, mobile app development (iOS and Android), AI and machine learning solutions, data science and analytics, cloud and DevOps services, UI/UX design, and IT consulting. We also develop Viviz CRM, our flagship AI-powered business software product.",
      },
    },
    {
      "@type": "Question",
      name: "Where is Viviz Technologies located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viviz Technologies is located at No 47, 1st Floor, Sengunthapuram 3rd Cross Corner, Karur - 639002, Tamil Nadu, India. You can reach us at online@viviz.in or by phone at 9344064631 / 9342064631.",
      },
    },
    {
      "@type": "Question",
      name: "What technologies does Viviz Technologies work with?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We work with React, Next.js, TypeScript, Python, Node.js, FastAPI, React Native, Flutter, PostgreSQL, MongoDB, Redis, AWS, Docker, TensorFlow, PyTorch, LangChain, and many more modern technologies.",
      },
    },
    {
      "@type": "Question",
      name: "What is Viviz CRM?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viviz CRM is our flagship software product — an AI-powered Business Operating System for small and medium businesses. It includes brand building, website creation, CRM, marketing automation, and autonomous AI agents in a single platform.",
      },
    },
  ],
};

const coreServices = [
  {
    icon: Code2,
    color: "#00D4FF",
    title: "Custom Software Development",
    desc: "Bespoke web and desktop applications built to your exact specifications. From internal tools to client-facing platforms.",
  },
  {
    icon: Globe,
    color: "#8B5CF6",
    title: "Web Application Development",
    desc: "Fast, scalable web apps using React and Next.js. We handle everything from architecture to deployment.",
  },
  {
    icon: Smartphone,
    color: "#10D9A0",
    title: "Mobile App Development",
    desc: "iOS and Android applications built with React Native and Flutter. One codebase, native performance.",
  },
  {
    icon: Brain,
    color: "#F59E0B",
    title: "AI & Machine Learning",
    desc: "Intelligent automation, predictive models, NLP, and AI agents that make your software smarter.",
  },
  {
    icon: BarChart3,
    color: "#EC4899",
    title: "Data Science & Analytics",
    desc: "Business intelligence dashboards, data pipelines, and predictive analytics that turn data into decisions.",
  },
  {
    icon: Cloud,
    color: "#00D4FF",
    title: "Cloud & DevOps",
    desc: "AWS and GCP infrastructure, containerisation, CI/CD pipelines, and scalable deployment architecture.",
  },
];

const techStack = {
  Frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js"],
  Backend: ["Python", "Node.js", "FastAPI", "Django", "Express"],
  Mobile: ["React Native", "Flutter", "Expo"],
  "AI & Data": ["TensorFlow", "PyTorch", "scikit-learn", "LangChain", "Pandas"],
  Database: ["PostgreSQL", "MongoDB", "Redis", "MySQL", "ClickHouse"],
  Cloud: ["AWS", "GCP", "Docker", "Kubernetes", "GitHub Actions"],
};

const industries = [
  { icon: ShoppingCart, label: "E-Commerce & Retail" },
  { icon: Heart, label: "Healthcare & Medical" },
  { icon: Building2, label: "Finance & Banking" },
  { icon: GraduationCap, label: "Education & EdTech" },
  { icon: Truck, label: "Logistics & Supply Chain" },
  { icon: Zap, label: "Startups & SMBs" },
];

const stats = [
  { value: "50+", label: "Projects Delivered", icon: Briefcase },
  { value: "30+", label: "Happy Clients", icon: Users },
  { value: "5+", label: "Years Experience", icon: Award },
  { value: "15+", label: "Technologies", icon: Layers },
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={homepageFaqSchema} />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-0 w-[600px] h-[600px] rounded-full bg-[#00D4FF]/4 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/4 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center min-h-[calc(100vh-8rem)]">
            {/* Left */}
            <div>
              <p className="text-[#00D4FF] text-xs font-bold tracking-[0.2em] uppercase mb-5">
                Software Development & IT Solutions
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-6">
                We Build Software
                <br />
                That Powers Your
                <br />
                <span className="text-[#00D4FF]">Business.</span>
              </h1>
              <p className="text-[#94A3B8] text-lg leading-relaxed mb-4 max-w-lg">
                Viviz Technologies is a full-service IT company based in Karur, Tamil
                Nadu. We design and build custom software — from web and mobile
                applications to AI-powered systems and enterprise platforms.
              </p>
              <p className="text-[#64748B] text-sm mb-8 max-w-lg">
                Whether you need a product built from scratch, a legacy system
                modernised, or intelligent automation added to your workflow — we
                have the team and the technology to deliver it.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00D4FF] text-[#0B1120] font-semibold text-sm hover:bg-[#00BFEA] transition-colors"
                >
                  Our Services <ArrowRight size={15} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-white/10 text-[#94A3B8] font-semibold text-sm hover:border-white/20 hover:text-white transition-colors"
                >
                  Start a Project
                </Link>
              </div>
            </div>

            {/* Right — project portfolio cards */}
            <div className="relative h-[420px] hidden lg:block">
              {/* Card 1 */}
              <div className="absolute top-0 left-0 w-56 p-5 rounded-2xl border border-white/8 bg-[#0F1929] shadow-xl">
                <Globe size={18} className="text-[#00D4FF] mb-3" />
                <div className="text-sm font-semibold text-white mb-1">E-Commerce Platform</div>
                <div className="text-xs text-[#475569] mb-3">Next.js · PostgreSQL · AWS</div>
                <div className="h-1 bg-white/5 rounded-full">
                  <div className="h-full w-full bg-[#00D4FF] rounded-full" />
                </div>
                <div className="text-[10px] text-[#10D9A0] mt-1.5 font-semibold">✓ Delivered</div>
              </div>

              {/* Card 2 */}
              <div className="absolute top-8 right-0 w-56 p-5 rounded-2xl border border-white/8 bg-[#0F1929] shadow-xl">
                <Smartphone size={18} className="text-[#8B5CF6] mb-3" />
                <div className="text-sm font-semibold text-white mb-1">Hospital Management App</div>
                <div className="text-xs text-[#475569] mb-3">React Native · Node.js</div>
                <div className="h-1 bg-white/5 rounded-full">
                  <div className="h-full w-full bg-[#8B5CF6] rounded-full" />
                </div>
                <div className="text-[10px] text-[#10D9A0] mt-1.5 font-semibold">✓ Delivered</div>
              </div>

              {/* Card 3 */}
              <div className="absolute top-[200px] left-8 w-56 p-5 rounded-2xl border border-white/8 bg-[#0F1929] shadow-xl">
                <Brain size={18} className="text-[#10D9A0] mb-3" />
                <div className="text-sm font-semibold text-white mb-1">AI Analytics Dashboard</div>
                <div className="text-xs text-[#475569] mb-3">Python · TensorFlow · React</div>
                <div className="h-1 bg-white/5 rounded-full">
                  <div className="h-full w-full bg-[#10D9A0] rounded-full" />
                </div>
                <div className="text-[10px] text-[#10D9A0] mt-1.5 font-semibold">✓ Delivered</div>
              </div>

              {/* Card 4 */}
              <div className="absolute bottom-0 right-4 w-56 p-5 rounded-2xl border border-white/8 bg-[#0F1929] shadow-xl">
                <BarChart3 size={18} className="text-[#F59E0B] mb-3" />
                <div className="text-sm font-semibold text-white mb-1">ERP System</div>
                <div className="text-xs text-[#475569] mb-3">Django · PostgreSQL · Docker</div>
                <div className="h-1 bg-white/5 rounded-full">
                  <div className="h-full w-[75%] bg-[#F59E0B] rounded-full" />
                </div>
                <div className="text-[10px] text-[#F59E0B] mt-1.5 font-semibold">In Progress</div>
              </div>

              {/* Floating badge */}
              <div className="absolute top-[140px] right-[80px] bg-[#111E30] border border-[#00D4FF]/20 rounded-xl px-4 py-2.5 shadow-xl">
                <div className="text-[10px] text-[#64748B]">Projects Delivered</div>
                <div className="text-xl font-bold text-[#00D4FF]">50+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-[#080E1C]/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label}>
                <Icon size={18} className="text-[#00D4FF] mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-sm text-[#64748B]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#8B5CF6] mb-3">
              What we do
            </p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <h2 className="text-4xl font-bold text-white leading-tight">
                End-to-end IT services<br />for every stage of growth.
              </h2>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-[#8B5CF6] text-sm font-semibold hover:gap-3 transition-all shrink-0"
              >
                All services <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {coreServices.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-white/5 bg-[#0F1929] hover:border-white/10 hover:bg-[#111E30] transition-all duration-200"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">{desc}</p>
                <div
                  className="mt-4 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color }}
                >
                  Learn more <ArrowRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology stack */}
      <section className="py-20 bg-[#080E1C]/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#00D4FF] mb-3">
              Technologies
            </p>
            <h2 className="text-3xl font-bold text-white">
              Our technology expertise.
            </h2>
          </div>
          <div className="space-y-6">
            {Object.entries(techStack).map(([category, techs]) => (
              <div key={category} className="flex items-start gap-6">
                <span className="text-xs font-semibold text-[#475569] w-20 shrink-0 pt-1.5">
                  {category}
                </span>
                <div className="flex flex-wrap gap-2">
                  {techs.map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[#94A3B8] text-xs font-medium hover:border-white/10 hover:text-white transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#10D9A0] mb-4">
                Why Viviz Technologies
              </p>
              <h2 className="text-4xl font-bold text-white leading-tight mb-6">
                A team that treats your
                project like their own.
              </h2>
              <p className="text-[#64748B] leading-relaxed mb-8">
                We're a focused team of engineers and designers who care about what we
                build. Every project gets senior attention, clear communication, and
                code that's built to last — not patched together and handed over.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[#10D9A0] text-sm font-semibold hover:gap-3 transition-all"
              >
                About our team <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  icon: Code2,
                  color: "#00D4FF",
                  title: "Full-Stack Capability",
                  body: "We handle the complete delivery — UI design, backend APIs, database architecture, and cloud deployment. No handoff gaps.",
                },
                {
                  icon: CheckCircle,
                  color: "#10D9A0",
                  title: "Transparent Process",
                  body: "Weekly demos, direct access to the developer building your product, and honest timelines from day one.",
                },
                {
                  icon: Brain,
                  color: "#8B5CF6",
                  title: "AI-Ready by Default",
                  body: "We build systems that are ready for AI integration — whether that's an ML model, an LLM, or automation logic.",
                },
                {
                  icon: Users,
                  color: "#F59E0B",
                  title: "Long-Term Partnership",
                  body: "We stay involved after launch. Maintenance, feature development, and scaling are all part of how we work.",
                },
              ].map(({ icon: Icon, color, title, body }) => (
                <div
                  key={title}
                  className="flex items-start gap-4 p-5 rounded-xl border border-white/5 bg-[#0F1929]"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}
                  >
                    <Icon size={17} style={{ color }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white mb-1">{title}</div>
                    <div className="text-xs text-[#64748B] leading-relaxed">{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Viviz CRM spotlight — product, not the whole site */}
      <section className="py-20 bg-[#080E1C]/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="order-2 lg:order-1 grid grid-cols-2 gap-4">
              {[
                { label: "Platform Modules", value: "10", color: "#00D4FF" },
                { label: "AI Agents", value: "10", color: "#8B5CF6" },
                { label: "Integrations", value: "30+", color: "#10D9A0" },
                { label: "Starter Price", value: "$29/mo", color: "#F59E0B" },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="p-5 rounded-xl border border-white/5 bg-[#0F1929] text-center"
                >
                  <div className="text-2xl font-bold mb-1" style={{ color }}>{value}</div>
                  <div className="text-xs text-[#64748B]">{label}</div>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/5 text-[#00D4FF] text-xs font-bold tracking-widest uppercase mb-5">
                Our Flagship Product
              </div>
              <h2 className="text-3xl font-bold text-white leading-tight mb-4">
                Viviz CRM —<br />
                AI-Powered Business Software
              </h2>
              <p className="text-[#64748B] leading-relaxed mb-6">
                Beyond client projects, we build our own products. Viviz CRM is an
                AI-powered Business Operating System for SMBs — combining brand
                building, website creation, CRM, marketing automation, and 10
                autonomous AI agents in a single platform.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#00D4FF] text-[#0B1120] font-semibold text-sm hover:bg-[#00BFEA] transition-colors"
              >
                Explore Viviz CRM <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#64748B] mb-3">
              Industries
            </p>
            <h2 className="text-3xl font-bold text-white">
              We've built for a wide range of industries.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {industries.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="p-5 rounded-2xl border border-white/5 bg-[#0F1929] text-center hover:border-white/10 transition-colors"
              >
                <Icon size={22} className="text-[#475569] mx-auto mb-3" />
                <div className="text-xs font-medium text-[#64748B]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-[#080E1C]/40 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#64748B] mb-3">
              Common questions
            </p>
            <h2 className="text-3xl font-bold text-white">Frequently asked questions</h2>
          </div>
          <dl className="space-y-6">
            {[
              {
                q: "What kind of software does Viviz Technologies build?",
                a: "We build custom web applications, mobile apps (iOS and Android), enterprise software, AI-powered systems, data analytics platforms, and cloud infrastructure. We also develop our own product — Viviz CRM.",
              },
              {
                q: "Where is Viviz Technologies based?",
                a: "We are based in Karur, Tamil Nadu, India — No 47, 1st Floor, Sengunthapuram 3rd Cross Corner, Karur - 639002. Contact us at online@viviz.in or 9344064631 / 9342064631.",
              },
              {
                q: "How do you handle a new project?",
                a: "We start with a 30-minute discovery call to understand your requirements. We then send a detailed proposal covering scope, timeline, and cost. Once agreed, we work in weekly sprints with demos so you always know what's being built.",
              },
              {
                q: "Do you only work with large companies?",
                a: "No. We work with startups, small and medium businesses, and larger enterprises. Our flexible engagement model fits early-stage products that need an MVP as well as established businesses modernising existing systems.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="border-b border-white/5 pb-6">
                <dt className="text-sm font-semibold text-white mb-2">{q}</dt>
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
                Let's build together
              </p>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Have a project in mind?
              </h2>
              <p className="text-[#64748B] text-lg leading-relaxed mb-8">
                Tell us what you want to build. We'll get back to you within one
                business day with a clear plan and honest estimate.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#00D4FF] text-[#0B1120] font-semibold text-sm hover:bg-[#00BFEA] transition-colors"
                >
                  Get in touch <ArrowRight size={15} />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border border-white/10 text-[#94A3B8] font-semibold text-sm hover:border-white/20 hover:text-white transition-colors"
                >
                  Browse services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
