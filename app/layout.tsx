import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import {
  BASE_URL,
  COMPANY_NAME,
  COMPANY_EMAIL,
  COMPANY_PHONE_1,
  COMPANY_ADDRESS,
  COMPANY_FOUNDED,
  COMPANY_DESCRIPTION,
} from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Viviz Technologies — AI-Powered Business Software",
    template: "%s | Viviz Technologies",
  },
  description: COMPANY_DESCRIPTION,
  keywords: [
    "AI CRM",
    "business automation software",
    "AI agent development",
    "marketing automation",
    "data science for small business",
    "custom SaaS development",
    "Viviz Technologies",
    "Viviz CRM",
    "SMB software",
    "AI business operating system",
  ],
  authors: [{ name: COMPANY_NAME, url: BASE_URL }],
  creator: COMPANY_NAME,
  publisher: COMPANY_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: COMPANY_NAME,
    title: "Viviz Technologies — AI-Powered Business Software",
    description: COMPANY_DESCRIPTION,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Viviz Technologies — AI-Powered Business Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@viviztechnologies",
    creator: "@viviztechnologies",
    title: "Viviz Technologies — AI-Powered Business Software",
    description: COMPANY_DESCRIPTION,
    images: [`${BASE_URL}/og-image.png`],
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_URL}/#organization`,
  name: COMPANY_NAME,
  url: BASE_URL,
  email: COMPANY_EMAIL,
  telephone: COMPANY_PHONE_1,
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY_ADDRESS,
    addressLocality: "Karur",
    postalCode: "639002",
    addressCountry: "IN",
  },
  description: COMPANY_DESCRIPTION,
  foundingDate: COMPANY_FOUNDED,
  knowsAbout: [
    "Artificial Intelligence",
    "CRM Software",
    "Marketing Automation",
    "Data Science",
    "SaaS Development",
    "AI Agents",
    "Business Intelligence",
  ],
  sameAs: [
    "https://twitter.com/viviztechnologies",
    "https://linkedin.com/company/viviz-technologies",
    "https://github.com/viviz-technologies",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: COMPANY_EMAIL,
    contactType: "customer service",
    availableLanguage: "English",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_URL}/#website`,
  url: BASE_URL,
  name: COMPANY_NAME,
  description: COMPANY_DESCRIPTION,
  publisher: { "@id": `${BASE_URL}/#organization` },
  inLanguage: "en-US",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#0B1120] text-[#F8FAFC]">
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
