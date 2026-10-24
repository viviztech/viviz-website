-- Aggregate request reservations only: no report content or customer identifiers.
-- Failed provider requests consume a reservation too. UTC daily windows and
-- minute windows are reserved together under a transaction advisory lock.
CREATE TABLE IF NOT EXISTS website_audit_ai_usage (
  window_kind TEXT NOT NULL CHECK (window_kind IN ('day', 'minute')),
  window_start TIMESTAMPTZ NOT NULL,
  requests INTEGER NOT NULL CHECK (requests >= 0),
  PRIMARY KEY (window_kind, window_start)
);
