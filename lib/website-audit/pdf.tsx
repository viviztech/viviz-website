import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import { toCustomerAudit } from "./customer-report";
import type { AuditView, Confidence } from "./types";

const styles = StyleSheet.create({
  page: { padding: 38, paddingBottom: 50, fontFamily: "Helvetica", fontSize: 10, color: "#172033", lineHeight: 1.6 },
  eyebrow: { fontSize: 9, color: "#087891", marginBottom: 9, letterSpacing: 1.3 },
  title: { fontSize: 26, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  heading: { fontSize: 16, fontFamily: "Helvetica-Bold", marginTop: 22, marginBottom: 10 },
  subheading: { fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  label: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#345067", marginTop: 7 },
  muted: { color: "#526077", fontSize: 8 },
  paragraph: { marginBottom: 8 },
  summary: { padding: 17, borderLeftWidth: 3, borderLeftColor: "#087891", backgroundColor: "#EDF7FA", marginTop: 16, marginBottom: 8 },
  card: { padding: 14, backgroundColor: "#F3F7FA", borderRadius: 4, marginBottom: 11 },
  idea: { padding: 14, backgroundColor: "#F5F2FA", borderRadius: 4, marginBottom: 11 },
  link: { fontSize: 8, color: "#087891", marginTop: 4 },
  footer: { position: "absolute", bottom: 18, left: 38, width: 500, height: 20, fontSize: 7, lineHeight: 1.3, color: "#65748B" },
});
const priorities = { high: "Start here", medium: "Improve next", low: "When you are ready", info: "Worth reviewing" };
const sequences = { fix_first: "Start here", improve_next: "Improve next", consider_later: "Consider later" };
const confidence: Record<Confidence, string> = { high: "Clear from this review", medium: "Worth checking", low: "Needs your confirmation" };

// Core Helvetica fonts cannot represent every scraped Unicode character.
function printable(value: string): string {
  return value.normalize("NFKD").replace(/[\u2010-\u2015]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[^\x20-\x7e\n\r]/g, "");
}
function PageLinks({ pages }: { pages: string[] }) {
  const links = [...new Set(pages)].filter(value => {
    try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
  });
  return links.length ? <View><Text style={styles.label}>Where we looked</Text>{links.slice(0, 4).map(url => <Link key={url} src={url} style={styles.link}>{printable(url)}</Link>)}</View> : null;
}

export function AuditPdfDocument({ audit }: { audit: AuditView }) {
  const customer = toCustomerAudit(audit);
  const report = customer.report!;
  const selected = report.improvements.filter(item => customer.decisions[item.id] === "included");
  const additions = selected.length ? selected : report.improvements.filter(item => item.level !== "not_needed_now");
  return <Document title={`Your website improvement plan - ${customer.hostname}`} author="Viviz Technologies" subject="A clear plan for improving your website">
    <Page size="A4" style={styles.page}>
      <View style={styles.footer} fixed><Text>Private website improvement plan - Viviz Technologies</Text></View>
      <Text style={styles.eyebrow}>VIVIZ TECHNOLOGIES / YOUR WEBSITE IMPROVEMENT PLAN</Text>
      <Text style={styles.title}>{printable(customer.hostname)}</Text>
      <Text style={styles.muted}>{customer.progress.checked} public pages reviewed | Prepared {new Date(customer.updatedAt).toISOString().slice(0, 10)} | {report.analysisMode === "ai_assisted" ? "AI-assisted review" : "Website review"}</Text>
      {customer.status === "partial" ? <Text style={[styles.muted, { marginTop: 7 }]}>We could review part of your website. Some pages or checks were unavailable.</Text> : null}
      <View style={styles.summary}><Text style={styles.subheading}>What this means for your business</Text><Text>{printable(report.summary)}</Text></View>
      <Text style={styles.heading}>The business behind this plan</Text>
      <Text style={styles.paragraph}>{printable(report.businessContext)}</Text>
      {report.strengths.length ? <><Text style={styles.heading}>A good starting point</Text>{report.strengths.map((strength, index) => <Text key={index} style={styles.paragraph}>- {printable(strength)}</Text>)}</> : null}
      {report.nextSteps.length ? <><Text style={styles.heading}>Where to focus first</Text>{report.nextSteps.map((step, index) => <Text key={index} style={styles.paragraph}>{index + 1}. {printable(step)}</Text>)}</> : null}
      <Text style={styles.heading}>Areas to improve</Text>
      {report.gaps.length ? report.gaps.map(gap => <View key={gap.id} style={styles.card} wrap={false}>
        <Text style={styles.subheading}>{printable(gap.title)}</Text>
        <Text style={styles.muted}>{priorities[gap.priority]} | {confidence[gap.confidence]}</Text>
        <Text style={[styles.paragraph, { marginTop: 8 }]}>{printable(gap.observation)}</Text>
        <Text style={styles.label}>Why this matters to your business</Text><Text>{printable(gap.why)}</Text>
        <Text style={styles.label}>What you can do</Text><Text>{printable(gap.action)}</Text>
        <PageLinks pages={gap.pages} />
      </View>) : <Text style={styles.paragraph}>The available checks did not establish a specific problem. A wider review may find other opportunities.</Text>}
      <Text style={styles.heading}>{selected.length ? "Additions you want to discuss" : "Useful additions to consider"}</Text>
      <Text style={styles.paragraph}>A useful feature should fit how your business works. Confirm your current process and the cost of the work before deciding.</Text>
      {additions.length ? additions.map(item => <View key={item.id} style={styles.card} wrap={false}>
        <Text style={styles.subheading}>{printable(item.title)}</Text><Text style={styles.muted}>{sequences[item.sequence]} | {confidence[item.confidence]}</Text>
        <Text style={[styles.paragraph, { marginTop: 8 }]}>{printable(item.reason)}</Text>
        <Text style={styles.label}>How this could help</Text><Text>{printable(item.benefit)}</Text>
        <Text style={styles.label}>Suggested next step</Text><Text>{printable(item.action)}</Text>
        <Text style={styles.label}>Before you choose</Text><Text>{printable(item.tradeoff)}</Text>
        {item.prerequisites.length ? <><Text style={styles.label}>What to confirm first</Text>{item.prerequisites.map((need, index) => <Text key={index}>- {printable(need)}</Text>)}</> : null}
      </View>) : <Text style={styles.paragraph}>We need more information about your business to suggest a useful addition.</Text>}
      {report.ideas.length ? <><Text style={styles.heading}>Ideas to discuss</Text><Text style={styles.paragraph}>AI suggested these possibilities from the review. They need your confirmation and are not established website problems. You can mention an idea when speaking with Viviz.</Text>{report.ideas.map(idea => <View key={idea.id} style={styles.idea} wrap={false}>
        <Text style={styles.muted}>IDEA TO DISCUSS</Text><Text style={styles.subheading}>{printable(idea.title)}</Text><Text>{printable(idea.reason)}</Text>
        <Text style={styles.label}>A possible next step</Text><Text>{printable(idea.suggestion)}</Text><Text style={styles.label}>A question for you</Text><Text>{printable(idea.question)}</Text><PageLinks pages={idea.pages} />
      </View>)}</> : null}
      <Text style={styles.heading}>Taking the next step</Text><Text style={styles.paragraph}>Use your online report to choose improvements and send Viviz an enquiry. We can discuss your needs, explain the work and prepare a quotation. Choosing an improvement does not make a purchase or activate a service.</Text>
      <Text style={styles.heading}>What this review covers</Text><Text style={styles.paragraph}>{printable(report.scopeNote)}</Text>
    </Page>
  </Document>;
}
