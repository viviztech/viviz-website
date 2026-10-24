import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  Gauge,
  Globe2,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import JsonLd from "@/components/JsonLd";
import { BASE_URL, COMPANY_NAME, COMPANY_PHONE_1 } from "@/lib/config";
import type { WebsitePackageId } from "@/lib/website-packages";

export const metadata: Metadata = {
  title: "Website Design Packages for Businesses",
  description:
    "Professional website design packages from Viviz Technologies. Choose a starter website, business growth website, or e-commerce store from ₹9,999.",
  alternates: { canonical: `${BASE_URL}/products` },
  openGraph: {
    title: "Website Design Packages | Viviz Technologies",
    description:
      "Custom, mobile-friendly business websites and e-commerce stores with clear scope and pricing from ₹9,999.",
    url: `${BASE_URL}/products`,
  },
};

const whatsappHref = `https://wa.me/91${COMPANY_PHONE_1}?text=${encodeURIComponent(
  "Hi Viviz Technologies, I would like a quote for a business website."
)}`;

const packages = [
  {
    id: "starter" as WebsitePackageId,
    name: "Starter Website",
    price: "₹9,999",
    audience: "Small businesses and professionals",
    summary: "A polished online presence with everything customers need to find and contact you.",
    icon: Globe2,
    accent: "#00D4FF",
    features: [
      "Up to 5 pages",
      "Customised standard layout",
      "Mobile-friendly design",
      "WhatsApp click-to-chat",
      "One contact form",
      "Basic SEO and analytics",
      "Domain, hosting and SSL connection",
      "1 design revision",
      "15 days bug support",
    ],
  },
  {
    id: "growth" as WebsitePackageId,
    name: "Business Growth",
    price: "₹24,999",
    audience: "Businesses focused on enquiries",
    summary: "A brand-led website designed to turn visits into qualified conversations.",
    icon: Gauge,
    accent: "#8B5CF6",
    popular: true,
    features: [
      "Up to 10 pages",
      "Custom brand-focused design",
      "Mobile-friendly design",
      "WhatsApp click-to-chat",
      "Up to 3 enquiry forms",
      "Page and enquiry admin panel",
      "Sitemap, indexing and analytics",
      "Enquiry conversion tracking",
      "2 design revisions",
      "30 days bug support",
    ],
  },
  {
    id: "ecommerce" as WebsitePackageId,
    name: "E-commerce",
    price: "₹44,999",
    audience: "Businesses selling online",
    summary: "A complete branded storefront for managing products, orders and payments.",
    icon: ShoppingBag,
    accent: "#10D9A0",
    features: [
      "Up to 8 content pages plus store",
      "Branded storefront",
      "Up to 25 initial products",
      "Product and order admin panel",
      "Cart and checkout",
      "One payment gateway integration",
      "Product-page SEO foundation",
      "Purchase conversion tracking",
      "2 design revisions",
      "30 days bug support",
    ],
  },
];

const comparison = [
  ["Website scope", "Up to 5 pages", "Up to 10 pages", "8 pages + store"],
  ["Design", "Customised layout", "Brand-focused", "Branded storefront"],
  ["Mobile-friendly", "Included", "Included", "Included"],
  ["WhatsApp chat", "Included", "Included", "Included"],
  ["Forms", "1 contact form", "Up to 3 forms", "Contact + order emails"],
  ["Admin panel", "—", "Pages + enquiries", "Products + orders"],
  ["Product uploads", "—", "—", "Up to 25"],
  ["Cart and checkout", "—", "—", "Included"],
  ["Payment gateway", "—", "—", "1 integration"],
  ["SEO foundation", "Titles + descriptions", "Plus sitemap + indexing", "Plus product SEO"],
  ["Analytics", "Basic setup", "Enquiry tracking", "Purchase tracking"],
  ["Revision rounds", "1", "2", "2"],
  ["Bug support", "15 days", "30 days", "30 days"],
];

