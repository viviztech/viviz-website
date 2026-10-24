import type { BusinessAssessment, BusinessType, CustomerTask, ToolState } from "@/lib/website-audit/types";
import styles from "./audit.module.css";

export const BUSINESS_LABELS: Record<BusinessType, string> = {
  unknown: "Let the audit suggest / not sure", b2b_service: "B2B or professional services", local_service: "Local services", ecommerce: "Online store", saas: "Software / SaaS", publisher: "Publishing / media", real_estate: "Real estate", education: "Education", manufacturing: "Manufacturing", healthcare: "Healthcare",
};
export const TASK_LABELS: Record<CustomerTask, string> = { unknown: "Not sure yet", enquiry: "Send an enquiry", booking: "Book an appointment", purchase: "Buy a product", demo: "Request a demo", information: "Find useful information" };
const GOALS = [["more_enquiries", "More enquiries"], ["more_bookings", "More bookings"], ["more_sales", "More sales"], ["better_usability", "Easier customer experience"], ["save_time", "Less manual work"]];
const PAINS = [["missed_enquiries", "Enquiries get missed"], ["slow_follow_up", "Follow-up is slow"], ["manual_work", "Too much manual work"], ["unclear_offer", "Visitors do not understand our offer"], ["low_trust", "Visitors need more proof to trust us"], ["repeated_questions", "Customers repeat the same questions"], ["missed_appointments", "Customers miss appointments"], ["scheduling_difficulty", "Scheduling takes too much time"], ["multilingual_need", "Customers need another language"]];
const TOOLS: [keyof BusinessAssessment["tools"], string][] = [["crm", "CRM / enquiry tracking"], ["booking", "Appointment booking"], ["analytics", "Website analytics"], ["whatsapp", "WhatsApp customer communication"]];
const TOOL_LABELS: Record<ToolState, string> = { unknown: "Not sure / prefer to skip", none: "We do not use one", adequate: "We have a working solution", needs_improvement: "Our solution needs improvement" };

export default function AssessmentFields({ value, onChange, extended = true, disabled = false }: { value: BusinessAssessment; onChange: (value: BusinessAssessment) => void; extended?: boolean; disabled?: boolean }) {
  function update<Key extends keyof BusinessAssessment>(key: Key, next: BusinessAssessment[Key]) { onChange({ ...value, [key]: next }); }
  function toggle(key: "goals" | "painPoints", code: string) { update(key, value[key].includes(code) ? value[key].filter(item => item !== code) : [...value[key], code]); }
  return <div>
    <div className={styles.fieldGrid}>
      <label className={styles.label}>Business type <select className={styles.select} value={value.businessType} disabled={disabled} onChange={event => update("businessType", event.target.value as BusinessType)}>{Object.entries(BUSINESS_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
      <label className={styles.label}>Main visitor task <select className={styles.select} value={value.mainTask} disabled={disabled} onChange={event => update("mainTask", event.target.value as CustomerTask)}>{Object.entries(TASK_LABELS).map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select></label>
    </div>
    {extended ? <>
      <p className={styles.hint} style={{ marginBottom: 18 }}>Every answer is optional. These are your reported needs, separate from what we can observe on the website. Leave out confidential or customer information.</p>
      <div className={styles.fieldGrid}>
        <fieldset className={styles.fieldset}><legend>What would you like to improve? <span className={styles.hint}>Choose up to 3</span></legend>{GOALS.map(([code, label]) => <label className={styles.check} key={code}><input type="checkbox" checked={value.goals.includes(code)} disabled={disabled || (!value.goals.includes(code) && value.goals.length >= 3)} onChange={() => toggle("goals", code)} />{label}</label>)}</fieldset>
        <fieldset className={styles.fieldset}><legend>What gets in the way? <span className={styles.hint}>Choose up to 3</span></legend>{PAINS.map(([code, label]) => <label className={styles.check} key={code}><input type="checkbox" checked={value.painPoints.includes(code)} disabled={disabled || (!value.painPoints.includes(code) && value.painPoints.length >= 3)} onChange={() => toggle("painPoints", code)} />{label}</label>)}</fieldset>
      </div>
      <div className={styles.fieldGrid}>
        <label className={styles.label}>Who are your customers? <select className={styles.select} value={value.customerType} disabled={disabled} onChange={event => update("customerType", event.target.value as BusinessAssessment["customerType"])}><option value="unknown">Not sure / skip</option><option value="b2b">Businesses</option><option value="b2c">Consumers</option><option value="both">Both</option></select></label>
        <label className={styles.label}>Who handles enquiries? <select className={styles.select} value={value.teamSize} disabled={disabled} onChange={event => update("teamSize", event.target.value as BusinessAssessment["teamSize"])}><option value="unknown">Not sure / skip</option><option value="solo">One person</option><option value="multiple">Several people</option></select></label>
        <label className={styles.label}>Do customers need appointments? <select className={styles.select} value={value.appointmentsNeeded} disabled={disabled} onChange={event => update("appointmentsNeeded", event.target.value as BusinessAssessment["appointmentsNeeded"])}><option value="unknown">Not sure / skip</option><option value="yes">Yes</option><option value="no">No</option></select></label>
      </div>
      <fieldset className={styles.fieldset}><legend>Your existing tools</legend><p className={styles.hint} style={{ marginBottom: 13 }}>A public scan cannot establish which internal tools you use. Working tools can satisfy a recommendation without buying another system.</p><div className={styles.fieldGrid}>{TOOLS.map(([code, label]) => <label className={styles.label} key={code}>{label}<select className={styles.select} value={value.tools[code]} disabled={disabled} onChange={event => update("tools", { ...value.tools, [code]: event.target.value as ToolState })}>{Object.entries(TOOL_LABELS).map(([state, text]) => <option key={state} value={state}>{text}</option>)}</select></label>)}</div></fieldset>
    </> : null}
  </div>;
}
