import type { BusinessType, ModuleSuggestion } from "../website-audit/types";

export const CATALOG_VERSION = "1.0.0";
export const RULEBOOK_VERSION = "1.0.0";
export const INDUSTRY_PACK_VERSION = "1.0.0";

export interface CapabilityDefinition {
  code: string;
  title: string;
  version: string;
  journey: ModuleSuggestion["journey"];
  benefit: string;
  tradeoff: string;
  effort: ModuleSuggestion["effort"];
  families: BusinessType[];
  signals: string[];
  exclusions: string[];
  operatingNeeds: string[];
  alternatives: string[];
  followUp: string;
  requiresAll: string[];
  requiresAny: string[][];
  conflicts: string[];
  reviewedAt: string;
  reviewAfter: string;
  sources: string[];
  delivery: ModuleSuggestion["delivery"];
}

type Entry = Pick<CapabilityDefinition, "code" | "title" | "journey" | "benefit" | "tradeoff" | "effort"> & Partial<CapabilityDefinition>;
const definition = (entry: Entry): CapabilityDefinition => ({
  version: CATALOG_VERSION,
  families: [], signals: [], exclusions: [], operatingNeeds: [], alternatives: [],
  followUp: "Who will own this capability and how will you confirm it helps visitors?",
  requiresAll: [], requiresAny: [], conflicts: [],
  reviewedAt: "2026-10-24", reviewAfter: "2027-01-24",
  sources: ["https://www.w3.org/WAI/planning/"],
  delivery: "custom_implementation", ...entry,
});