const upgrades = [
  "AI assistant",
  "CRM integration",
  "WhatsApp API automation",
  "Additional pages",
  "Product uploads",
  "Copywriting",
  "Business email",
  "Multilingual content",
  "Ongoing maintenance",
];

const expectations = [
  "Final pricing is confirmed after we review your exact requirements.",
  "You provide approved text, logos, product details and images; content creation is available separately.",
  "Domain, hosting, email, paid licences and third-party subscriptions are charged separately.",
  "Existing domain and hosting can be used when technically compatible; SSL depends on hosting support.",
  "Payment gateway approval and transaction charges are handled by the payment provider.",
  "SEO covers initial setup; ongoing SEO and advertising are separate services.",
  "Each revision round is one consolidated set of changes within the agreed scope.",
  "Post-launch support covers bugs in delivered work; new features and updates are quoted separately.",
  "Delivery dates and applicable taxes are confirmed in your quotation.",
];

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Website Design and Development",
  provider: { "@type": "Organization", name: COMPANY_NAME, url: BASE_URL },
  areaServed: "IN",
  description: "Professional website design and development for small businesses, growing companies and online stores.",
  offers: packages.map((item) => ({
    "@type": "Offer",
    name: item.name,
    price: item.price.replace(/[^0-9]/g, ""),
    priceCurrency: "INR",
    url: `${BASE_URL}/products`,
  })),
};

