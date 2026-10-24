import { Search, PanelsTopLeft, Send, MessageSquare, HeartHandshake } from "lucide-react";
import type { AuditReport } from "@/lib/website-audit/types";
import styles from "./audit.module.css";

const STEPS = [
  { key: "discover", title: "Find you", text: "Can a visitor discover the right page?", icon: Search },
  { key: "evaluate", title: "Choose with confidence", text: "Can they understand the offer and trust it?", icon: PanelsTopLeft },
  { key: "contact", title: "Take the next step", text: "Is there a clear way to enquire, book or buy?", icon: Send },
  { key: "follow_up", title: "Hear back", text: "Do your reported processes support a response?", icon: MessageSquare },
  { key: "retain", title: "Return again", text: "Is there a reason and a process to reconnect?", icon: HeartHandshake },
];

export default function TaskMap({ report }: { report?: AuditReport }) {
  const steps = STEPS.filter(step => ["discover", "evaluate", "contact"].includes(step.key) || report?.recommendations.some(item => item.journey === step.key));
  return <div className={styles.map}>
    <div className={styles.mapTop}><div><h3>{report ? "Your visitor task map" : "A website is a customer journey."}</h3><p>{report ? "An inferred journey from checked public pages and your answers. Links and forms are observed; transactions and submissions are not completed." : "The useful question is what your visitor needs to do next. We connect website findings to that task, then suggest the improvements that support it."}</p></div><span className={`${styles.badge} ${styles.purple}`}>{report ? "Inferred public path" : "The Viviz approach"}</span></div>
    <div className={styles.mapSteps}>{steps.map(({ key, title, text, icon: Icon }) => {
      const opportunities = report?.recommendations.filter(item => item.journey === key && item.level !== "not_needed_now").length ?? 0;
      const findings = report?.findings.filter(item => key === "discover" ? ["technical", "seo"].includes(item.category) : key === "evaluate" ? ["content", "performance", "mobile", "accessibility"].includes(item.category) : key === "contact" ? item.category === "conversion" : false) ?? [];
      return <div className={styles.mapStep} key={key}><div className={styles.mapLine}><span className={styles.mapDot}><Icon size={14} aria-hidden="true" /></span></div><h4>{title}</h4><p>{text}</p>{report ? <><span className={styles.mapCount}>{findings.length} findings · {opportunities} opportunities</span>{findings.length ? <ul className={styles.mapFindings}>{findings.slice(0, 2).map(item => <li key={item.id}>{item.title}</li>)}</ul> : null}</> : null}</div>;
    })}</div>
  </div>;
}
