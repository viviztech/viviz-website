import type { AuditView, CustomerAuditView, CustomerReport, Finding } from "./types";

type GapCopy = { title: string; observation: string; why: string; action: string };
const GAP_COPY: Record<string, GapCopy> = {
  "http-response": { title: "Some pages did not open", observation: "Some pages returned an error when we tried to open them.", why: "Visitors may be unable to reach the information they need.", action: "Check those pages and restore them, or update the links to a suitable page." },
  "https-entry": { title: "Check the website's secure connection", observation: "The address entered for this audit did not use a secure connection.", why: "A secure connection helps protect information sent between a visitor and your website.", action: "Ask your website team to check the secure version and make sure visitors reach it automatically." },
  "checked-link-errors": { title: "Some links lead to an error page", observation: "We followed links in the checked pages and found destinations that did not open correctly.", why: "A broken link can stop a visitor from learning more or contacting you.", action: "Update those links or restore the pages they should open." },
  "collection-gaps": { title: "Some pages need another look", observation: "We could not read some of the pages we tried. They may be unavailable or restrict automated visits.", why: "We cannot draw conclusions about pages we could not read.", action: "Ask your website team to check these pages before deciding whether any changes are needed." },
  "html-title": { title: "Give each page a clear name", observation: "We did not find a page title in the content returned for some checked pages.", why: "A clear page name helps people recognize it in browser tabs and search results.", action: "Ask your website team to check these pages and add an accurate page title where needed." },
  "html-description": { title: "Help people understand pages before opening them", observation: "Some checked pages did not provide a short description for search services.", why: "A useful description can explain what a page offers. Search services may choose their own wording.", action: "Write a short, accurate description for each important page and ask your website team to add it." },
  "html-main-heading": { title: "Make each page's main message clear", observation: "We did not find a main heading in the returned content for some pages.", why: "A clear heading helps visitors understand what the page is about.", action: "Check the pages as visitors see them and give each one a useful main heading where needed." },
  "canonical-url": { title: "Help search services find the preferred page", observation: "Some behind-the-scenes page address information needs review.", why: "Search services need clear information about which version of a page you want people to find.", action: "Ask your website team to check and correct the preferred page address." },
  "structured-data-json": { title: "Correct information shared with search services", observation: "Some information prepared for search services could not be read correctly.", why: "Search services may be unable to use that information to understand your pages.", action: "Ask your website team to repair and check this information. This does not guarantee a special search listing." },
  "duplicate-title-review": { title: "Make different pages easier to tell apart", observation: "Some checked pages use the same page name. This can sometimes be intentional.", why: "Different page names help visitors recognize which page answers their question.", action: "Review the pages and use distinct names when they cover different subjects." },
  "noindex-review": { title: "Confirm which pages should appear in search", observation: "Some checked pages ask search services to leave them out of results. This may be intentional.", why: "A page intended for customers to discover may be harder to find if it is excluded.", action: "Confirm which pages should be public in search before asking your website team to change anything." },
  "image-alt-signal": { title: "Help more visitors understand your images", observation: "Some images did not include a written description in the returned content.", why: "People who cannot see an image may need a text explanation of its meaning.", action: "Describe useful images in words. Decorative images can be marked so reading tools skip them." },
  "html-language": { title: "Tell reading tools which language the page uses", observation: "Some checked pages did not clearly identify their language to reading tools.", why: "This helps tools pronounce content correctly for people who listen to a page.", action: "Ask your website team to set the correct page language." },
  "form-label-review": { title: "Make form questions easier to understand", observation: "Some form fields did not have a clear label in the content we could read. The visible page may provide more information.", why: "Visitors need to understand what to enter, including when using tools that read pages aloud.", action: "Check the actual form, give each question a clear label where needed, and confirm visitors can use it easily." },
  "accessibility-manual-journey": { title: "Check that more people can use the website", observation: "The automated review cannot tell whether every visitor can complete an important task.", why: "Some visitors navigate with a keyboard or tools that read pages aloud.", action: "Have someone test the main visitor tasks with a keyboard and reading tools, including forms and error messages." },
  "mobile-viewport": { title: "Check how pages fit on a phone", observation: "Some pages did not include a setting that helps them fit a phone screen.", why: "Visitors need readable content and usable controls on smaller screens.", action: "Ask your website team to check the setting and test the actual pages on phones." },
  "field-core-web-vitals": { title: "Some visitors may have a difficult loading experience", observation: "Available visitor experience measurements suggest that loading or page movement needs attention in the reported sample.", why: "Slow loading or moving content can make a page harder to use.", action: "Ask your website team to investigate the measured pages and compare visitor experience after improvements." },
  "offering-clarity-review": { title: "Explain your service more clearly", observation: "The checked content did not clearly establish what the service offers and who it helps.", why: "Visitors need to recognize whether your service suits their needs.", action: "Review the visible pages and explain what you offer, who it is for, and what to do next." },
  "customer-contact-route": { title: "Make the next step easy to find", observation: "We did not find a suitable way to take the intended next step in the checked content. Other pages or features may provide one.", why: "Interested visitors need a clear route to contact you, request an appointment, or ask for a demonstration.", action: "Check your existing contact options and make the most useful one easy to find on relevant pages." },
  "form-delivery-manual": { title: "Check that enquiries reach your team", observation: "We found public forms but did not submit them or confirm who receives the messages.", why: "A visible form is only useful if enquiries reach the right person and receive a response.", action: "With permission, send a harmless test enquiry and confirm receipt, the visitor's confirmation, and who will reply." },
};

