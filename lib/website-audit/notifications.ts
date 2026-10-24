import "server-only";
import { Resend } from "resend";
import { auditPool } from "./database";

interface PendingEnquiry {
  id: string; name: string; email: string; phone: string; message: string;
  snapshot: { url: string; summary: string; recommendations: { title: string; action: string }[]; findings: { title: string; action: string }[] };
  notification_attempts: number;
}

export async function deliverAuditNotification(): Promise<void> {
  if (process.env.AUDIT_SEND_EMAIL !== "true" || !process.env.RESEND_API_KEY) return;
  const result = await auditPool().query<PendingEnquiry>(
    `UPDATE website_audit_enquiries SET notification_status='sending',notification_attempts=notification_attempts+1,notification_available_at=now()+INTERVAL '3 minutes'
     WHERE id=(SELECT id FROM website_audit_enquiries WHERE (notification_status IN ('pending','failed') OR (notification_status='sending' AND notification_available_at<now())) AND notification_attempts<4 AND notification_available_at<=now() ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *`,
  );
  const enquiry = result.rows[0];
  if (!enquiry) return;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // Resend forwards request options to fetch. Bound the actual request so the
    // scheduled free worker can finish and leave failed outbox entries retryable.
    const sendOptions = { idempotencyKey: `audit-enquiry-${enquiry.id}`, signal: AbortSignal.timeout(8000) };
    const selected = [...enquiry.snapshot.recommendations, ...enquiry.snapshot.findings].map((item) => `- ${item.title}\n  ${item.action}`).join("\n\n");
    const response = await resend.emails.send({
      from: process.env.AUDIT_FROM_EMAIL ?? "Viviz Website <onboarding@resend.dev>",
      to: process.env.AUDIT_TO_EMAIL ?? "viviztechnologies@gmail.com",
      replyTo: enquiry.email,
      subject: `Website improvement enquiry from ${enquiry.name.replace(/[\r\n]/g, " ")}`,
      text: `Website improvement enquiry\n\nReference: ${enquiry.id}\nName: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone || "Not provided"}\nWebsite: ${enquiry.snapshot.url}\n\n${enquiry.snapshot.summary}\n\nSelected improvements\n${selected || "General implementation discussion requested."}\n\nMessage\n${enquiry.message || "No additional message."}\n\nThe enquiry and selected assessment snapshot are retained in the private audit database.`,
    }, sendOptions);
    if (response.error) throw new Error("notification_failed");
    await auditPool().query("UPDATE website_audit_enquiries SET notification_status='sent' WHERE id=$1 AND notification_attempts=$2 AND notification_status='sending'", [enquiry.id, enquiry.notification_attempts]);
  } catch {
    await auditPool().query("UPDATE website_audit_enquiries SET notification_status='failed',notification_available_at=now()+INTERVAL '5 minutes' WHERE id=$1 AND notification_attempts=$2 AND notification_status='sending'", [enquiry.id, enquiry.notification_attempts]);
    console.error("Website audit enquiry notification needs retry.");
  }
}
