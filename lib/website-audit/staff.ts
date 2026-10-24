import "server-only";
import { verifySessionFromCookies } from "@/lib/session";
import { auditPool } from "./database";
import { AuditError } from "./errors";
import { isAuditId } from "./validation";
import { PAGE_LIMIT, type AuditView, type PageObservation } from "./types";

export interface StaffAuditView extends AuditView {
  collectedPages: PageObservation[];
  collectionLimitations: string[];
}

export interface StaffAuditSummary {
  id: string;
  hostname: string;
  status: AuditView["status"];
  checked: number;
  discovered: number;
  revision: number;
  createdAt: string;
  expiresAt: string;
}

type StaffAuditRow = {
  id: string; url: string; hostname: string; status: AuditView["status"];
  stage: AuditView["stage"]; created_at: Date; updated_at: Date; expires_at: Date;
  revision: number; checked_count: number; discovered_count: number;
  assessment: AuditView["assessment"]; report: AuditView["report"];
  decisions: AuditView["decisions"]; error: string | null;
  pages: PageObservation[]; collection_limitations: string[];
};

// The anonymous audit cookie never grants access here. Recheck the signed
// invoice administration session at the data boundary, independently of proxy.
export async function requireAuditStaffSession(): Promise<void> {
  if (!process.env.INVOICE_PASSWORD?.trim() || !process.env.INVOICE_SESSION_SECRET?.trim()) {
    throw new AuditError("Viviz staff access is not configured. Please contact your administrator.", 503);
  }
  if (!(await verifySessionFromCookies())) throw new AuditError("Sign in to Viviz to view technical reports.", 401);
}

export async function listStaffAudits(): Promise<StaffAuditSummary[]> {
  await requireAuditStaffSession();
  const result = await auditPool().query<Pick<StaffAuditRow, "id" | "hostname" | "status" | "checked_count" | "discovered_count" | "revision" | "created_at" | "expires_at">>(
    "SELECT id,hostname,status,checked_count,discovered_count,revision,created_at,expires_at FROM website_audits WHERE status NOT IN ('expired','deleted') AND expires_at > now() ORDER BY created_at DESC LIMIT 50",
  );
  return result.rows.map((row) => ({
    id: row.id, hostname: row.hostname, status: row.status,
    checked: row.checked_count, discovered: row.discovered_count, revision: row.revision,
    createdAt: row.created_at.toISOString(), expiresAt: row.expires_at.toISOString(),
  }));
}

export async function getStaffAudit(id: string): Promise<StaffAuditView> {
  await requireAuditStaffSession();
  if (!isAuditId(id)) throw new AuditError("Technical report not found.", 404);
  // Do not select ownership credentials, IP hashes, or download contact data.
  const result = await auditPool().query<StaffAuditRow>(
    "SELECT id,url,hostname,status,stage,created_at,updated_at,expires_at,revision,checked_count,discovered_count,assessment,report,decisions,error,pages,collection_limitations FROM website_audits WHERE id=$1 AND status NOT IN ('expired','deleted') AND expires_at > now()",
    [id],
  );
  const row = result.rows[0];
  if (!row) throw new AuditError("Technical report not found or no longer available.", 404);
  return {
    id: row.id, url: row.url, hostname: row.hostname, status: row.status, stage: row.stage,
    createdAt: row.created_at.toISOString(), updatedAt: row.updated_at.toISOString(), expiresAt: row.expires_at.toISOString(),
    revision: row.revision, progress: { checked: row.checked_count, discovered: row.discovered_count, limit: PAGE_LIMIT },
    assessment: row.assessment, report: row.report, decisions: row.decisions, error: row.error,
    collectedPages: row.pages, collectionLimitations: row.collection_limitations,
  };
}