const LOADING_COPY: GapCopy = { title: "Check how smoothly this page loads", observation: "A loading test found something worth investigating on a sampled page and device.", why: "A page that loads slowly or moves around can be difficult to use.", action: "Ask your website team to improve the main loading problem and repeat the same test. Results may vary between visits." };
const GENERIC_COPY: GapCopy = { title: "Ask your website team to review this area", observation: "An automated check found an area that needs a closer look.", why: "A review can help decide whether a change would make the website easier to use.", action: "Ask your website team to review the supporting checks and agree the smallest useful change." };

const ADDITIONS: Record<string, { title: string; action: string }> = {
  service_clarity: { title: "Explain your services clearly", action: "Explain what you offer, who you help, and how someone can take the next step." },
  service_enquiries: { title: "Make it easy to ask about a service", action: "Review your current contact options and give interested visitors a clear way to ask about the right service." },
  qualification_forms: { title: "Ask useful questions when someone contacts you", action: "Keep enquiry forms short and ask only for the information your team needs for a helpful first reply." },
  case_studies: { title: "Show examples of your work", action: "With customer permission, show relevant work examples and explain what your team did." },
  process_guidance: { title: "Explain what happens after an enquiry", action: "Describe the real steps a customer can expect after contacting your team." },
  contact_actions: { title: "Put contact options where visitors need them", action: "Make a monitored contact option easy to find on important pages." },
  service_areas: { title: "Show where your services are available", action: "Clearly list the places your business actually serves." },
  visit_information: { title: "Help customers plan a visit", action: "Where customer visits are appropriate, keep your location, opening hours, and directions accurate." },
  appointments: { title: "Make appointment requests easier", action: "Check your existing booking process and offer a clear appointment request option if it suits your business." },
  support_information: { title: "Answer common customer questions", action: "Publish useful answers to recurring questions and explain how to reach a person for help." },
  crm_handoff: { title: "Keep track of incoming enquiries", action: "Agree who receives each enquiry and how your team tracks the next step. Check existing tools before adding software." },
  follow_up: { title: "Help your team follow up consistently", action: "Agree who responds and how follow-up tasks are tracked. Use your existing tools where they are suitable." },
  analytics: { title: "Understand how people use your website", action: "Have your website team review how visits are measured, with appropriate privacy choices, before adding anything new." },
  event_tracking: { title: "Understand which visits lead to useful actions", action: "Review how completed enquiries or bookings are counted. Clicking a button does not prove an enquiry was received." },
  landing_pages: { title: "Give different services the explanation they need", action: "Create a focused service page only where it answers a distinct customer need." },
  ai_assistant: { title: "Explore help with common questions", action: "First check your help content and human support process. Then assess whether a limited assistant would be useful." },
  whatsapp_automation: { title: "Review how WhatsApp conversations reach your team", action: "Check your current WhatsApp process, communication permissions, and human follow-up before considering automation." },
  reminders: { title: "Help customers remember appointments", action: "Check whether your current booking tool can send appropriate reminders with customer permission." },
  language_support: { title: "Help customers in the languages they use", action: "Confirm which languages customers need and how translated information will stay accurate." },
};

