import { CAPABILITIES, CAPABILITY_CATALOG, INDUSTRY_PACK_VERSION, RULEBOOK_VERSION } from "./catalog";
import type { AnalyzeInput, AuditReport, BusinessFact, BusinessType, CapabilityObservation, CustomerTask, ModuleSuggestion, PageObservation } from "../website-audit/types";

type Evidence = ModuleSuggestion["evidence"];
type Prerequisite = ModuleSuggestion["prerequisites"][number];
export interface BusinessContext {
  businessType: BusinessType;
  mainTask: CustomerTask;
  facts: BusinessFact[];
  pages: PageObservation[];
  englishContent: boolean;
  corpus: string;
}

const copy = (page: PageObservation) => `${page.title} ${page.h1.join(" ")} ${page.text} ${page.links.map((link) => link.text).join(" ")}`;
export function publicPages(pages: PageObservation[]) {
  return pages.filter((page) => page.status === "fetched" && page.statusCode !== null && page.statusCode >= 200 && page.statusCode < 300);
}

export function isEnquiryForm(page: PageObservation, form: PageObservation["forms"][number]): boolean {
  if (/subscribe|newsletter|sign[-_]?in|log[-_]?in|register|search/i.test(form.action)) return false;
  if (form.inputs.some((field) => ["password", "search"].includes(field.type))) return false;
  const contactContext = /contact|enquir|inquir|quotation|request|consultation|appointment/i.test(`${new URL(page.url).pathname} ${page.title} ${page.h1.join(" ")}`);
  return form.inputs.some((field) => /message|project|requirement|phone|telephone/i.test(`${field.name} ${field.label}`)) || (contactContext && form.inputs.some((field) => field.type === "email"));
}

export function deriveBusinessContext(input: AnalyzeInput): BusinessContext {
  const fetched = publicPages(input.pages);
  const pages = fetched.filter((page) => page.text.trim().length >= 100);
  const corpus = pages.map(copy).join("\n").toLowerCase();
  const facts: BusinessFact[] = [{ key: "collection", value: `${fetched.length} publicly fetched pages; ${pages.length} with substantive readable text`, source: "public_measurement", reference: input.url, confidence: "high" }];
  const assessment = input.assessment;
  for (const [key, value] of Object.entries(assessment)) {
    if (key === "tools") continue;
    if (Array.isArray(value)) {
      if (value.length) facts.push({ key, value: value.join(", "), source: "respondent_report", reference: "Optional business assessment; anonymous respondent, ownership unverified", confidence: "medium" });
    } else if (value !== "unknown") {
      facts.push({ key, value, source: "respondent_report", reference: "Optional business assessment; anonymous respondent, ownership unverified", confidence: "medium" });
    }
  }
  for (const [key, value] of Object.entries(assessment.tools)) if (value !== "unknown") {
    facts.push({ key: `tools.${key}`, value, source: "respondent_report", reference: "Optional business assessment; internal tool status not independently verified", confidence: "medium" });
  }
  let businessType = assessment.businessType;
  if (businessType === "unknown" && corpus) {
    // Weak single keywords must not select an industry pack.
    if (/\b(add to cart|shopping cart)\b/.test(corpus) && /\b(shop|product|checkout)\b/.test(corpus)) businessType = "ecommerce";
    else if (/\b(patient|clinic|medical practice)\b/.test(corpus) && /\b(doctor|healthcare|treatment)\b/.test(corpus)) businessType = "healthcare";
    else if (/\bsoftware\b/.test(corpus) && /\b(free trial|subscription|saas)\b/.test(corpus)) businessType = "saas";
    else if (/\b(consulting|software development|it services|professional services|digital agency)\b/.test(corpus) && /\b(businesses|business|companies|clients|enterprises)\b/.test(corpus)) businessType = "b2b_service";
    else if (/\b(plumbing|electrician|salon|cleaning service|repair service|landscaping)\b/.test(corpus) && /\b(local|service area|visit|appointment|call us)\b/.test(corpus)) businessType = "local_service";
    if (businessType !== "unknown") facts.push({ key: "inferredBusinessType", value: businessType, source: "inference", reference: pages[0]?.url ?? input.url, confidence: "medium" });
  }
  let mainTask = assessment.mainTask;
  if (mainTask === "unknown") {
    const linkText = pages.flatMap((page) => page.links.map((link) => link.text)).join(" ").toLowerCase();
    if (/\b(book|schedule) (an? )?(appointment|consultation|visit)\b/.test(linkText)) mainTask = "booking";
    else if (/\b(request|book|schedule) (a )?demo\b/.test(linkText)) mainTask = "demo";
    else if (/\b(add to cart|shop now)\b/.test(linkText)) mainTask = "purchase";
    else if (/\b(contact us|request a quote|get in touch|enquire|inquire)\b/.test(linkText)) mainTask = "enquiry";
    if (mainTask !== "unknown") facts.push({ key: "inferredMainTask", value: mainTask, source: "inference", reference: pages[0]?.url ?? input.url, confidence: "medium" });
  }
  const englishContent = pages.length > 0 && pages.filter((page) => !page.language || /^en\b/i.test(page.language)).length >= pages.length / 2;
  return { businessType, mainTask, facts, pages, corpus, englishContent };
}

