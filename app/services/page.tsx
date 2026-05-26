import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  Globe,
  Smartphone,
  Brain,
  BarChart3,
  Cloud,
  Palette,
  Lightbulb,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { BASE_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "IT Services — Custom Software, Web, Mobile & AI Development",
  description:
    "Viviz Technologies offers custom software development, web and mobile app development, AI & ML solutions, data science, cloud & DevOps, UI/UX design, and IT consulting from Karur, Tamil Nadu.",
  alternates: { canonical: `${BASE_URL}/services` },
  openGraph: {
    title: "IT Services — Viviz Technologies",
    description:
      "Full-service IT company offering custom software, web & mobile development, AI/ML, data science, cloud infrastructure, and IT consulting.",
    url: `${BASE_URL}/services`,
  },
};

const servicesFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What IT services does Viviz Technologies offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viviz Technologies offers eight core IT services: Custom Software Development, Web Application Development, Mobile App Development (iOS & Android), AI & Machine Learning Solutions, Data Science & Analytics, Cloud & DevOps, UI/UX Design & Branding, and IT Consulting & Strategy.",
      },
    },
    {
      "@type": "Question",
      name: "Does Viviz Technologies build mobile apps?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Viviz Technologies builds iOS and Android mobile applications using React Native and Flutter. We develop consumer apps, enterprise mobile tools, and cross-platform applications with native performance.",
      },
    },
    {
      "@type": "Question",
      name: "What AI and machine learning services does Viviz offer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We build custom AI solutions including predictive models, intelligent automation, natural language processing (NLP), computer vision, recommendation systems, and AI agents using Python, TensorFlow, PyTorch, and LangChain.",
      },
    },
    {
      "@type": "Question",
      name: "How long does a custom software project take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A basic web application MVP typically takes 4–8 weeks. A full-featured platform takes 3–6 months. Mobile apps take 6–12 weeks for an MVP. Timeline depends on scope, integrations, and complexity. We provide a detailed timeline in our proposal after the discovery call.",
      },
    },
    {
      "@type": "Question",
      name: "Does Viviz Technologies provide support after delivery?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We offer post-delivery support, maintenance, and ongoing feature development. Most clients continue working with us after launch for bug fixes, performance improvements, and new features.",
      },
    },
  ],
};

