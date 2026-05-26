import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL, COMPANY_NAME, COMPANY_EMAIL, COMPANY_ADDRESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Viviz Technologies Terms of Service — the terms governing use of our website and engagement with our IT services and software products.",
  alternates: { canonical: `${BASE_URL}/terms` },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "1 June 2025";
const UPDATED_DATE = "26 May 2026";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    body: `By accessing or using the ${COMPANY_NAME} website (viviz.in) or engaging us for any services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, please do not use this website or our services. These terms apply to all visitors, clients, and others who access the website.`,
  },
  {
    id: "services",
    title: "2. Services",
    body: `${COMPANY_NAME} provides IT services including custom software development, web and mobile application development, AI and machine learning solutions, data science and analytics, cloud infrastructure and DevOps, UI/UX design, and IT consulting. We also offer Viviz CRM, a SaaS product, under separate subscription terms communicated at the time of purchase. All service engagements are governed by a separate Statement of Work (SOW) or Service Agreement signed between the parties, which takes precedence over these general terms.`,
  },
  {
    id: "use-of-website",
    title: "3. Use of This Website",
    body: `You may use this website for lawful purposes only. You agree not to: (a) use the site in any way that violates applicable Indian or international laws or regulations; (b) transmit unsolicited commercial communications; (c) attempt to gain unauthorised access to any part of the site or its related systems; (d) use automated tools to scrape, crawl, or extract data from the site without our prior written permission; (e) introduce malware, viruses, or other malicious code. We reserve the right to terminate access to any user who violates these terms.`,
  },
  {
    id: "intellectual-property",
    title: "4. Intellectual Property",
    body: `All content on this website — including text, graphics, logos, icons, images, and software code — is the property of ${COMPANY_NAME} or its content suppliers and is protected under Indian copyright law and applicable international treaties. You may not reproduce, distribute, modify, or create derivative works without our express written permission. For client projects: upon full payment of all invoices, ownership of the custom deliverables (source code, designs) specified in the SOW transfers to the client. We retain ownership of any pre-existing tools, libraries, frameworks, and proprietary components used in delivery.`,
  },
  {
    id: "payment",
    title: "5. Payment Terms",
    body: `Payment terms for service engagements are specified in the relevant SOW or proposal. For project-based work, we typically require a 50% deposit before work commences, with the balance due upon delivery or as per a milestone schedule. For SaaS subscriptions (Viviz CRM), billing is monthly or annual as selected at checkout. All prices are in Indian Rupees (INR) and are exclusive of applicable taxes (GST) unless stated otherwise. Invoices are due within 7 days of issue unless otherwise agreed. Late payments may attract interest at 2% per month.`,
  },
  {
    id: "confidentiality",
    title: "6. Confidentiality",
    body: `Both parties agree to keep confidential any proprietary business information shared during a project engagement and not to disclose it to third parties without prior written consent. This obligation survives termination of the engagement. Technical details about client systems and business data shared with us for project purposes will not be used for any purpose other than delivering the agreed services.`,
  },
  {
    id: "warranties",
    title: "7. Warranties and Representations",
    body: `${COMPANY_NAME} warrants that services will be performed with reasonable skill and care in accordance with the agreed specifications. We provide a 30-day bug-fix warranty on delivered software — defects that prevent the software from meeting the agreed specification will be corrected at no additional charge within this period. This warranty does not cover issues caused by client modifications, third-party integrations, or changes in the operating environment after delivery. The website and its content are provided "as is" without warranties of any kind, express or implied.`,
  },
  {
    id: "limitation-of-liability",
    title: "8. Limitation of Liability",
    body: `To the maximum extent permitted by applicable law, ${COMPANY_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of this website or our services. Our total liability to you for any claim arising from a service engagement shall not exceed the total amount paid by you for the specific service giving rise to the claim in the three months preceding the claim. Nothing in these terms limits liability for fraud, death, or personal injury caused by our negligence.`,
  },
  {
    id: "third-party-links",
    title: "9. Third-Party Links",
    body: `This website may contain links to third-party websites. These links are provided for your convenience only. We do not endorse, control, or assume any responsibility for the content, privacy practices, or terms of any third-party website. Visiting linked websites is at your own risk.`,
  },
  {
    id: "termination",
    title: "10. Termination",
    body: `Either party may terminate a service engagement by providing written notice as specified in the applicable SOW. For monthly SaaS subscriptions, either party may cancel with 30 days' written notice. On termination: (a) all outstanding invoices become immediately due; (b) each party must return or destroy confidential information belonging to the other; (c) we will provide a data export of client data held in our SaaS products within 14 days of termination. Sections 4, 6, 7, 8, and 12 survive termination.`,
  },
  {
    id: "amendments",
    title: "11. Amendments",
    body: `We may update these Terms of Service at any time. We will post the revised terms on this page with an updated 'Last updated' date. For significant changes, we will notify active clients by email. Continued use of this website or our services after changes take effect constitutes acceptance of the revised terms.`,
  },
  {
    id: "governing-law",
    title: "12. Governing Law and Disputes",
    body: `These Terms of Service are governed by the laws of India. Any dispute arising out of or in connection with these terms or any service engagement shall first be attempted to be resolved through good-faith negotiation. If unresolved within 30 days, disputes shall be subject to the exclusive jurisdiction of the courts in Karur, Tamil Nadu, India. The United Nations Convention on Contracts for the International Sale of Goods does not apply.`,
  },
  {
    id: "contact",
    title: "13. Contact",
    body: `For questions about these Terms of Service, please contact us at ${COMPANY_EMAIL} or write to: ${COMPANY_NAME}, ${COMPANY_ADDRESS}, Tamil Nadu, India.`,
  },
];

export default function TermsPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#00D4FF] mb-4">
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#64748B]">
            <span>Effective: {EFFECTIVE_DATE}</span>
            <span>Last updated: {UPDATED_DATE}</span>
          </div>
          <p className="mt-5 text-[#94A3B8] leading-relaxed max-w-2xl">
            Please read these terms carefully before using our website or engaging{" "}
            {COMPANY_NAME} for services. By proceeding, you agree to be bound by them.
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
            <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
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
                <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/5">
                  {s.title}
                </h2>
                <p className="text-sm text-[#64748B] leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>

          {/* Related links */}
          <div className="mt-14 pt-8 border-t border-white/5 flex flex-wrap gap-4">
            <Link
              href="/privacy"
              className="text-sm text-[#64748B] hover:text-[#00D4FF] transition-colors"
            >
              Privacy Policy →
            </Link>
            <Link
              href="/refund"
              className="text-sm text-[#64748B] hover:text-[#00D4FF] transition-colors"
            >
              Refund & Cancellation Policy →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
