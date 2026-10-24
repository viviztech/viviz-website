import type { Metadata } from "next";
import { BASE_URL } from "@/lib/config";
import AuditReport from "@/components/website-audit/AuditReport";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Private Website Audit | Viviz",
    description: "Your private website assessment and recommended improvement plan.",
    alternates: { canonical: `${BASE_URL}/website-audit/${encodeURIComponent(id)}` },
    robots: { index: false, follow: false, noarchive: true, nocache: true, googleBot: { index: false, follow: false, noarchive: true, noimageindex: true } },
    openGraph: { title: "Private Website Audit | Viviz", description: "A browser-private website assessment.", url: `${BASE_URL}/website-audit/${encodeURIComponent(id)}` },
  };
}

export default async function PrivateAuditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuditReport id={id} />;
}
