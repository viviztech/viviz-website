-- PDF contact capture is separate from implementation enquiries.
-- Contacts expire with their private report and are removed on report deletion.
CREATE TABLE IF NOT EXISTS website_audit_report_downloads (
  id UUID PRIMARY KEY,
  audit_id UUID NOT NULL REFERENCES website_audits(id) ON DELETE CASCADE,
  owner_hash TEXT NOT NULL,
  idempotency_key VARCHAR(80) NOT NULL,
  request_hash TEXT NOT NULL,
  report_revision INTEGER NOT NULL CHECK (report_revision > 0),
  name VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2),
  email VARCHAR(254) NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(owner_hash, idempotency_key)
);
CREATE INDEX IF NOT EXISTS website_audit_report_downloads_audit_idx ON website_audit_report_downloads(audit_id);
CREATE INDEX IF NOT EXISTS website_audit_report_downloads_expiry_idx ON website_audit_report_downloads(expires_at);