const services = [
  {
    id: "custom-software",
    icon: Code2,
    color: "#00D4FF",
    number: "01",
    title: "Custom Software Development",
    tagline: "Bespoke applications built to your exact requirements",
    desc: "Off-the-shelf software rarely fits perfectly. We design and develop custom applications — internal tools, client-facing platforms, workflow systems, and enterprise software — built specifically for the way your business operates.",
    features: [
      "Requirements analysis and technical scoping",
      "System architecture and database design",
      "Full-stack development (frontend + backend + API)",
      "Third-party integrations and data migrations",
      "Testing, QA, and deployment",
      "Post-launch support and feature development",
    ],
    tech: ["React", "Next.js", "Python", "Node.js", "PostgreSQL", "AWS"],
  },
  {
    id: "web-development",
    icon: Globe,
    color: "#8B5CF6",
    number: "02",
    title: "Web Application Development",
    tagline: "Fast, scalable web apps built with modern technology",
    desc: "We build web applications that perform — from landing pages and marketing sites to complex multi-tenant SaaS platforms. Every project is built with performance, security, and scalability in mind from the start.",
    features: [
      "Single-page applications (SPA) and progressive web apps",
      "Multi-tenant SaaS platform development",
      "E-commerce development and integrations",
      "API development and third-party integrations",
      "Authentication, roles, and permissions systems",
      "SEO-optimised and Core Web Vitals compliant",
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js", "Vercel"],
  },
  {
    id: "mobile-development",
    icon: Smartphone,
    color: "#10D9A0",
    number: "03",
    title: "Mobile App Development",
    tagline: "iOS and Android apps with native performance",
    desc: "We build cross-platform mobile applications using React Native and Flutter that run natively on both iOS and Android. From consumer apps to enterprise mobile tools, we deliver smooth, reliable, and maintainable mobile software.",
    features: [
      "iOS and Android application development",
      "Cross-platform development (React Native / Flutter)",
      "App Store and Google Play submission",
      "Offline-first architecture",
      "Push notifications and real-time features",
      "Integration with device hardware (camera, GPS, biometrics)",
    ],
    tech: ["React Native", "Flutter", "Expo", "Firebase", "TypeScript", "REST APIs"],
  },
  {
    id: "ai-ml",
    icon: Brain,
    color: "#F59E0B",
    number: "04",
    title: "AI & Machine Learning Solutions",
    tagline: "Intelligent systems that automate and predict",
    desc: "We design and build AI-powered features and standalone ML systems. Whether you need a predictive model embedded in your product, an automation agent handling repetitive workflows, or an NLP system processing text — we build it and put it into production.",
    features: [
      "Predictive models (classification, regression, forecasting)",
      "Natural language processing (NLP) and text analysis",
      "Computer vision and image recognition",
      "Recommendation systems",
      "AI agent development (LangChain, LangGraph, Claude API)",
      "Model deployment and MLOps pipeline setup",
    ],
    tech: ["Python", "TensorFlow", "PyTorch", "scikit-learn", "LangChain", "Claude API"],
  },
  {
    id: "data-science",
    icon: BarChart3,
    color: "#EC4899",
    number: "05",
    title: "Data Science & Analytics",
    tagline: "Turn your data into decisions",
    desc: "Most businesses sit on valuable data they can't read clearly. We build the pipelines, models, and dashboards that turn raw data into actionable intelligence — so your team can make faster, better-informed decisions.",
    features: [
      "Business intelligence dashboards",
      "ETL pipeline design and data warehousing",
      "Customer segmentation and RFM analysis",
      "Lead scoring and churn prediction models",
      "Revenue forecasting and demand planning",
      "Embedded analytics inside your product",
    ],
    tech: ["Python", "Pandas", "ClickHouse", "Apache Kafka", "dbt", "Recharts"],
  },
  {
    id: "cloud-devops",
    icon: Cloud,
    color: "#00D4FF",
    number: "06",
    title: "Cloud & DevOps",
    tagline: "Scalable infrastructure and automated deployments",
    desc: "We set up and manage the cloud infrastructure and deployment pipelines that keep your software running reliably. From initial AWS or GCP setup through containerisation, CI/CD automation, and ongoing monitoring.",
    features: [
      "AWS and GCP infrastructure setup and management",
      "Docker containerisation and Kubernetes orchestration",
      "CI/CD pipeline setup (GitHub Actions, GitLab CI)",
      "Infrastructure as Code (Terraform)",
      "Performance monitoring and alerting",
      "Security hardening and compliance configuration",
    ],
    tech: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "GitHub Actions"],
  },
  {
    id: "ui-ux-design",
    icon: Palette,
    color: "#8B5CF6",
    number: "07",
    title: "UI/UX Design & Branding",
    tagline: "Design that works and looks professional",
    desc: "Good software needs good design. We handle the full design process — from user research and wireframes through to pixel-perfect UI and brand identity. Everything is designed in Figma and handed over in a way developers can implement accurately.",
    features: [
      "User research and persona development",
      "Information architecture and user flow mapping",
      "Wireframes and interactive prototypes",
      "UI design and component library creation",
      "Brand identity, logo, and design system",
      "Design-to-code handoff documentation",
    ],
    tech: ["Figma", "Adobe Illustrator", "Framer", "Tailwind CSS", "Storybook"],
  },
  {
    id: "it-consulting",
    icon: Lightbulb,
    color: "#10D9A0",
    number: "08",
    title: "IT Consulting & Strategy",
    tagline: "Technology decisions made with your business goals in mind",
    desc: "Not every problem needs new software — sometimes it needs clearer thinking about technology. We advise businesses on architecture decisions, technology selection, digital transformation roadmaps, and how to get the most from the systems they already have.",
    features: [
      "Technology stack assessment and selection",
      "Legacy system modernisation planning",
      "Digital transformation roadmaps",
      "Architecture review and scalability planning",
      "Proof-of-concept (POC) development",
      "Vendor and platform evaluation",
    ],
    tech: ["Architecture review", "Technical audits", "POC development", "Documentation"],
  },
];