/** Recommendation contracts, not a list of installed or purchasable modules. */
export const CAPABILITY_CATALOG: readonly CapabilityDefinition[] = [
  definition({ code: "service_clarity", title: "Clear service information", journey: "evaluate", benefit: "Help visitors understand what you offer and whether it fits their needs.", tradeoff: "Requires accurate service scope and ongoing content ownership.", effort: "small", signals: ["service pages", "offering descriptions"], alternatives: ["An existing clear overview page"], operatingNeeds: ["Approved service information"] }),
  definition({ code: "service_enquiries", title: "Service-specific enquiry route", journey: "contact", benefit: "Give prospective customers an appropriate next step with the service context intact.", tradeoff: "Form delivery, accessible validation and an accountable recipient need testing.", effort: "medium", signals: ["contact links", "enquiry forms", "mailto links"], alternatives: ["A suitable existing contact form", "Email or telephone intake"], operatingNeeds: ["Responsible enquiry recipient", "Privacy and contact handling"] }),
  definition({ code: "qualification_forms", title: "Relevant enquiry questions", journey: "contact", benefit: "Collect enough relevant context for a useful first response.", tradeoff: "Long forms can discourage enquiries; collect only information needed for the next step.", effort: "medium", requiresAll: ["service_enquiries"], families: ["b2b_service"], signals: ["service selector", "project context field"], alternatives: ["A short sales conversation", "An existing CRM intake form"] }),
  definition({ code: "case_studies", title: "Evidence of relevant work", journey: "evaluate", benefit: "Help potential clients evaluate experience through specific examples.", tradeoff: "Case studies need customer permission and substantiated claims.", effort: "medium", families: ["b2b_service"], signals: ["case studies", "project portfolio", "relevant testimonials"], alternatives: ["A useful portfolio", "Relevant independent reviews"] }),
  definition({ code: "process_guidance", title: "Explain the next steps", journey: "evaluate", benefit: "Clarify scope, process and what happens after an enquiry.", tradeoff: "Describe real working practices and avoid promising fixed pricing for custom work.", effort: "small", signals: ["how it works", "process description"], alternatives: ["An existing service guide", "A consultation explaining custom work"] }),
  definition({ code: "contact_actions", title: "Easy contact actions", journey: "contact", benefit: "Make the preferred enquiry route easy to find and use.", tradeoff: "Publish only channels that someone can maintain.", effort: "small", signals: ["tel link", "contact link", "email link"], alternatives: ["Booking", "A clearly published email address"], operatingNeeds: ["A monitored contact channel"] }),
  definition({ code: "service_areas", title: "Service-area information", journey: "discover", benefit: "Help customers determine whether their location is covered.", tradeoff: "Only publish locations actually served; avoid thin duplicate location pages.", effort: "small", families: ["local_service"], signals: ["service-area copy", "coverage locations"], exclusions: ["Online-only services", "Businesses without a geographic service restriction"] }),
  definition({ code: "visit_information", title: "Useful visit information", journey: "contact", benefit: "Help visitors plan a visit with accurate location, hours and directions.", tradeoff: "Public visit information is inappropriate for some service-area and appointment-only businesses.", effort: "small", families: ["local_service"], signals: ["visit invitation", "opening hours", "directions"], exclusions: ["Online-only services", "No customer-facing premises"] }),
  definition({ code: "appointments", title: "Appointment or consultation request", journey: "contact", benefit: "Give customers a practical way to request a suitable appointment.", tradeoff: "Availability, time zones, cancellation rules and a responsible operator need to be agreed.", effort: "medium", signals: ["booking link", "consultation form", "external scheduler"], exclusions: ["Appointments explicitly not needed", "Emergency contact as the primary task"], alternatives: ["An external scheduler", "A request form", "Telephone booking"], operatingNeeds: ["Appointment owner", "Real availability"] }),
  definition({ code: "support_information", title: "Useful answers and support guidance", journey: "retain", benefit: "Answer recurring questions and show how to obtain human help.", tradeoff: "Answers need regular review; sensitive advice may require a qualified reviewer.", effort: "small", signals: ["FAQ", "support information", "help center"], alternatives: ["Clear service descriptions", "A maintained support channel"] }),
  definition({ code: "crm_handoff", title: "Reliable enquiry handoff", journey: "follow_up", benefit: "Give the responsible person enough context to track an enquiry through the next step.", tradeoff: "Confirm the current process before adding software; a simple shared process may be enough.", effort: "medium", requiresAny: [["service_enquiries", "appointments"]], signals: ["Respondent reports missed enquiries"], alternatives: ["A working existing CRM", "A shared inbox with an accountable process"], operatingNeeds: ["Responsible recipient", "Data handling and access policy"] }),
  definition({ code: "follow_up", title: "Consistent enquiry follow-up", journey: "follow_up", benefit: "Support an agreed response process when enquiries are being missed.", tradeoff: "Automation needs consent, a working recipient system and a human escalation path.", effort: "medium", requiresAny: [["service_enquiries", "appointments"]], requiresAll: ["crm_handoff"], alternatives: ["Tasks in the current CRM", "A maintained manual response checklist"], operatingNeeds: ["Response owner", "Appropriate communication permissions"] }),
  definition({ code: "analytics", title: "Measurement setup review", journey: "discover", benefit: "Establish a dependable baseline before judging improvement.", tradeoff: "Public HTML cannot confirm analytics accuracy; privacy requirements and ownership need review.", effort: "small", signals: ["Respondent-reported analytics status"], alternatives: ["Adequate existing analytics"], operatingNeeds: ["Authorized analytics access", "Privacy requirements"] }),
  definition({ code: "event_tracking", title: "Measure meaningful enquiry actions", journey: "contact", benefit: "Evaluate the actions that matter to the business rather than page views alone.", tradeoff: "A click does not prove an enquiry, booking or sale; avoid sending personal data into analytics.", effort: "medium", requiresAll: ["analytics"], requiresAny: [["service_enquiries", "appointments", "contact_actions"]], alternatives: ["Existing verified conversion measurement"], operatingNeeds: ["A defined success event", "Authorized measurement access"] }),
  definition({ code: "landing_pages", title: "Useful service landing pages", journey: "discover", benefit: "Match a distinct customer need to a focused, useful service explanation.", tradeoff: "Only create pages with distinct useful information; avoid duplicating location or keyword pages.", effort: "medium", requiresAll: ["service_clarity"], signals: ["Separate service needs"], alternatives: ["Clear sections on a single well-structured page"] }),
  definition({ code: "language_support", title: "Audience language assessment", journey: "evaluate", benefit: "Check whether the public content supports the languages customers actually use.", tradeoff: "Translation requires editorial review and ongoing maintenance; language demand must be established.", effort: "large", operatingNeeds: ["Confirmed audience language need", "Translation owner"], delivery: "assessment_only" }),
  definition({ code: "ai_assistant", title: "Assess assisted answers", journey: "retain", benefit: "Explore whether supported answers would reduce a confirmed repeated-question burden.", tradeoff: "An assistant can give incorrect answers; content ownership, human handoff, cost and quality evaluation are prerequisites.", effort: "large", requiresAll: ["support_information", "contact_actions"], exclusions: ["Sensitive medical or regulated advice", "No maintainable source content", "No human handoff"], operatingNeeds: ["Reviewed source content", "Human support owner", "Evaluation and maintenance budget"], delivery: "assessment_only" }),
  definition({ code: "whatsapp_automation", title: "Assess WhatsApp enquiry routing", journey: "follow_up", benefit: "Consider connecting an existing preferred channel to a responsible enquiry process.", tradeoff: "Requires channel permissions, consent, provider cost review and a human response path.", effort: "medium", requiresAny: [["service_enquiries", "contact_actions"]], alternatives: ["The current WhatsApp Business process"], operatingNeeds: ["Channel owner", "Contact permissions"], delivery: "assessment_only" }),
  definition({ code: "quotations", title: "Improve quotation requests", journey: "contact", benefit: "Collect the context needed to prepare an accurate custom quotation.", tradeoff: "Pricing rules and scope must be validated; do not promise instant prices for custom work.", effort: "medium", requiresAll: ["service_enquiries"], alternatives: ["Existing estimate request form", "A scoped consultation"] }),
  definition({ code: "reminders", title: "Appointment reminder assessment", journey: "retain", benefit: "Consider reminders when the business reports missed appointments.", tradeoff: "Needs accurate booking data, contact permission, rescheduling support and provider cost review.", effort: "medium", requiresAll: ["appointments"], operatingNeeds: ["Reliable booking data", "Valid communication permissions"], delivery: "assessment_only" }),
];

