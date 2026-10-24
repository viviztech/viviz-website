export const AUDIT_VERSION = "1.0.0";
export const PAGE_LIMIT = 25;
export const AUDIT_RETENTION_DAYS = 30;

export type AuditStatus = "queued" | "running" | "complete" | "partial" | "failed" | "canceled" | "expired" | "deleted";
export type AuditStage = "queued" | "discovering" | "checking" | "measuring" | "recommending" | "finished";
export type Category = "technical" | "seo" | "performance" | "accessibility" | "mobile" | "content" | "conversion";
export type Confidence = "high" | "medium" | "low";
export type BusinessType = "unknown" | "b2b_service" | "local_service" | "ecommerce" | "saas" | "publisher" | "real_estate" | "education" | "manufacturing" | "healthcare";
export type CustomerTask = "unknown" | "enquiry" | "booking" | "purchase" | "demo" | "information";
export type ToolState = "unknown" | "none" | "adequate" | "needs_improvement";
export type RecommendationDecision = "included" | "not_relevant" | "later";

export interface BusinessAssessment {
  businessType: BusinessType;
  customerType: "unknown" | "b2b" | "b2c" | "both";
  mainTask: CustomerTask;
  goals: string[];
  painPoints: string[];
  tools: { crm: ToolState; booking: ToolState; analytics: ToolState; whatsapp: ToolState };
  appointmentsNeeded: "unknown" | "yes" | "no";
  teamSize: "unknown" | "solo" | "multiple";
}

export const EMPTY_ASSESSMENT: BusinessAssessment = {
  businessType: "unknown", customerType: "unknown", mainTask: "unknown", goals: [], painPoints: [],
  tools: { crm: "unknown", booking: "unknown", analytics: "unknown", whatsapp: "unknown" },
  appointmentsNeeded: "unknown", teamSize: "unknown",
};

export interface BusinessFact {
  key: string;
  value: string;
  source: "public_measurement" | "public_content" | "respondent_report" | "inference";
  reference: string;
  confidence: Confidence;
}

export interface PageObservation {
  url: string;
  status: "fetched" | "blocked" | "failed" | "skipped";
  statusCode: number | null;
  fetchedAt: string;
  title: string;
  description: string;
  h1: string[];
  language: string;
  canonical: string;
  viewport: string;
  robotsMeta: string;
  text: string;
  links: { url: string; text: string }[];
  images: { src: string; alt: string | null; width: string | null; height: string | null }[];
  forms: { action: string; inputs: { name: string; type: string; label: string; required: boolean }[] }[];
  structuredData: { valid: boolean; types: string[] }[];
  headers: Record<string, string>;
  error?: string;
  rendered: boolean;
}

export interface PerformanceObservation {
  url: string;
  device: "mobile" | "desktop";
  status: "measured" | "unavailable";
  fetchedAt: string;
  lighthouseVersion?: string;
  scores?: { performance: number | null; accessibility: number | null; seo: number | null; bestPractices: number | null };
  metrics?: { lcpMs: number | null; cls: number | null; tbtMs: number | null };
  diagnostics?: { id: string; title: string; detail: string }[];
  error?: string;
}

export interface FieldPerformance {
  status: "measured" | "unavailable";
  device?: "mobile" | "desktop" | "all";
  percentile?: 75;
  scope?: "url" | "origin";
  url?: string;
  startDate?: string;
  endDate?: string;
  lcpMs?: number;
  inpMs?: number;
  cls?: number;
  reason?: string;
}

export interface Finding {
  id: string;
  rule: string;
  category: Category;
  type: "issue" | "opportunity" | "manual_review";
  severity: "high" | "medium" | "low" | "info";
  confidence: Confidence;
  title: string;
  observation: string;
  why: string;
  action: string;
  verification: string;
  effort: "small" | "medium" | "large";
  evidence: { url: string; detail: string }[];
  affectedCount: number;
  checkedCount: number;
}

export interface CategorySummary {
  category: Category;
  label: string;
  score: number | null;
  assessed: number;
  applicable: number;
  passed: number;
  coverage: "assessed" | "limited" | "unavailable";
  note: string;
}

export interface CapabilityObservation {
  code: string;
  state: "present" | "partial" | "not_observed" | "unknown" | "not_applicable";
  detail: string;
  evidence: { url: string; detail: string }[];
}

export interface ModuleSuggestion {
  id: string;
  code: string;
  title: string;
  level: "essential" | "recommended" | "optional" | "not_needed_now";
  confidence: Confidence;
  journey: "discover" | "evaluate" | "contact" | "follow_up" | "retain";
  reason: string;
  benefit: string;
  currentAlternative: string;
  action: string;
  prerequisites: { label: string; state: "satisfied" | "planned" | "unresolved" | "blocked" }[];
  effort: "small" | "medium" | "large";
  sequence: "fix_first" | "improve_next" | "consider_later";
  verification: string;
  tradeoff: string;
  evidence: { url: string; detail: string }[];
  ruleIds: string[];
  delivery: "assessment_only" | "custom_implementation";
}

export interface AuditReport {
  version: string;
  generatedAt: string;
  businessType: BusinessType;
  mainTask: CustomerTask;
  specialistCoverage: "specialist" | "general";
  summary: string;
  facts: BusinessFact[];
  categories: CategorySummary[];
  findings: Finding[];
  capabilities: CapabilityObservation[];
  recommendations: ModuleSuggestion[];
  readiness: { label: string; state: "unknown" | "foundation_needed" | "existing_process" | "supported"; basis: string }[];
  pages: PageObservation[];
  performance: PerformanceObservation[];
  fieldPerformance: FieldPerformance;
  limitations: string[];
  collectionMode: "html" | "rendered";
  explanationMode: "rules" | "ai_assisted";
}

export interface AuditView {
  id: string;
  url: string;
  hostname: string;
  status: AuditStatus;
  stage: AuditStage;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  revision: number;
  progress: { checked: number; discovered: number; limit: number };
  assessment: BusinessAssessment;
  report: AuditReport | null;
  decisions: Record<string, RecommendationDecision>;
  error: string | null;
}

export interface AnalyzeInput {
  url: string;
  pages: PageObservation[];
  assessment: BusinessAssessment;
  performance?: PerformanceObservation[];
  fieldPerformance?: FieldPerformance;
  limitations?: string[];
}

export interface CrawlProgress {
  stage: AuditStage;
  checked: number;
  discovered: number;
  pages: PageObservation[];
}

export interface CrawlResult {
  pages: PageObservation[];
  discovered: number;
  limitations: string[];
  performance: PerformanceObservation[];
  fieldPerformance: FieldPerformance;
}
