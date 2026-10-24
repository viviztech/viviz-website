import { analyzeWebsite } from "./analyze";
import type { AuditView, BusinessAssessment, PageObservation } from "./types";

const at = "2026-10-24T06:00:00.000Z";
const origin = "https://northstarstudio.example";
const assessment: BusinessAssessment = {
  businessType: "b2b_service", customerType: "b2b", mainTask: "enquiry",
  goals: ["more_enquiries", "save_time"], painPoints: ["missed_enquiries", "slow_follow_up"],
  tools: { crm: "none", booking: "unknown", analytics: "needs_improvement", whatsapp: "unknown" },
  appointmentsNeeded: "no", teamSize: "multiple",
};
const page = (path: string, extra: Partial<PageObservation>): PageObservation => ({
  url: `${origin}${path}`, status: "fetched", statusCode: 200, fetchedAt: at,
  title: "", description: "", h1: [], language: "en", canonical: `${origin}${path}`,
  viewport: "width=device-width, initial-scale=1", robotsMeta: "", text: "", links: [],
  images: [], forms: [], structuredData: [], headers: { "content-type": "text/html" }, rendered: false, ...extra,
});
const pages = [
  page("/", {
    title: "Northstar Studio | Design for growing businesses", description: "Brand and website design for small professional service companies.", h1: ["Design for your next chapter"],
    text: "We provide brand and website design for small professional service companies. Our services include visual identity, marketing websites and useful customer experiences. We help businesses explain what they do and make a confident impression. Speak to our team about the next stage of your business.",
    links: [{ url: `${origin}/services`, text: "Our services" }, { url: `${origin}/contact`, text: "Contact us" }, { url: `${origin}/about`, text: "About the studio" }],
    images: [{ src: `${origin}/images/studio-team.jpg`, alt: null, width: "1200", height: "800" }],
  }),
  page("/services", {
    h1: ["Thoughtful design for ambitious businesses"],
    text: "Our services cover branding and website design. We work with professional service companies to clarify their offer and communicate with their customers. Each project is scoped to the needs of the business. Our team can discuss what would help and prepare a proposal after an introductory conversation.",
    links: [{ url: `${origin}/contact`, text: "Start a conversation" }, { url: `${origin}/`, text: "Home" }],
  }),
  page("/contact", {
    title: "Contact Northstar Studio", description: "Tell our design team how we can help.", h1: ["Let's talk"],
    text: "Tell our team how we can help your business. You can leave your name and email using the form below and we will contact you to discuss the project. We work with small professional service companies on branding and customer-facing websites. This is an introductory enquiry and does not create a project agreement.",
    links: [{ url: `${origin}/`, text: "Home" }],
    forms: [{ action: "/contact", inputs: [{ name: "name", type: "text", label: "Name", required: true }, { name: "email", type: "email", label: "", required: true }] }],
  }),
  page("/about", { statusCode: 404, title: "Page not found", h1: ["Page not found"], text: "The requested page could not be found." }),
];

/** Fictional example. This domain was never contacted and these are not live measurements. */
export const SAMPLE_AUDIT: AuditView = {
  id: "example", url: `${origin}/`, hostname: "northstarstudio.example", status: "complete", stage: "finished",
  createdAt: at, updatedAt: at, expiresAt: "2099-01-01T00:00:00.000Z", revision: 1,
  progress: { checked: pages.length, discovered: pages.length, limit: 25 }, assessment,
  report: {
    ...analyzeWebsite({ url: `${origin}/`, pages, assessment, limitations: ["ILLUSTRATIVE EXAMPLE: all pages, answers and observations are fictional. No request was sent to northstarstudio.example."] }),
    generatedAt: at,
  },
  decisions: {}, error: null,
};
