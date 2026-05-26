import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Viviz Technologies — AI-Powered Business Solutions",
  description:
    "Viviz Technologies builds AI-powered products and services that help businesses grow faster. From CRM automation to data science, we bring intelligence to every layer of your business.",
  keywords: [
    "AI CRM",
    "business automation",
    "data science",
    "AI agents",
    "marketing automation",
    "SaaS",
    "Viviz Technologies",
  ],
  authors: [{ name: "Viviz Technologies", url: "https://viviztechnologies.com" }],
  openGraph: {
    title: "Viviz Technologies — AI-Powered Business Solutions",
    description: "Build and grow your business with AI-powered tools.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#0B1120] text-[#F8FAFC]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