const matches = (context: BusinessContext, expression: RegExp): Evidence => context.pages.filter((page) => expression.test(copy(page)) || expression.test(new URL(page.url).pathname)).slice(0, 5).map((page) => {
  const match = copy(page).match(expression);
  return { url: page.url, detail: match ? `Public text includes: “${match[0].slice(0, 140)}”` : `Relevant page path: ${new URL(page.url).pathname}` };
});
const linksMatching = (context: BusinessContext, expression: RegExp): Evidence => context.pages.flatMap((page) => page.links.filter((link) => expression.test(`${link.text} ${link.url}`)).slice(0, 2).map((link) => ({ url: page.url, detail: `Public link: ${link.text.slice(0, 70) || "unlabelled"} → ${link.url.slice(0, 220)}` }))).slice(0, 6);
const respondentEvidence = (url: string, detail: string): Evidence => [{ url, detail: `Respondent-reported in optional assessment (ownership unverified): ${detail}` }];

/** Observations are explicitly scoped to returned public content, never internal systems. */
export function observeCapabilities(input: AnalyzeInput, context: BusinessContext): CapabilityObservation[] {
  const result = CAPABILITY_CATALOG.map((item): CapabilityObservation => ({ code: item.code, state: "unknown", detail: "Insufficient public evidence; not assessed as absent.", evidence: [] }));
  const byCode = new Map(result.map((item) => [item.code, item]));
  const set = (code: string, evidence: Evidence, missing: string, partial = false) => {
    const item = byCode.get(code)!;
    if (!context.pages.length || !context.englishContent) return;
    item.state = evidence.length ? partial ? "partial" : "present" : "not_observed";
    item.evidence = evidence.length ? evidence : context.pages.slice(0, 5).map((page) => ({ url: page.url, detail: `Not observed in returned ${page.rendered ? "rendered" : "HTML"} content; dynamic and unchecked pages may differ.` }));
    item.detail = evidence.length ? `${partial ? "Some relevant information" : "A relevant public route or content signal"} was observed. Availability and successful use were not tested.` : missing;
  };
  set("service_clarity", matches(context, /\b(our services|services we offer|what we do|we (?:provide|offer|help)|our solutions|our expertise)\b/i), "No clear offering signal was observed in readable checked content; review service clarity manually.");
  const contactLinks = linksMatching(context, /(?:mailto:|tel:|\/contact(?:[/?#]|$)|\/(?:enquire|inquiry|enquiry)(?:[/?#]|$)|get in touch|request (?:a )?quote)/i);
  const forms = context.pages.flatMap((page) => page.forms.filter((form) => isEnquiryForm(page, form)).map((form) => ({ url: page.url, detail: `Public enquiry-form signal with ${form.inputs.length} fields; submission and delivery were not tested.` })));
  set("service_enquiries", [...forms, ...contactLinks], "No enquiry route was observed in checked public content. A dynamic form or a route on an unchecked page may exist.");
  set("contact_actions", [...contactLinks, ...linksMatching(context, /(?:wa\.me|api\.whatsapp\.com)/i)], "No contact action was observed on the checked pages.");
  const qualifiedForms = context.pages.filter((page) => page.forms.some((form) => isEnquiryForm(page, form) && form.inputs.some((field) => /service|project|requirement|budget|organisation|organization|company|message/i.test(`${field.name} ${field.label}`)))).map((page) => ({ url: page.url, detail: "Public form includes a service, organisation, project or message/context field; delivery not tested." }));
  set("qualification_forms", qualifiedForms, "Relevant context fields were not observed in the sampled public forms.");
  set("case_studies", [...linksMatching(context, /case[-\s]?stud(?:y|ies)|portfolio|our[-\s]work|testimonials|reviews/i), ...matches(context, /\b(client story|project outcome|customer testimonial)\b/i)], "No relevant case-study, portfolio or testimonial signal was observed on the checked pages; alternative proof may exist.");
  set("process_guidance", matches(context, /\b(how (?:it|we) work|our process|what happens next|next steps|delivery process|how to get started)\b/i), "No explanation of the process or next steps was observed in checked content.");
  set("service_areas", matches(context, /\b(areas? we (?:serve|cover)|service areas?|serving [a-z]|coverage area|locations we (?:serve|cover))\b/i), "No service-area description was observed in checked content.");
  const location = matches(context, /\b(visit us|our (?:office|salon|showroom|store)|find us|directions|opening hours|business hours)\b/i);
  const hours = matches(context, /\b(opening hours|business hours|(?:mon|tues|wednes|thurs|fri|satur|sun)day\s*[:–-])\b/i);
  set("visit_information", [...location, ...hours], "Visit information was not observed on the checked pages.", location.length > 0 && hours.length === 0);
  const booking = [...linksMatching(context, /calendly\.com|cal\.com\/|acuityscheduling|squareup\.com\/appointments|setmore\.com|simplybook|fresha\.com|book (?:an? )?(?:appointment|consultation|visit)|schedule (?:an? )?(?:appointment|consultation|demo)|request (?:an? )?(?:appointment|demo)/i), ...context.pages.filter((page) => page.forms.some((form) => isEnquiryForm(page, form)) && /\b(appointment|consultation|request a demo)\b/i.test(copy(page))).map((page) => ({ url: page.url, detail: "A public request form is offered alongside appointment, consultation or demo information; availability and submission were not tested." })), ...context.pages.filter((page) => /\b(?:call|email)[\w\s,]{0,25}(?:book|schedule|request)[\w\s]{0,15}(?:appointment|consultation|demo)\b/i.test(copy(page)) && page.links.some((link) => /^(?:tel:|mailto:)/i.test(link.url))).map((page) => ({ url: page.url, detail: "Public content offers telephone or email appointment requests alongside a matching contact action; request handling was not tested." }))];
  set("appointments", booking, "No appointment request or scheduler route was observed in checked content. Telephone or unlinked scheduling may still be available.");
  set("support_information", [...linksMatching(context, /\b(faq|help cent(?:er|re)|knowledge base|support)\b/i), ...matches(context, /\b(frequently asked questions|common questions)\b/i)], "No maintained help, FAQ or common-question resource was observed on the checked pages.");
  set("quotations", linksMatching(context, /\b(request|ask|get) (?:a |an )?(?:quote|quotation|estimate)\b/i), "No quotation request route was observed in checked content.");
  set("landing_pages", linksMatching(context, /\/(?:services?|solutions?)\/[a-z0-9][a-z0-9-]+/i), "Distinct service page links were not observed; a single page may already be sufficient.");
  // A public page cannot establish the use, correctness or absence of these systems.
  for (const [code, tool] of [["crm_handoff", "crm"], ["analytics", "analytics"], ["whatsapp_automation", "whatsapp"]] as const) {
    const state = input.assessment.tools[tool];
    if (state === "adequate") Object.assign(byCode.get(code)!, { state: "present", detail: "Respondent reports an adequate existing tool; independently unverified. Prefer using the existing system.", evidence: respondentEvidence(input.url, `${tool} is adequate`) });
    else if (state === "needs_improvement") Object.assign(byCode.get(code)!, { state: "partial", detail: "Respondent reports an existing tool that needs improvement; public scanning cannot verify its configuration.", evidence: respondentEvidence(input.url, `${tool} needs improvement`) });
    else if (state === "none") Object.assign(byCode.get(code)!, { state: "not_observed", detail: "Respondent reports no current tool. This is an answer, not a public measurement.", evidence: respondentEvidence(input.url, `no ${tool} tool reported`) });
  }
  if (input.assessment.tools.booking === "adequate") Object.assign(byCode.get("appointments")!, { state: "present", detail: "Respondent reports a working existing booking system. A replacement is not recommended; the public route may need separate checking.", evidence: [...booking, ...respondentEvidence(input.url, "booking tool is adequate")] });
  if (input.assessment.appointmentsNeeded === "no") Object.assign(byCode.get("appointments")!, { state: "not_applicable", detail: "Respondent says appointments are not needed. A public appointment signal, if present, is retained as evidence for review.", evidence: [...booking, ...respondentEvidence(input.url, "appointments are not needed")] });
  return result;
}

export function resolvePrerequisites(code: string, observations: readonly CapabilityObservation[], planned: ReadonlySet<string>, blocked: ReadonlySet<string> = new Set()): Prerequisite[] {
  const entry = CAPABILITIES.get(code);
  if (!entry) throw new Error(`Unregistered capability: ${code}`);
  const state = (dependency: string): Prerequisite["state"] => {
    if (blocked.has(dependency)) return "blocked";
    if (observations.find((item) => item.code === dependency)?.state === "present") return "satisfied";
    if (planned.has(dependency)) return "planned";
    return "unresolved";
  };
  const result: Prerequisite[] = entry.requiresAll.map((dependency) => ({ label: CAPABILITIES.get(dependency)!.title, state: state(dependency) }));
  for (const alternatives of entry.requiresAny) {
    const states = alternatives.map(state);
    const resolved = states.includes("satisfied") ? "satisfied" : states.includes("planned") ? "planned" : states.every((item) => item === "blocked") ? "blocked" : "unresolved";
    result.push({ label: `One of: ${alternatives.map((dependency) => CAPABILITIES.get(dependency)!.title).join(" or ")}`, state: resolved });
  }
  for (const conflict of entry.conflicts) if (observations.find((item) => item.code === conflict)?.state === "present") result.push({ label: `Resolve conflict with ${CAPABILITIES.get(conflict)!.title}`, state: "blocked" });
  result.push(...entry.operatingNeeds.map((label): Prerequisite => ({ label, state: "unresolved" })));
  return result;
}

export function planGrowth(input: AnalyzeInput, context: BusinessContext, capabilities: CapabilityObservation[]): { recommendations: ModuleSuggestion[]; readiness: AuditReport["readiness"] } {
  const a = input.assessment;
  const isB2b = context.businessType === "b2b_service";
  const isLocal = context.businessType === "local_service";
  const specialist = isB2b || isLocal;
  const observations = new Map(capabilities.map((item) => [item.code, item]));
  const state = (code: string) => observations.get(code)!.state;
  const missing = (code: string) => state(code) === "not_observed" || state(code) === "partial";
  const pain = (...codes: string[]) => codes.some((code) => a.painPoints.includes(code));
  const goal = (...codes: string[]) => codes.some((code) => a.goals.includes(code));
  const publicEvidence = (code: string) => observations.get(code)!.evidence;
  const answer = (detail: string) => respondentEvidence(input.url, detail);
  const candidates: ModuleSuggestion[] = [];
  function add(code: string, rule: string, reason: string, evidence: Evidence, level: ModuleSuggestion["level"] = "recommended", action?: string) {
    const entry = CAPABILITIES.get(code);
    if (!entry || candidates.some((item) => item.code === code) || evidence.length === 0) return;
    const hasAnswers = evidence.some((item) => item.detail.startsWith("Respondent-reported"));
    candidates.push({
      id: `growth-${code}`, code, title: entry.title, level, confidence: hasAnswers || state(code) === "not_observed" ? "medium" : "high",
      journey: entry.journey, reason, benefit: entry.benefit,
      currentAlternative: state(code) === "present" ? observations.get(code)!.detail : entry.alternatives.join("; ") || "Confirm existing practices before introducing a new tool.",
      action: action ?? `Review the current approach, agree the smallest useful change, and scope ${entry.title.toLowerCase()} only if it supports the customer task.`,
      prerequisites: [], effort: entry.effort,
      sequence: level === "essential" ? "fix_first" : level === "optional" ? "consider_later" : "improve_next",
      verification: `An authorized person should complete the relevant ${context.mainTask === "unknown" ? "customer" : context.mainTask} journey, confirm the recipient or outcome, and review whether ${entry.title.toLowerCase()} is useful. No transaction was tested by this audit.`,
      tradeoff: entry.tradeoff, evidence: evidence.slice(0, 8),
      ruleIds: [`${rule}@${RULEBOOK_VERSION}`, `pack:${specialist ? context.businessType : "general"}@${INDUSTRY_PACK_VERSION}`], delivery: entry.delivery,
    });
  }
  const taskNeedsContact = ["enquiry", "booking", "demo"].includes(context.mainTask);
  if (specialist && missing("service_clarity")) add("service_clarity", "offering-readable", "Visitors need to understand this service before deciding whether to enquire. The checked content did not establish a clear offering signal.", publicEvidence("service_clarity"), "recommended", "Review the sampled pages and make the service, intended customer and next step clear. Confirm whether dynamic content already supplies this information.");
  if (taskNeedsContact && missing("service_enquiries")) add("service_enquiries", "task-enquiry-route", `The supported customer task is ${context.mainTask}, but a suitable public enquiry route was not observed on the checked pages.`, publicEvidence("service_enquiries"), "essential");
  if (taskNeedsContact && missing("contact_actions") && state("service_enquiries") === "present") add("contact_actions", "task-contact-discovery", "An enquiry form was observed, but the checked navigation did not expose a clear contact action. Review discoverability before adding another channel.", publicEvidence("contact_actions"), "recommended");
  if (isB2b) {
    if (missing("case_studies")) add("case_studies", "b2b-relevant-proof", "Prospective service clients need evidence relevant to their problem. No case-study, portfolio or testimonial signal was observed in the checked scope.", publicEvidence("case_studies"));
    if (missing("process_guidance")) add("process_guidance", "b2b-evaluation-guidance", "Explaining scope and the next step can help service buyers prepare for a useful conversation. No clear process signal was observed in checked content.", publicEvidence("process_guidance"));
    const genericForms = context.pages.some((page) => page.forms.some((form) => isEnquiryForm(page, form)));
    if (genericForms && missing("qualification_forms") && (pain("missed_enquiries", "unclear_offer") || a.customerType === "b2b")) add("qualification_forms", "b2b-relevant-intake", "A public form was observed without a service, project or message-context field. Relevant short questions may make the first response more useful.", [...publicEvidence("qualification_forms"), ...(a.customerType === "b2b" ? answer("customer type is B2B") : answer(`pain points: ${a.painPoints.join(", ")}`))]);
    if (pain("unclear_offer") && missing("landing_pages") && state("service_clarity") === "present") add("landing_pages", "b2b-distinct-service-needs", "The respondent reports an unclear offering. Consider a distinct page only where there is a separate customer need and enough useful content.", [...answer("unclear offering"), ...publicEvidence("landing_pages")], "optional");
  }
  if (isLocal) {
    const travels = matches(context, /\b(we come to you|at your (?:home|premises)|on[- ]site service|mobile (?:service|repair)|home visits?)\b/i);
    if (travels.length && !/\bonline[- ]only\b/i.test(context.corpus) && missing("service_areas")) add("service_areas", "local-travel-coverage", "The public content indicates travel to customer locations, but the checked pages did not make geographic coverage clear.", [...travels, ...publicEvidence("service_areas")]);
    const visits = matches(context, /\b(visit our|visit us|our showroom|walk[- ]ins welcome|come (?:to|into) our)\b/i);
    const excludesVisits = /\b(online[- ]only|no walk[- ]ins|by appointment only)\b/i.test(context.corpus);
    if (visits.length && !excludesVisits && missing("visit_information")) add("visit_information", "local-invited-visits", "Public content invites customers to visit. The checked visit information was incomplete; confirm hours, location and directions appropriate to this business.", [...visits, ...publicEvidence("visit_information")]);
    const publishedPhone = matches(context, /(?:\+\d[\d ()-]{7,}\d|\b\d{3}[- ]\d{3}[- ]\d{4}\b)/);
    const phoneLinks = linksMatching(context, /tel:/i);
    if (context.mainTask === "enquiry" && publishedPhone.length && !phoneLinks.length && state("contact_actions") !== "unknown") add("contact_actions", "local-phone-action", "A telephone number was observed, but a telephone action link was not observed in the checked content. Confirm that phone enquiries are a preferred route before adding one.", publishedPhone, "recommended", "If telephone enquiries are preferred, make the published number a clearly labelled telephone link and test it on a mobile device.");
  }
  const emergency = /\b(emergency|urgent repair|24[- /]7 emergency)\b/i.test(context.corpus);
  const needsAppointment = a.appointmentsNeeded === "yes" || ["booking", "demo"].includes(context.mainTask);
  if (needsAppointment && a.appointmentsNeeded !== "no" && !emergency && missing("appointments") && a.tools.booking !== "adequate") add("appointments", "task-appointment-request", "The customer task or respondent answer establishes an appointment need. No suitable booking or request route was observed on the checked pages; a request form or existing scheduler may satisfy it.", [...publicEvidence("appointments"), ...answer(a.appointmentsNeeded === "yes" ? "appointments are needed" : `main task: ${context.mainTask}`)], "recommended");
  if (needsAppointment && a.appointmentsNeeded !== "no" && a.tools.booking === "needs_improvement") add("appointments", "reported-scheduler-improvement", "The respondent reports an existing booking system needing improvement. Review that system and the operating process before proposing a replacement.", answer("booking system needs improvement; appointments are needed"), "recommended", "With authorized access, inspect the current scheduler and improve its configuration, availability or discovery before considering another tool.");
  if (a.tools.booking === "adequate" && needsAppointment && !linksMatching(context, /calendly|cal\.com\/|book|schedule|appointment/i).length && context.pages.length) add("appointments", "existing-scheduler-discovery", "The respondent reports an adequate booking system, but a public scheduling route was not observed. Review discoverability of the existing system before considering new software.", answer("existing booking tool is adequate"), "recommended", "Confirm the current scheduler works and add or clarify an appropriate link to it where visitors decide to book. Reuse the existing tool.");
  const leadProblem = pain("missed_enquiries", "slow_follow_up");
  if (leadProblem && a.tools.crm !== "adequate" && (a.teamSize === "multiple" || a.tools.crm === "none" || a.tools.crm === "needs_improvement")) add("crm_handoff", "reported-enquiry-handoff", "The respondent reports missed enquiries or slow follow-up. Review the current handoff and responsibilities before choosing any CRM or workflow changes.", answer(`pain points: ${a.painPoints.join(", ")}; CRM: ${a.tools.crm}; team: ${a.teamSize}`), "recommended", a.tools.crm === "needs_improvement" ? "Inspect the existing CRM routing and ownership with authorized access; improve or integrate it before considering replacement." : "Agree a responsible recipient and simple tracking process; assess whether a shared inbox or existing tool is sufficient before adding software.");
  if (leadProblem && a.tools.crm === "adequate") add("follow_up", "existing-crm-follow-up", "The respondent reports a working CRM and a follow-up problem. Review tasks and routing in the existing system rather than proposing another CRM.", answer(`CRM adequate; pain points: ${a.painPoints.join(", ")}`), "recommended", "Review the response process and configure appropriate tasks in the existing CRM after confirming contact permissions and human escalation.");
  else if (pain("slow_follow_up") && a.teamSize === "multiple") add("follow_up", "reported-follow-up-process", "The respondent reports slow follow-up across a team. An agreed process is needed before any automation is considered.", answer("slow follow-up; multiple team members"), "optional");
  if ((goal("more_enquiries", "more_bookings", "more_sales") || leadProblem) && ["none", "needs_improvement"].includes(a.tools.analytics)) add("analytics", "reported-measurement-gap", "The respondent reports no analytics or an analytics setup needing improvement. A public scan cannot validate measurement accuracy.", answer(`analytics status: ${a.tools.analytics}`), "recommended", "With authorized access, verify the existing measurement and privacy setup or establish an appropriate baseline. Avoid duplicate tags.");
  if (a.tools.analytics === "adequate" && goal("more_enquiries", "more_bookings", "more_sales") && taskNeedsContact) add("event_tracking", "goal-task-measurement-review", "The respondent reports adequate analytics and a goal involving customer actions. Review whether meaningful completed actions are already measured before changing instrumentation.", answer(`analytics adequate; goals: ${a.goals.join(", ")}; main task: ${context.mainTask}`), "optional", "Review existing events with authorized access. Only add missing, privacy-appropriate task measurement; a button click alone does not prove a completed enquiry.");
  if (pain("repeated_questions") && missing("support_information")) add("support_information", "reported-repeated-questions", "The respondent reports repeated questions and no FAQ or help signal was observed in the sampled pages. Clear maintained answers are a useful first step.", [...answer("repeated customer questions"), ...publicEvidence("support_information")]);
  const sensitiveAdvice = context.businessType === "healthcare" || /\b(medical advice|legal advice|law firm|solicitors?|financial advice|investment advis[eo]r)\b/i.test(context.corpus);
  if (pain("repeated_questions") && state("support_information") === "present" && state("contact_actions") === "present" && !sensitiveAdvice && a.teamSize === "multiple" && goal("save_time")) add("ai_assistant", "conditional-assisted-answers", "The respondent reports repeated questions and a time-saving goal. Public help content and a contact route were observed, so a narrowly scoped feasibility assessment may be useful after validating content quality and human ownership.", [...answer("repeated questions; save-time goal; multiple team members"), ...publicEvidence("support_information"), ...publicEvidence("contact_actions")], "optional");
  if (pain("manual_work") && a.tools.whatsapp === "needs_improvement") add("whatsapp_automation", "existing-channel-routing", "The respondent reports manual work and a WhatsApp process needing improvement. Assess the existing channel and handoff before proposing automation.", answer("manual work; WhatsApp needs improvement"), "optional");
  if (pain("missed_appointments") && (state("appointments") === "present" || a.tools.booking === "adequate") && a.appointmentsNeeded !== "no") add("reminders", "reported-missed-appointments", "The respondent reports missed appointments and a booking route or existing scheduler is available. Assess whether the current tool already supports suitable reminders.", [...answer("missed appointments"), ...publicEvidence("appointments")], "optional");
  if (pain("multilingual_need")) add("language_support", "reported-language-need", "The respondent reports an audience language need. Confirm which customer tasks require translation and how content will be maintained before implementation.", answer("audience language support requested"), "optional");

  const planned = new Set(candidates.map((item) => item.code));
  const blocked = new Set<string>(a.appointmentsNeeded === "no" ? ["appointments"] : []);
  for (const candidate of candidates) candidate.prerequisites = resolvePrerequisites(candidate.code, capabilities, planned, blocked);
  const priority = { fix_first: 0, improve_next: 1, consider_later: 2 };
  candidates.sort((left, right) => priority[left.sequence] - priority[right.sequence]);
  const readiness: AuditReport["readiness"] = [
    { label: "Website task clarity", state: context.mainTask === "unknown" ? "unknown" : "existing_process", basis: context.mainTask === "unknown" ? "No main customer task was confirmed or confidently inferred." : `${context.mainTask} task ${a.mainTask === "unknown" ? "inferred from public links; confirm with the business" : "reported by the respondent"}.` },
    { label: "Enquiry handling", state: a.tools.crm === "adequate" ? "existing_process" : a.tools.crm === "none" && leadProblem ? "foundation_needed" : "unknown", basis: a.tools.crm === "adequate" ? "Respondent reports adequate CRM; operational performance was not verified." : leadProblem ? "Respondent reports an enquiry handling problem; responsibilities and the current process need confirmation." : "Public pages cannot establish how the business handles enquiries." },
    { label: "Measurement", state: a.tools.analytics === "adequate" ? "existing_process" : ["none", "needs_improvement"].includes(a.tools.analytics) ? "foundation_needed" : "unknown", basis: a.tools.analytics === "unknown" ? "Analytics correctness requires authorized access or business confirmation." : `Respondent reports analytics status: ${a.tools.analytics}; independently unverified.` },
    { label: "Operating capacity", state: a.teamSize === "unknown" ? "unknown" : "existing_process", basis: a.teamSize === "unknown" ? "No operating owner or capacity has been confirmed." : `Respondent reports ${a.teamSize === "solo" ? "a solo operator" : "multiple team members"}; capacity and ownership for proposed work still need agreement.` },
  ];
  return { recommendations: candidates, readiness };
}
