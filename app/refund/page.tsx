import type { Metadata } from "next";
import Link from "next/link";
import { BASE_URL, COMPANY_NAME, COMPANY_EMAIL, COMPANY_ADDRESS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Viviz Technologies Refund and Cancellation Policy — understand our refund terms for IT services and Viviz CRM subscription.",
  alternates: { canonical: `${BASE_URL}/refund` },
  robots: { index: true, follow: true },
};

const EFFECTIVE_DATE = "1 June 2025";
const UPDATED_DATE = "26 May 2026";

export default function RefundPage() {
  return (
    <div>
      {/* Hero */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#00D4FF] mb-4">
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Refund &amp; Cancellation Policy
          </h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-[#64748B]">
            <span>Effective: {EFFECTIVE_DATE}</span>
            <span>Last updated: {UPDATED_DATE}</span>
          </div>
          <p className="mt-5 text-[#94A3B8] leading-relaxed max-w-2xl">
            This policy outlines the refund and cancellation terms for {COMPANY_NAME}'s IT
            services and Viviz CRM software subscription.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Section 1 */}
          <div id="saas-subscriptions">
            <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/5">
              1. Viviz CRM — SaaS Subscription
            </h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-1.5">Monthly subscriptions</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Monthly subscriptions may be cancelled at any time. Cancellation takes effect at
                  the end of the current billing period. We do not provide pro-rated refunds for
                  the unused portion of a monthly billing cycle once payment has been processed.
                  Your account remains active and fully functional until the subscription period ends.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-1.5">Annual subscriptions</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Annual subscriptions may be cancelled within <strong className="text-white">7 days</strong> of
                  the initial purchase date for a full refund. After the 7-day window, annual
                  subscriptions are non-refundable; however, you may cancel to prevent auto-renewal at
                  the end of the annual term. If you cancel an annual subscription after 7 days, your
                  access continues until the end of the paid annual period.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-1.5">Upgrades and downgrades</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  When you upgrade your plan, the price difference is charged immediately on a
                  pro-rated basis for the remainder of your billing cycle. Downgrades take effect at
                  the start of the next billing period. No partial refunds are issued for downgrades
                  mid-cycle.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-1.5">Free trial</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Where a free trial is offered, no payment is charged during the trial period. You
                  may cancel before the trial ends and you will not be billed. If you do not cancel
                  before the trial ends, your selected plan will activate and the first payment will
                  be processed.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div id="custom-projects">
            <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/5">
              2. Custom IT Services and Project Work
            </h2>
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-1.5">Project deposits</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  A 50% deposit is required before project work commences. This deposit covers
                  initial discovery, architecture planning, and resource allocation. The deposit is
                  non-refundable once the project kickoff has taken place and work has commenced.
                  If we are unable to start the project after accepting the deposit (due to a reason
                  on our side), we will refund the deposit in full.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-1.5">Mid-project cancellation</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  If a client cancels a project after work has commenced, payment is due for all
                  work completed up to the cancellation date. We will provide an itemised breakdown
                  of completed work. Any amount paid beyond the value of completed work will be
                  refunded within 14 business days.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-1.5">Milestone-based projects</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  For projects structured around payment milestones, each milestone payment is due
                  upon delivery of that milestone. Milestone payments are non-refundable once the
                  corresponding deliverable has been accepted (or deemed accepted after a 7-day
                  review window without written objection from the client).
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#94A3B8] mb-1.5">Post-delivery disputes</h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  If you believe a deliverable does not meet the agreed specification, you must raise
                  the issue in writing within <strong className="text-white">7 days</strong> of
                  delivery. We will investigate and either fix the defect or provide a written
                  explanation. Disputes raised after this window may not be eligible for refund.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div id="consulting">
            <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/5">
              3. Consulting and Retainer Engagements
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Prepaid consulting hours are valid for 90 days from purchase. Unused hours after 90
              days are forfeited. Monthly retainers may be cancelled with 30 days' written notice.
              Retainer fees for the notice period are non-refundable. Unused hours within a given
              retainer month do not roll over to the next month unless explicitly agreed in writing.
            </p>
          </div>

          {/* Section 4 */}
          <div id="non-refundable">
            <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/5">
              4. Non-Refundable Items
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed mb-4">
              The following are not eligible for refund under any circumstances:
            </p>
            <ul className="space-y-2">
              {[
                "Domain registration fees and third-party hosting costs incurred on your behalf",
                "Third-party software licences, API subscriptions, or platform fees purchased as part of your project",
                "Design assets, stock imagery, or font licences acquired for your project",
                "Bank transfer or payment gateway processing fees",
                "Any services that have been fully delivered and accepted",
                "Work completed before a cancellation notice is received",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#64748B]">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#334155] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Section 5 */}
          <div id="how-to-request">
            <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/5">
              5. How to Request a Refund or Cancellation
            </h2>
            <div className="p-6 rounded-xl border border-white/5 bg-[#0F1929] space-y-4">
              <p className="text-sm text-[#64748B] leading-relaxed">
                To request a refund or cancel a service, send an email to{" "}
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="text-[#00D4FF] hover:underline"
                >
                  {COMPANY_EMAIL}
                </a>{" "}
                with the subject line <strong className="text-white">Refund Request</strong> or{" "}
                <strong className="text-white">Cancellation Request</strong> and include:
              </p>
              <ul className="space-y-2">
                {[
                  "Your full name and company name",
                  "The invoice number or subscription ID",
                  "The service or product the request relates to",
                  "The reason for the refund or cancellation",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#94A3B8]">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#00D4FF]/60 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-[#64748B] leading-relaxed">
                We will acknowledge your request within <strong className="text-white">2 business days</strong> and
                aim to process eligible refunds within <strong className="text-white">7–14 business days</strong>.
                Refunds are issued to the original payment method. Bank transfer timelines depend on
                your bank and are outside our control.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div id="disputes">
            <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/5">
              6. Dispute Resolution
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              If you are unsatisfied with our response to a refund request, please escalate in
              writing to {COMPANY_EMAIL}. We are committed to resolving disputes fairly and
              promptly. If the matter remains unresolved, it will be handled in accordance with the
              dispute resolution clause in our{" "}
              <Link href="/terms" className="text-[#00D4FF] hover:underline">
                Terms of Service
              </Link>
              .
            </p>
          </div>

          {/* Section 7 */}
          <div id="amendments">
            <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/5">
              7. Changes to This Policy
            </h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              We may update this policy from time to time. Significant changes will be communicated
              to active subscribers by email. The policy in effect at the time of your purchase
              governs that transaction.
            </p>
          </div>

          {/* Contact */}
          <div id="contact" className="p-6 rounded-xl border border-white/5 bg-[#0F1929]">
            <h2 className="text-sm font-bold text-white mb-2">Questions?</h2>
            <p className="text-sm text-[#64748B] leading-relaxed">
              Contact us at{" "}
              <a href={`mailto:${COMPANY_EMAIL}`} className="text-[#00D4FF] hover:underline">
                {COMPANY_EMAIL}
              </a>{" "}
              or write to: {COMPANY_NAME}, {COMPANY_ADDRESS}, Tamil Nadu, India.
            </p>
          </div>

          {/* Related links */}
          <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4">
            <Link href="/privacy" className="text-sm text-[#64748B] hover:text-[#00D4FF] transition-colors">
              Privacy Policy →
            </Link>
            <Link href="/terms" className="text-sm text-[#64748B] hover:text-[#00D4FF] transition-colors">
              Terms of Service →
            </Link>
            <Link href="/contact" className="text-sm text-[#64748B] hover:text-[#00D4FF] transition-colors">
              Contact Us →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