export default function ProductsPage() {
  return (
    <div className="overflow-hidden">
      <JsonLd data={serviceSchema} />

      <section className="relative border-b border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute -top-32 right-0 h-[520px] w-[520px] rounded-full bg-[#8B5CF6]/10 blur-[120px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid lg:grid-cols-[1.05fr_.95fr] gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase text-[#00D4FF] mb-6">
              <span className="h-px w-8 bg-[#00D4FF]" /> Website design packages
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-[-0.045em] text-white leading-[1.02] max-w-3xl">
              A website built to move your business <span className="text-[#00D4FF]">forward.</span>
            </h1>
            <p className="mt-6 text-lg text-[#94A3B8] leading-relaxed max-w-xl">
              A professional online presence, a clearer offer, and an easier way for customers to connect—with scope and pricing you can understand.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <a href={whatsappHref} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#00D4FF] text-[#07111F] font-bold text-sm hover:bg-[#63E5FF] transition-colors">
                <MessageCircle size={17} /> Get a personalised quote
              </a>
              <Link href="#packages" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
                Compare packages <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="relative max-w-xl lg:ml-auto w-full">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-[#00D4FF]/15 to-[#8B5CF6]/10 blur-2xl" />
            <div className="relative rounded-2xl border border-white/10 bg-[#0F1929]/95 shadow-2xl shadow-black/40 overflow-hidden">
              <div className="h-11 border-b border-white/10 flex items-center gap-2 px-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B]" /><span className="w-2.5 h-2.5 rounded-full bg-[#FFD166]" /><span className="w-2.5 h-2.5 rounded-full bg-[#10D9A0]" />
                <div className="ml-3 h-6 flex-1 rounded-md bg-white/5 px-3 flex items-center text-[10px] text-[#64748B]">yourbusiness.in</div>
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-10"><div className="h-3 w-24 rounded-full bg-white/15" /><div className="flex gap-2"><span className="h-2 w-10 rounded bg-white/10"/><span className="h-2 w-10 rounded bg-white/10"/><span className="h-2 w-10 rounded bg-white/10"/></div></div>
                <div className="grid grid-cols-[1.2fr_.8fr] gap-6 items-center">
                  <div><div className="h-2 w-20 rounded bg-[#00D4FF]/60 mb-4"/><div className="h-5 w-full rounded bg-white/85 mb-2"/><div className="h-5 w-4/5 rounded bg-white/85 mb-5"/><div className="space-y-2"><div className="h-2 w-full rounded bg-white/10"/><div className="h-2 w-5/6 rounded bg-white/10"/></div><div className="mt-6 h-9 w-32 rounded-lg bg-[#00D4FF]"/></div>
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-[#00D4FF]/25 via-[#8B5CF6]/20 to-[#10D9A0]/15 border border-white/10 flex items-center justify-center"><Code2 className="text-white/70" size={42}/></div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-9"><div className="h-16 rounded-xl bg-white/5 border border-white/5"/><div className="h-16 rounded-xl bg-white/5 border border-white/5"/><div className="h-16 rounded-xl bg-white/5 border border-white/5"/></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 px-4 py-3 rounded-xl border border-[#10D9A0]/20 bg-[#0B1120] shadow-xl flex items-center gap-3">
              <CheckCircle2 className="text-[#10D9A0]" size={20}/><div><p className="text-[10px] uppercase tracking-widest text-[#64748B]">Every package</p><p className="text-xs font-semibold text-white">Mobile-ready by default</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="packages" className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#00D4FF] mb-3">Choose your starting point</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Three scopes. One standard of care.</h2>
            <p className="mt-4 text-[#64748B] leading-relaxed">Start with the package closest to your goal. We confirm the final scope and quote after a short requirements review.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6 items-stretch">
            {packages.map(({ id, name, price, audience, summary, icon: Icon, accent, popular, features }) => (
              <article key={name} className={`relative flex flex-col rounded-2xl border p-7 ${popular ? "border-[#8B5CF6]/50 bg-gradient-to-b from-[#8B5CF6]/10 to-[#0F1929] lg:-translate-y-3" : "border-white/7 bg-[#0F1929]"}`}>
                {popular && <span className="absolute -top-3 left-7 px-3 py-1 rounded-full bg-[#8B5CF6] text-white text-[10px] font-bold tracking-widest uppercase">Most versatile</span>}
                <div className="flex items-center justify-between mb-7"><div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}18`, color: accent }}><Icon size={21}/></div><span className="text-[10px] font-semibold tracking-widest uppercase text-[#64748B]">Starting at</span></div>
                <h3 className="text-xl font-bold text-white">{name}</h3>
                <p className="text-xs mt-1" style={{ color: accent }}>{audience}</p>
                <div className="text-4xl font-bold text-white tracking-tight mt-5">{price}</div>
                <p className="text-sm text-[#94A3B8] leading-relaxed mt-4 min-h-16">{summary}</p>
                <div className="h-px bg-white/7 my-6" />
                <ul className="space-y-3 flex-1">
                  {features.map((feature) => <li key={feature} className="flex gap-3 text-sm text-[#CBD5E1]"><Check size={15} className="shrink-0 mt-0.5" style={{ color: accent }}/><span>{feature}</span></li>)}
                </ul>
                <div className="mt-8 grid grid-cols-2 gap-2.5">
                  <Link href={`/pay?package=${id}`} className="inline-flex justify-center items-center gap-2 py-3 rounded-xl text-[#07111F] text-sm font-bold transition-colors" style={{ backgroundColor: accent }}>Pay now</Link>
                  <a href={whatsappHref} className="inline-flex justify-center items-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors">Ask first<ArrowRight size={14}/></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#080E1C]/60 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10"><div><p className="text-xs font-bold tracking-[0.2em] uppercase text-[#10D9A0] mb-3">Side-by-side</p><h2 className="text-3xl font-bold text-white">Compare every package</h2></div><p className="text-sm text-[#64748B] max-w-md">All packages include responsive design, WhatsApp chat, domain and hosting connection, and SSL configuration where supported.</p></div>
          <div className="overflow-x-auto rounded-2xl border border-white/8 bg-[#0F1929]">
            <table className="w-full min-w-[760px] text-left">
              <thead><tr className="border-b border-white/10"><th className="p-5 text-xs uppercase tracking-widest text-[#64748B] font-semibold">Feature</th>{packages.map((item)=><th key={item.name} className="p-5 text-sm font-bold text-white">{item.name}<span className="block mt-1 text-lg" style={{color:item.accent}}>{item.price}</span></th>)}</tr></thead>
              <tbody>{comparison.map(([feature,...values],row)=><tr key={feature} className={row%2 ? "bg-white/[0.018]" : ""}><th className="px-5 py-3.5 text-xs font-semibold text-[#CBD5E1] border-r border-white/5">{feature}</th>{values.map((value,index)=><td key={`${feature}-${packages[index].name}`} className="px-5 py-3.5 text-xs text-[#94A3B8] border-r last:border-r-0 border-white/5">{value === "Included" ? <span className="inline-flex items-center gap-1.5 text-[#10D9A0]"><Check size={13}/>Included</span> : value}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-white/8 bg-[#0F1929] p-8">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center mb-6"><Sparkles size={20}/></div>
            <h2 className="text-2xl font-bold text-white">Optional upgrades</h2><p className="text-sm text-[#64748B] mt-2 mb-7">Add only what your workflow needs. Each upgrade is quoted separately.</p>
            <div className="flex flex-wrap gap-2.5">{upgrades.map(item=><span key={item} className="px-3 py-2 rounded-lg border border-white/8 bg-white/[0.025] text-xs text-[#CBD5E1]">{item}</span>)}</div>
          </div>
          <div className="rounded-2xl border border-white/8 bg-[#0F1929] p-8">
            <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] flex items-center justify-center mb-6"><RefreshCw size={20}/></div>
            <h2 className="text-2xl font-bold text-white">Already have a website?</h2><p className="text-[#94A3B8] leading-relaxed mt-3">Refresh the design, improve mobile usability, or add features without starting over. We quote redesigns after reviewing your existing website and priorities.</p>
            <Link href="/website-audit" className="inline-flex items-center gap-2 text-sm font-semibold text-[#57DCFF] mt-7 hover:text-white transition-colors">Start a free website audit <ArrowRight size={15} aria-hidden="true" /></Link>
            <p className="text-xs leading-relaxed text-[#A7B6CA] mt-3">See the findings and relevant feature opportunities before deciding what to change. No email required.</p>
          </div>
        </div>
      </section>

      <section className="pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-10 lg:gap-16 border-t border-white/8 pt-16">
            <div><p className="text-xs font-bold tracking-[0.2em] uppercase text-[#64748B] mb-3">Before we begin</p><h2 className="text-3xl font-bold text-white">What to expect</h2><p className="text-sm text-[#64748B] leading-relaxed mt-4">Clear inputs make for a smoother build. These details keep scope, ownership and costs transparent.</p></div>
            <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-5">{expectations.map((item,index)=><li key={item} className="flex gap-3 text-sm text-[#94A3B8] leading-relaxed"><span className="text-[10px] font-bold text-[#00D4FF] mt-1">{String(index+1).padStart(2,"0")}</span><span>{item}</span></li>)}</ol>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#00D4FF]/20 bg-[#0E1B2D] p-8 sm:p-12 lg:p-14">
            <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#00D4FF]/10 blur-[90px]"/><div className="relative max-w-3xl"><p className="text-xs font-bold tracking-[0.2em] uppercase text-[#10D9A0] mb-4">Let&apos;s build your business website</p><h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Tell us your business name, website type and must-have features.</h2><p className="mt-4 text-[#94A3B8]">We&apos;ll review your needs and send a personalised scope and quotation.</p><a href={whatsappHref} className="mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#10D9A0] text-[#071A16] font-bold text-sm hover:bg-[#69E8C1] transition-colors"><MessageCircle size={17}/>WhatsApp {COMPANY_PHONE_1}</a></div>
          </div>
        </div>
      </section>
    </div>
  );
}
