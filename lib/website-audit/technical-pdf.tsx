import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import type { AuditView } from "./types";

const styles = StyleSheet.create({
  page: { padding: 38, paddingBottom: 50, fontFamily: "Helvetica", fontSize: 9, color: "#172033", lineHeight: 1.5 },
  eyebrow: { fontSize: 9, color: "#087891", marginBottom: 8, letterSpacing: 1.4 },
  title: { fontSize: 25, fontFamily: "Helvetica-Bold", marginBottom: 8 },
  heading: { fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 20, marginBottom: 8 },
  subheading: { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 5 },
  muted: { color: "#526077", fontSize: 8 },
  paragraph: { marginBottom: 7 },
  card: { padding: 12, backgroundColor: "#F3F7FA", borderRadius: 4, marginBottom: 9 },
  link: { fontSize: 8, color: "#087891", marginBottom: 3 },
  footer: { position: "absolute", bottom: 22, left: 38, right: 38, fontSize: 7, color: "#65748B" },
});

// Core Helvetica fonts cannot represent every scraped Unicode character.
function printable(value: string): string {
  return value.normalize("NFKD").replace(/[\u2010-\u2015]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[^\x20-\x7e\n\r]/g, "");
}

export function TechnicalAuditPdfDocument({ audit }: { audit: AuditView }) {
  const report = audit.report!;
  const selected = report.recommendations.filter((item) => audit.decisions[item.id] === "included");
  return <Document title={`Website audit - ${audit.hostname}`} author="Viviz Technologies" subject="Public website assessment and proposed Growth Stack">
    <Page size="A4" style={styles.page}>
      <Text style={styles.eyebrow}>VIVIZ TECHNOLOGIES / WEBSITE AUDIT</Text>
      <Text style={styles.title}>{printable(audit.hostname)}</Text>
      <Text style={styles.paragraph}>{printable(report.summary)}</Text>
      <Text style={styles.muted}>Generated {new Date(report.generatedAt).toISOString().slice(0, 10)} | {audit.progress.checked} pages checked of {audit.progress.discovered} discovered | Limit {audit.progress.limit} pages</Text>
      <Text style={styles.muted}>Interpretation {audit.revision} | Analysis {report.version} | {report.collectionMode === "html" ? "Public HTML; JavaScript and visual review not assessed" : "Rendered public-page sample"} | {report.explanationMode === "rules" ? "Rule-based explanations" : "AI-assisted explanations"}</Text>
      <Text style={styles.heading}>Category assessment</Text>
      {report.categories.map((category) => <View key={category.category} style={styles.card}><Text style={styles.subheading}>{category.label}: {category.score === null ? category.coverage === "unavailable" ? "Not assessed" : "Limited assessment" : `${category.score}/100 of assessed checks`}</Text><Text>{printable(category.note)}</Text><Text style={styles.muted}>{category.assessed} assessed / {category.applicable} applicable checks. Unknown checks are not failures.</Text></View>)}
      <Text style={styles.heading}>Website findings</Text>
      {report.findings.map((finding) => <View key={finding.id} style={styles.card} wrap={false}><Text style={styles.subheading}>{printable(finding.title)}</Text><Text style={styles.muted}>{finding.type.replaceAll("_", " ")} | {finding.severity} priority | {finding.confidence} confidence | {finding.effort} effort</Text><Text style={styles.paragraph}>{printable(finding.observation)}</Text><Text style={styles.paragraph}>Action: {printable(finding.action)}</Text><Text style={styles.paragraph}>Verify: {printable(finding.verification)}</Text>{finding.evidence.slice(0, 3).map((item, index) => <View key={`${item.url}-${index}`}><Link style={styles.link} src={item.url}>{printable(item.url)}</Link><Text style={styles.muted}>{printable(item.detail).slice(0, 400)}</Text></View>)}</View>)}
      <Text style={styles.heading}>{selected.length ? "Your selected Growth Stack" : "Recommended Growth Stack"}</Text>
      {(selected.length ? selected : report.recommendations.filter((item) => item.level !== "not_needed_now")).map((item) => <View key={item.id} style={styles.card} wrap={false}><Text style={styles.subheading}>{printable(item.title)}</Text><Text style={styles.muted}>{item.level.replaceAll("_", " ")} | {item.sequence.replaceAll("_", " ")} | {item.effort} effort</Text><Text style={styles.paragraph}>{printable(item.reason)}</Text><Text style={styles.paragraph}>Action: {printable(item.action)}</Text><Text style={styles.paragraph}>Benefit hypothesis: {printable(item.benefit)}</Text><Text style={styles.paragraph}>Existing alternative: {printable(item.currentAlternative)}</Text>{item.prerequisites.map((need, index) => <Text key={index} style={styles.muted}>Prerequisite ({need.state}): {printable(need.label)}</Text>)}<Text style={styles.muted}>No installation, purchase or activation is included in this assessment.</Text></View>)}
      <Text style={styles.heading}>Business context and readiness</Text>
      {report.facts.map((fact, index) => <Text key={`${fact.key}-${index}`} style={styles.paragraph}>{printable(fact.key)}: {printable(fact.value)} ({fact.source.replaceAll("_", " ")}; {fact.confidence} confidence)</Text>)}
      {report.readiness.map((item, index) => <Text key={index} style={styles.paragraph}>{printable(item.label)}: {item.state.replaceAll("_", " ")}. {printable(item.basis)}</Text>)}
      <Text style={styles.heading}>Scope and limitations</Text>
      {report.limitations.map((item, index) => <Text key={index} style={styles.paragraph}>- {printable(item)}</Text>)}
      <Text style={styles.paragraph}>Automated observations do not establish complete accessibility, successful transactions, security certification, conversion rates, or business results. Public pages and optional respondent answers have separate evidence sources.</Text>
      <Text style={styles.heading}>Page coverage</Text>
      {report.pages.map((page) => <View key={page.url} style={{ marginBottom: 5 }}><Link src={page.url} style={styles.link}>{printable(page.url)}</Link><Text style={styles.muted}>{page.status}{page.statusCode ? ` / HTTP ${page.statusCode}` : ""} | {new Date(page.fetchedAt).toISOString()} {page.error ? `| ${printable(page.error)}` : ""}</Text></View>)}
      <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `Private report - Viviz Technologies - ${pageNumber} / ${totalPages}`} />
    </Page>
  </Document>;
}
