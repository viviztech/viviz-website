-- Additive audit workspace. Run with: npm run audit:migrate
-- Does not change the invoice, employee or payment tables.
CREATE TABLE IF NOT EXISTS website_audits (
  id UUID PRIMARY KEY,
  owner_hash TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  url TEXT NOT NULL,
  hostname TEXT NOT NULL,
  origin TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','complete','partial','failed','canceled','expired','deleted')),
  stage TEXT NOT NULL DEFAULT 'queued',
  checked_count INTEGER NOT NULL DEFAULT 0,
  discovered_count INTEGER NOT NULL DEFAULT 0,
  assessment JSONB NOT NULL,
  pages JSONB NOT NULL DEFAULT '[]',
  collection_limitations JSONB NOT NULL DEFAULT '[]',
  report JSONB,
  decisions JSONB NOT NULL DEFAULT '{}',
  revision INTEGER NOT NULL DEFAULT 1,
  error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  lease_token UUID,
  lease_expires_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '30 days',
  UNIQUE(owner_hash, idempotency_key)
);
CREATE INDEX IF NOT EXISTS website_audits_queue_idx ON website_audits(status, created_at);
CREATE INDEX IF NOT EXISTS website_audits_owner_idx ON website_audits(owner_hash, created_at);
CREATE INDEX IF NOT EXISTS website_audits_ip_idx ON website_audits(ip_hash, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS website_audits_active_owner_idx ON website_audits(owner_hash) WHERE status IN ('queued','running');
CREATE UNIQUE INDEX IF NOT EXISTS website_audits_active_origin_idx ON website_audits(origin) WHERE status IN ('queued','running');

CREATE TABLE IF NOT EXISTS website_audit_workers (
  id TEXT PRIMARY KEY,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS website_audit_assessment_revisions (
  audit_id UUID NOT NULL REFERENCES website_audits(id) ON DELETE CASCADE,
  revision INTEGER NOT NULL,
  assessment JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (audit_id, revision)
);

CREATE TABLE IF NOT EXISTS website_audit_enquiries (
  id UUID PRIMARY KEY,
  audit_id UUID REFERENCES website_audits(id) ON DELETE SET NULL,
  owner_hash TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  assessment_revision INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  snapshot JSONB NOT NULL,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notification_status TEXT NOT NULL DEFAULT 'pending' CHECK (notification_status IN ('pending','sending','sent','held','failed')),
  notification_attempts INTEGER NOT NULL DEFAULT 0,
  notification_available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(owner_hash, idempotency_key)
);
CREATE INDEX IF NOT EXISTS website_audit_enquiries_delivery_idx ON website_audit_enquiries(notification_status, notification_available_at);