export function validateCatalog(catalog: readonly CapabilityDefinition[]): void {
  const byCode = new Map<string, CapabilityDefinition>();
  for (const item of catalog) {
    if (!/^[a-z][a-z0-9_]+$/.test(item.code) || byCode.has(item.code)) throw new Error(`Invalid or duplicate capability code: ${item.code}`);
    if (!/^\d+\.\d+\.\d+$/.test(item.version)) throw new Error(`Invalid catalog version: ${item.code}`);
    byCode.set(item.code, item);
  }
  for (const item of catalog) {
    const references = [...item.requiresAll, ...item.requiresAny.flat(), ...item.conflicts];
    for (const code of references) if (!byCode.has(code)) throw new Error(`Unknown capability reference: ${item.code} -> ${code}`);
    if (item.requiresAny.some((group) => group.length === 0)) throw new Error(`Empty prerequisite group: ${item.code}`);
  }
  const active = new Set<string>();
  const visited = new Set<string>();
  function visit(code: string) {
    if (active.has(code)) throw new Error(`Capability dependency cycle: ${code}`);
    if (visited.has(code)) return;
    active.add(code);
    const item = byCode.get(code)!;
    for (const dependency of [...item.requiresAll, ...item.requiresAny.flat()]) visit(dependency);
    active.delete(code);
    visited.add(code);
  }
  for (const code of byCode.keys()) visit(code);
}

validateCatalog(CAPABILITY_CATALOG);
export const CAPABILITIES = new Map(CAPABILITY_CATALOG.map((entry) => [entry.code, entry]));
