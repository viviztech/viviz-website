import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ScanLine, Sparkles, ListChecks, Eye, ShieldCheck, FileText } from "lucide-react";
import { BASE_URL } from "@/lib/config";
import AuditStartForm from "@/components/website-audit/AuditStartForm";
import TaskMap from "@/components/website-audit/TaskMap";
import styles from "@/components/website-audit/audit.module.css";

export const metadata: Metadata = {
  title: "Free Website Audit & Business Growth Plan | Viviz",
  description: "Find website issues and relevant feature opportunities. Get an evidence-based audit, a tailored Growth Stack and a practical improvement plan from Viviz. No email required.",
  alternates: { canonical: `${BASE_URL}/website-audit` },
  openGraph: { title: "What should your website do better? | Viviz Website Audit", description: "A free website audit with evidence, relevant feature opportunities and a practical plan for what to fix next.", url: `${BASE_URL}/website-audit` },
};

const checks = [
  { icon: ScanLine, title: "Website foundations", body: "Inspect public-page technical signals, search metadata, content structure and observed accessibility issues. See the pages behind every finding." },
  { icon: Sparkles, title: "Features with a purpose", body: "Explore booking, enquiry handling, trust content and other capabilities when the evidence or your business answers support them." },
  { icon: ListChecks, title: "A plan you can act on", body: "Get a suggested sequence with effort, prerequisites and ways to verify the work. Choose the improvements you want to discuss." },
];

export default function WebsiteAuditPage() {
  return <div className={styles.root}>
    <section className={styles.hero}><div className={`${styles.wrap} ${styles.heroGrid}`}>
      <div><p className={styles.eyebrow}>Free website audit · by Viviz</p><h1>What should your website <span>do better?</span></h1><p className={styles.intro}>Find the gaps holding your website back. Turn public-page evidence and your business goals into a clear plan for what to fix, improve and build next.</p><div className={styles.inlineList}><span><Check size={14} aria-hidden="true" /> No email gate</span><span><Check size={14} aria-hidden="true" /> Up to 25 public pages</span><span><Check size={14} aria-hidden="true" /> Your choice of next steps</span></div><Link href="/website-audit/example" className={styles.secondary}><FileText size={15} aria-hidden="true" /> Explore a sample report <ArrowRight size={14} aria-hidden="true" /></Link><p className={styles.hint} style={{ marginTop: 14 }}>See the format before you start. Sample content is clearly labelled.</p></div>
      <AuditStartForm />
    </div></section>
    <div className={styles.wrap}>
      <section className={styles.section} aria-label="Our approach"><TaskMap /></section>
      <section className={styles.section}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>From evidence to action</p><h2>More useful than a list of errors.</h2></div><p>Your audit combines practical website checks with relevant business opportunities. Each suggestion explains what supports it and what still needs checking.</p></div><div className={styles.threeGrid}>{checks.map(({ icon: Icon, title, body }) => <article className={styles.card} key={title}><Icon className={styles.cardIcon} size={24} aria-hidden="true" /><h3>{title}</h3><p>{body}</p></article>)}</div></section>
      <section className={styles.section}><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Your recommended Growth Stack</p><h2>The right next step for your business.</h2></div><p>A service company and a local appointment business need different things. Optional answers help us recognise your existing tools and avoid unnecessary additions.</p></div><div className={styles.threeGrid}><article className={styles.card}><span className={styles.badge}>Fix first</span><h3 style={{ marginTop: 17 }}>Remove customer blockers</h3><p>Address supported problems in the public path, from unclear contact routes to missing page fundamentals.</p></article><article className={styles.card}><span className={`${styles.badge} ${styles.purple}`}>Improve next</span><h3 style={{ marginTop: 17 }}>Make useful capabilities work</h3><p>Consider changes that serve your main visitor task. Check whether an existing tool already meets the need.</p></article><article className={styles.card}><span className={`${styles.badge} ${styles.amber}`}>Consider later</span><h3 style={{ marginTop: 17 }}>Validate before investing</h3><p>Keep optional ideas for later, with prerequisites and tradeoffs. Including an idea in an enquiry does not buy or activate it.</p></article></div></section>
      <div className={styles.scope}><div><h3><Eye size={17} aria-hidden="true" style={{ display: "inline", marginRight: 8, color: "#57dcff" }} /> Clear about what we checked</h3><p>We report page coverage, evidence dates and collection limits. Performance is shown only when measured, with lab runs separate from real-user field data. Automated checks do not establish full accessibility compliance.</p></div><div><h3><ShieldCheck size={17} aria-hidden="true" style={{ display: "inline", marginRight: 8, color: "#57dcff" }} /> You stay in control</h3><p>We inspect public pages without signing in, submitting forms or changing the website. Download your report, update your business context, or delete it. Contacting Viviz is a separate choice.</p></div></div>
      <section className={styles.section}><div className={styles.heading}><h2>Before you begin</h2></div>
        <details className={styles.faq}><summary>Does the audit check the complete website?</summary><p>The free audit inspects up to 25 discovered public pages on the submitted website. The report identifies pages checked, restrictions and unavailable checks. Authenticated areas, completed purchases, internal processes and exhaustive accessibility testing need a deeper review.</p></details>
        <details className={styles.faq}><summary>Will it tell me which trending features I am missing?</summary><p>It suggests relevant capabilities based on the observed website and your optional business answers. A feature is not necessary simply because it is popular. “Not observed” means we did not find it on checked pages; it does not establish that your business lacks it. The launch recommendations use a controlled rule catalog rather than a live trend feed.</p></details>
        <details className={styles.faq}><summary>Which businesses get the most tailored recommendations?</summary><p>The initial specialist assessments cover B2B/professional services and local-service businesses. Other website types receive general website checks and conservative recommendations. You can correct the business context in your report.</p></details>
        <details className={styles.faq}><summary>Can I use my report without speaking to Viviz?</summary><p>Yes. No registration or email is needed to read the report or download its PDF. Reports are private to the browser that created them for 30 days. You can separately select improvements and ask Viviz for implementation help.</p></details>
      </section>
    </div>
  </div>;
}