export default function ServicesPage() {
  return (
    <div>
      <JsonLd data={servicesFaqSchema} />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#8B5CF6]/5 blur-[100px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#8B5CF6] mb-5">
              Our Services
            </p>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
              Full-service IT.
              <br />
              <span className="text-[#8B5CF6]">Every discipline covered.</span>
            </h1>
            <p className="text-[#64748B] text-xl leading-relaxed">
              From the first wireframe to the production server — we cover every layer
              of software development so you don't have to co-ordinate multiple vendors.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {services.map(({ id, icon: Icon, color, number, title, tagline, desc, features, tech }) => (
            <div
              key={id}
              id={id}
              className="p-8 rounded-2xl border border-white/5 bg-[#0F1929] hover:border-white/8 transition-colors"
            >
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                {/* Left */}
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-xs font-mono text-[#334155]">{number}</span>
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: `${color}18` }}
                    >
                      <Icon size={22} style={{ color }} />
                    </div>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
                  <p className="text-sm font-medium mb-4" style={{ color }}>{tagline}</p>
                  <p className="text-[#64748B] text-sm leading-relaxed mb-6">{desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {tech.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-[#64748B] border border-white/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right */}
                <div>
                  <h3 className="text-xs font-bold text-[#475569] tracking-widest uppercase mb-4">
                    What's included
                  </h3>
                  <ul className="space-y-3">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <CheckCircle size={15} className="mt-0.5 shrink-0" style={{ color }} />
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

      {/* FAQ */}
      <section className="py-20 border-t border-white/5 bg-[#080E1C]/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#64748B] mb-3">
              Common questions
            </p>
            <h2 className="text-3xl font-bold text-white">Services FAQ</h2>
          </div>
          <dl className="space-y-6">
            {[
              {
                q: "What IT services does Viviz Technologies offer?",
                a: "Eight core services: Custom Software Development, Web Application Development, Mobile App Development (iOS & Android), AI & Machine Learning, Data Science & Analytics, Cloud & DevOps, UI/UX Design & Branding, and IT Consulting & Strategy.",
              },
              {
                q: "How long does a typical project take?",
                a: "A web application MVP: 4–8 weeks. A full-featured platform: 3–6 months. Mobile apps: 6–12 weeks for an MVP. We provide a detailed timeline in our proposal after a discovery call.",
              },
              {
                q: "Do you work with startups?",
                a: "Yes. We work with early-stage startups needing their first product as well as established businesses modernising existing systems. Our engagement model is flexible — from a focused MVP build to a long-term development partnership.",
              },
              {
                q: "Do you provide post-launch support?",
                a: "Yes. Most clients continue working with us after launch for bug fixes, performance improvements, and new features. We offer flexible monthly retainer or project-based support arrangements.",
              },
              {
                q: "Can you work with our in-house team?",
                a: "Absolutely. We frequently work alongside existing in-house developers or other vendors — either taking ownership of specific modules or providing specialised skills (AI, DevOps, mobile) that the internal team doesn't have.",
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
          <div className="border border-white/8 rounded-2xl p-10 bg-[#0F1929]">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white mb-3">
                Not sure which service you need?
              </h2>
              <p className="text-[#64748B] mb-6">
                Tell us what you're trying to achieve. We'll recommend the right
                approach and give you a clear plan — usually within 24 hours.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00D4FF] text-[#0B1120] font-semibold text-sm hover:bg-[#00BFEA] transition-colors"
              >
                Talk to us <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