/** Translate common jargon in otherwise useful business wording. */
function plainWords(value: string): string {
  return value.replace(/\bCRM\b/g, "enquiry tracking system").replace(/\bCTA\b/g, "next-step button")
    .replace(/\bSEO\b/g, "search visibility").replace(/\bconversion rates?\b/gi, "completed customer actions")
    .replace(/\binstrumentation\b/gi, "measurement setup").replace(/\bindexable\b/gi, "intended to appear in search")
    .replace(/\brespondent(?:-reported)?\b/gi, "provided by you").replace(/\bhandoff\b/gi, "transfer to the right person");
}

function pageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
    url.search = ""; url.hash = "";
    return url.href;
  } catch { return null; }
}

function gapCopy(finding: Finding): GapCopy {
  const code = finding.rule.split("@")[0];
  return GAP_COPY[code] ?? (code.startsWith("lab-performance-") ? LOADING_COPY : GENERIC_COPY);
}

/** Build an allowlisted customer DTO, including for previously stored reports. */
export function toCustomerAudit(audit: AuditView): CustomerAuditView {
  let customer: CustomerReport | null = null;
  const report = audit.report;
  if (report) {
    const readable = report.pages.filter(page => page.status === "fetched" && page.statusCode !== null && page.statusCode >= 200 && page.statusCode < 300);
    const ai = readable.length ? report.aiAnalysis : undefined;
    const evidencePages = (ids: string[]) => [...new Set(ids.flatMap(id => {
      const page = /^p[1-9]\d*$/.test(id) ? report.pages[Number(id.slice(1)) - 1] : undefined;
      const urls = page ? [page.url] : report.findings.find(item => item.id === id)?.evidence.map(item => item.url) ?? [];
      return urls.map(pageUrl).filter((url): url is string => Boolean(url));
    }))].slice(0, 6);
    const gaps: CustomerReport["gaps"] = report.findings.map(finding => {
      const copy = gapCopy(finding);
      const explanation = ai?.findingExplanations.find(item => item.findingId === finding.id);
      // The factual observation and its uncertainty use reviewed copy. AI can
      // contextualize the meaning/action without replacing what the check found.
      return { id: finding.id, title: plainWords(explanation?.title ?? copy.title), observation: copy.observation,
        why: plainWords(explanation?.why ?? copy.why), action: plainWords(explanation?.action ?? copy.action), priority: finding.severity, confidence: finding.confidence,
        pages: [...new Set(finding.evidence.map(item => pageUrl(item.url)).filter((url): url is string => Boolean(url)))].slice(0, 6) };
    });
    const improvements: CustomerReport["improvements"] = report.recommendations.map(item => {
      const copy = ADDITIONS[item.code] ?? { title: "Review a useful addition", action: "Discuss whether this addition supports a real customer need before making changes." };
      const explanation = ai?.recommendationExplanations.find(edit => edit.recommendationId === item.id);
      const reported = item.evidence.some(evidence => evidence.detail.startsWith("Respondent-reported"));
      const reason = reported ? "Your business answers suggest this area is worth reviewing. Confirm how your current process works before adding tools."
        : "The checked pages suggest this could help the visitor's next step. Confirm whether your existing pages or tools already cover it.";
      const prerequisiteStatus = { satisfied: "already found or reported", planned: "plan this first", unresolved: "needs confirming", blocked: "resolve this before proceeding" };
      return { id: item.id, code: item.code, title: plainWords(explanation?.title ?? copy.title), reason: plainWords(explanation?.reason ?? reason),
        benefit: plainWords(explanation?.benefit ?? item.benefit), action: plainWords(explanation?.action ?? copy.action), tradeoff: plainWords(explanation?.tradeoff ?? item.tradeoff),
        sequence: item.sequence, level: item.level, confidence: item.confidence,
        prerequisites: item.prerequisites.map(need => `${plainWords(need.label)}: ${prerequisiteStatus[need.state]}.`) };
    });
    const mainTask = { unknown: "Confirm the main thing you want visitors to do.", enquiry: "Help interested visitors contact your team.", booking: "Help visitors request an appointment.", purchase: "Help visitors understand your offer and make a purchase.", demo: "Help interested visitors request a demonstration.", information: "Help visitors find the information they need." };
    const strengths = ai?.strengths.map(item => plainWords(item.text)) ?? [];
    if (!strengths.length && readable.length) {
      if (readable.some(page => page.forms.length || page.links.some(link => /contact|enquir|book/i.test(link.text)))) strengths.push("We found a way for visitors to contact or take a next step. Your team still needs to confirm that messages or bookings reach the right person.");
      if (readable.every(page => page.title.trim())) strengths.push("The pages we could read have names that help people identify them.");
      if (!strengths.length) strengths.push("We could read public content and use it to prepare the improvement plan below.");
    }
    const illustrative = audit.id === "example" ? "This is a fictional example, not a live website review. " : "";
    customer = {
      summary: ai ? plainWords(ai.summary) : readable.length ? "Here is a practical starting point for making your website easier to understand and use. Review the areas below, then choose the changes that matter to your customers."
        : "We could not read enough public content to assess this website. Ask your website team to review access before drawing conclusions about gaps.",
      businessContext: mainTask[report.mainTask], strengths, gaps, improvements,
      ideas: ai?.insights.map(item => ({ id: item.id, title: plainWords(item.title), reason: plainWords(item.reason), suggestion: plainWords(item.suggestion), question: plainWords(item.question), pages: evidencePages(item.evidenceIds) })) ?? [],
      nextSteps: ai?.nextSteps.map(plainWords) ?? ["Review the most important areas above with your website team.", "Choose improvements that support your customers and check whether existing tools can help.", "Test the important visitor tasks after changes and check that enquiries reach the right person."],
      scopeNote: `${illustrative}We could read ${readable.length} of ${report.pages.length} attempted public pages, within a limit of ${audit.progress.limit}. This is a sample of the website. We did not sign in, submit forms, book appointments or make purchases. Some content may appear only after the page runs in a browser. Not finding a feature in this sample does not prove your business lacks it. Phone layout, accessibility and internal processes need human review.${report.performance.some(run => run.status === "measured") ? " Loading tests cover only the sampled pages and devices." : report.fieldPerformance.status === "measured" ? " Available loading information comes from a sample of real visits; a separate loading test was not run." : " Loading speed was not measured."}${ai ? " AI suggestions are ideas to confirm, not independently verified facts or current market trends." : ""}`,
      analysisMode: ai ? "ai_assisted" : "rules",
    };
  }
  return { id: audit.id, url: pageUrl(audit.url) ?? "", hostname: audit.hostname, status: audit.status, stage: audit.stage,
    createdAt: audit.createdAt, updatedAt: audit.updatedAt, expiresAt: audit.expiresAt, revision: audit.revision,
    progress: { checked: audit.progress.checked, discovered: audit.progress.discovered, limit: audit.progress.limit },
    assessment: structuredClone(audit.assessment), decisions: { ...audit.decisions },
    error: !audit.error ? null : audit.status === "canceled" ? "This review was canceled. Start a new review when you are ready."
      : audit.status === "partial" ? "Some parts of the review could not finish. The available results are shown below."
      : "We could not complete this review. Check that your website opens publicly and try again.", report: customer };
}
