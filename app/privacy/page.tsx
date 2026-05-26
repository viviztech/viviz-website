import type { Metadata } from "next";
import { BASE_URL, COMPANY_NAME, COMPANY_EMAIL, COMPANY_ADDRESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Viviz Technologies Privacy Policy — how we collect, use, and protect your personal information.",
  alternates: { canonical: `${BASE_URL}/privacy` },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "1 June 2025";
const UPDATED_DATE = "26 May 2026";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        sub: "Information you provide directly",
        body: "When you fill in our contact form or reach out to us by email or phone, we collect your name, email address, phone number (if provided), company name (if provided), and the message content. We do not collect payment card details through this website.",
      },
      {
        sub: "Information collected automatically",
        body: "When you visit our website, our hosting provider (Vercel) may collect standard server log data such as your IP address, browser type, operating system, referring URL, and the pages you visit. This data is used solely for security monitoring and performance analysis and is not linked to your identity.",
      },
      {
        sub: "Cookies",
        body: "Our website uses only essential functional cookies required for the site to operate. We do not use advertising cookies or cross-site tracking cookies. You can disable cookies in your browser settings; this will not affect your ability to use the site.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      {
        sub: "To respond to enquiries",
        body: "Contact form submissions are sent to our team via Resend (our email delivery provider). We use the information you submit solely to respond to your enquiry and to follow up if needed.",
      },
      {
        sub: "To improve our services",
        body: "Aggregated, anonymised website usage data helps us understand how visitors interact with our site so we can improve content and user experience. No individual is identified in this analysis.",
      },
      {
        sub: "To comply with legal obligations",
        body: "We may process or retain your information where required by Indian law, including the Information Technology Act 2000 and applicable rules.",
      },
    ],
  },
  {
    id: "data-sharing",
    title: "3. Data Sharing and Third Parties",
    content: [
      {
        sub: "We do not sell your data",
        body: "We never sell, rent, or trade your personal information to third parties for marketing purposes.",
      },
      {
        sub: "Service providers",
        body: "We share data only with the following sub-processors who help us operate this website: (a) Vercel Inc. — website hosting and CDN, (b) Resend Inc. — transactional email delivery for contact form submissions. Both providers process data under their own privacy policies and GDPR/applicable data protection frameworks.",
      },
      {
        sub: "Legal disclosures",
        body: "We may disclose your information if required to do so by a court order, government authority, or applicable law, or to protect the rights, property, or safety of Viviz Technologies, our clients, or others.",
      },
    ],
  },
  {
    id: "data-retention",
    title: "4. Data Retention",
    content: [
      {
        sub: "Contact form data",
        body: "Emails received from contact form submissions are retained in our business email inbox for a maximum of 24 months, after which they are deleted unless an ongoing client relationship exists.",
      },
      {
        sub: "Server logs",
        body: "Vercel's server logs are retained for up to 30 days and then automatically purged.",
      },
    ],
  },
  {
    id: "your-rights",
    title: "5. Your Rights",
    content: [
      {
        sub: "Access and correction",
        body: "You have the right to request a copy of the personal data we hold about you and to ask us to correct any inaccuracies.",
      },
      {
        sub: "Deletion",
        body: "You may request that we delete your personal data at any time. We will comply within 30 days unless we are required to retain it by law.",
      },
      {
        sub: "How to exercise your rights",
        body: `Send a written request to ${COMPANY_EMAIL} with the subject line "Privacy Request". We will respond within 15 business days.`,
      },
    ],
  },
  {
    id: "data-security",
    title: "6. Data Security",
    content: [
      {
        sub: "",
        body: "We implement appropriate technical and organisational measures to protect your information against unauthorised access, loss, or disclosure. Our website is served over HTTPS. However, no transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
      },
    ],
  },
  {
    id: "children",
    title: "7. Children's Privacy",
    content: [
      {
        sub: "",
        body: "Our website and services are not directed to individuals under the age of 18. We do not knowingly collect personal data from minors. If you believe we have inadvertently collected such information, please contact us immediately.",
      },
    ],
  },
  {
    id: "changes",
    title: "8. Changes to This Policy",
    content: [
      {
        sub: "",
        body: "We may update this Privacy Policy from time to time. When we do, we will revise the 'Last updated' date at the top of this page. Continued use of our website after changes are posted constitutes your acceptance of the revised policy.",
      },
    ],
  },
  {
    id: "contact",
    title: "9. Contact Us",
    content: [
      {
        sub: "",
        body: `For privacy-related questions or requests, please contact us at ${COMPANY_EMAIL} or write to us at: ${COMPANY_NAME}, ${COMPANY_ADDRESS}, Tamil Nadu, India.`,
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#00D4FF] mb-4">
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#64748B]">
            <span>Effective: {EFFECTIVE_DATE}</span>
            <span>Last updated: {UPDATED_DATE}</span>
          </div>
          <p className="mt-5 text-[#94A3B8] leading-relaxed max-w-2xl">
            This policy explains what personal information {COMPANY_NAME} collects when you use
            this website, how we use it, and what rights you have over your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* TOC */}
          <div className="mb-12 p-6 rounded-xl border border-white/5 bg-[#0F1929]">
            <h2 className="text-xs font-bold tracking-widest uppercase text-[#475569] mb-4">
              Contents
            </h2>
            <ol className="space-y-1.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-[#64748B] hover:text-[#00D4FF] transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((s) => (
              <div key={s.id} id={s.id}>
                <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/5">
                  {s.title}
                </h2>
                <div className="space-y-4">
                  {s.content.map((c, i) => (
                    <div key={i}>
                      {c.sub && (
                        <h3 className="text-sm font-semibold text-[#94A3B8] mb-1.5">{c.sub}</h3>
                      )}
                      <p className="text-sm text-[#64748B] leading-relaxed">{c.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-14 pt-8 border-t border-white/5">
            <p className="text-xs text-[#475569] leading-relaxed">
              This Privacy Policy is governed by the laws of India. Any disputes arising from this
              policy shall be subject to the exclusive jurisdiction of the courts in Karur, Tamil
              Nadu, India.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
