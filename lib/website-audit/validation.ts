import { z } from "zod";
import { EMPTY_ASSESSMENT } from "./types";

const tool = z.enum(["unknown", "none", "adequate", "needs_improvement"]);
export const assessmentSchema = z.object({
  businessType: z.enum(["unknown", "b2b_service", "local_service", "ecommerce", "saas", "publisher", "real_estate", "education", "manufacturing", "healthcare"]).default("unknown"),
  customerType: z.enum(["unknown", "b2b", "b2c", "both"]).default("unknown"),
  mainTask: z.enum(["unknown", "enquiry", "booking", "purchase", "demo", "information"]).default("unknown"),
  goals: z.array(z.enum(["more_enquiries", "more_bookings", "more_sales", "better_usability", "save_time"])).max(3).default([]),
  painPoints: z.array(z.enum(["missed_enquiries", "slow_follow_up", "manual_work", "unclear_offer", "low_trust", "repeated_questions", "missed_appointments", "scheduling_difficulty", "multilingual_need"])).max(3).default([]),
  tools: z.object({ crm: tool.default("unknown"), booking: tool.default("unknown"), analytics: tool.default("unknown"), whatsapp: tool.default("unknown") }).default(EMPTY_ASSESSMENT.tools),
  appointmentsNeeded: z.enum(["unknown", "yes", "no"]).default("unknown"),
  teamSize: z.enum(["unknown", "solo", "multiple"]).default("unknown"),
}).strict();

export const idempotencyKeySchema = z.string().min(12).max(80).regex(/^[a-zA-Z0-9_-]+$/);
export const createAuditSchema = z.object({
  url: z.string().trim().min(1).max(2048),
  idempotencyKey: idempotencyKeySchema,
  assessment: assessmentSchema.optional(),
}).strict();

export const updateAssessmentSchema = z.object({ revision: z.number().int().positive(), assessment: assessmentSchema }).strict();
export const decisionSchema = z.object({
  revision: z.number().int().positive(), decision: z.enum(["included", "not_relevant", "later"]),
}).strict();
export const enquirySchema = z.object({
  revision: z.number().int().positive(),
  idempotencyKey: idempotencyKeySchema,
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(40).regex(/^[\d+() .-]*$/).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),
  consent: z.literal(true),
  selectedFindingIds: z.array(z.string().min(1).max(100)).max(30).optional().default([]),
}).strict();

export function isAuditId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
