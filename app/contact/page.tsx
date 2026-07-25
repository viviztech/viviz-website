import type { Metadata } from "next";
import { Mail, Link2, X, GitFork, MapPin, Clock, Phone } from "lucide-react";
import JsonLd from "@/components/JsonLd";
import ContactForm from "@/components/ContactForm";
import {
  BASE_URL,
  COMPANY_EMAIL,
  COMPANY_PHONE_1,
  COMPANY_PHONE_2,
  COMPANY_ADDRESS,
} from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact Viviz Technologies — Get in Touch",
  description:
    "Contact Viviz Technologies to discuss AI agent development, Viviz CRM early access, custom SaaS projects, or any other enquiry.",
  alternates: { canonical: `${BASE_URL}/contact` },
  openGraph: {
    title: "Contact Viviz Technologies — Get in Touch",
    description:
      "Contact Viviz Technologies to discuss AI agent development, Viviz CRM early access, custom SaaS projects, or any other enquiry.",
    url: `${BASE_URL}/contact`,
  },
};

const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: `${BASE_URL}/contact`,
  name: "Contact Viviz Technologies",
  description:
    "Contact Viviz Technologies to discuss AI agent development, Viviz CRM early access, custom SaaS projects, or any other enquiry.",
  mainEntity: {
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: COMPANY_PHONE_1,
        contactType: "customer support",
        availableLanguage: "English",
      },
      {
        "@type": "ContactPoint",
        telephone: COMPANY_PHONE_2,
        contactType: "sales",
        availableLanguage: "English",
      },
      {
        "@type": "ContactPoint",
        email: COMPANY_EMAIL,
        contactType: "customer support",
        availableLanguage: "English",
      },
    ],
  },
};

const contactFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I contact Viviz Technologies?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `You can reach Viviz Technologies by email at ${COMPANY_EMAIL}, by phone at ${COMPANY_PHONE_1} or ${COMPANY_PHONE_2}, or by filling out the contact form at ${BASE_URL}/contact. We reply within one business day.`,
      },
    },
    {
      "@type": "Question",
      name: "How quickly does Viviz Technologies respond?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Viviz Technologies typically responds within one business day. After initial contact, we schedule a 30-minute discovery call and follow up with a clear proposal within a few days.",
      },
    },
    {
      "@type": "Question",
      name: "What information should I include when contacting Viviz?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Include your name, email, company name (if applicable), the service you're interested in, and a brief description of your challenge or project. The more context you provide, the more specific our initial response will be.",
      },
    },
  ],
};

export default function ContactPage() {
  return (
    <div>
      <JsonLd data={contactSchema} />
      <JsonLd data={contactFaqSchema} />
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
                        href={`mailto:${COMPANY_EMAIL}`}
                        className="text-sm text-white hover:text-[#00D4FF] transition-colors"
                      >
                        {COMPANY_EMAIL}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-[#8B5CF6]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B] mb-0.5">Phone</div>
                      <div className="flex flex-col gap-0.5">
                        <a href={`tel:${COMPANY_PHONE_1}`} className="text-sm text-white hover:text-[#00D4FF] transition-colors">
                          {COMPANY_PHONE_1}
                        </a>
                        <a href={`tel:${COMPANY_PHONE_2}`} className="text-sm text-white hover:text-[#00D4FF] transition-colors">
                          {COMPANY_PHONE_2}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#10D9A0]/10 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-[#10D9A0]" />
                    </div>
                    <div>
                      <div className="text-xs text-[#64748B] mb-0.5">Address</div>
                      <span className="text-sm text-white leading-relaxed">{COMPANY_ADDRESS}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-[#F59E0B]" />
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
                    href={`mailto:${COMPANY_EMAIL}`}
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
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
