import type { Metadata } from "next";
import { BASE_URL } from "@/lib/config";
import { SAMPLE_AUDIT } from "@/lib/website-audit/sample";
import AuditReport from "@/components/website-audit/AuditReport";

export const metadata: Metadata = {
  title: "Sample Website Audit & Growth Stack | Viviz",
  description: "Explore an illustrative Viviz website audit, including public-page findings, business context and a recommended Growth Stack.",
  alternates: { canonical: `${BASE_URL}/website-audit/example` },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  openGraph: { title: "Sample Website Audit | Viviz", description: "An illustrative website improvement plan and Growth Stack.", url: `${BASE_URL}/website-audit/example` },
};

export default function SampleAuditPage() { return <AuditReport id={SAMPLE_AUDIT.id} initialAudit={SAMPLE_AUDIT} demo />; }
