-- Run this once against your Neon / Vercel Postgres database before using
-- the invoice generator, e.g.: psql "$DATABASE_URL" -f schema.sql

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_address TEXT NOT NULL,
  client_gstin TEXT,
  client_state_code TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  -- [{ description, hsnSac?, quantity, rate }]
  line_items JSONB NOT NULL,
  gst_rate NUMERIC(5, 2) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  cgst NUMERIC(12, 2) NOT NULL,
  sgst NUMERIC(12, 2) NOT NULL,
  igst NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  document_type TEXT NOT NULL DEFAULT 'invoice' CHECK (document_type IN ('invoice', 'proforma')),
  converted_to_invoice_id INTEGER REFERENCES invoices(id)
);

-- Invoice numbers are derived from `id` at read time (e.g. VZ-INV-0007), not
-- stored. Note: under GST rules, corrections should technically be issued as
-- credit/debit notes rather than silent edits to an already-issued invoice --
-- editing here is unrestricted (any invoice, any time) by explicit choice.
--
-- Proforma invoices share this same table and id sequence (document_type =
-- 'proforma', numbered VZ-PF-####). When a proforma is converted, a new
-- 'invoice' row is created and converted_to_invoice_id is set on the
-- original proforma row to point at it.

-- Migration for an existing database created before proforma support was
-- added (safe to re-run -- IF NOT EXISTS also skips the inline constraint
-- when the column is already present):
--   ALTER TABLE invoices ADD COLUMN IF NOT EXISTS document_type TEXT NOT NULL DEFAULT 'invoice' CHECK (document_type IN ('invoice', 'proforma'));
--   ALTER TABLE invoices ADD COLUMN IF NOT EXISTS converted_to_invoice_id INTEGER REFERENCES invoices(id);

-- SabPaisa "Pay Now" transactions. One row per attempt, created with status
-- 'INITIATED' right before the browser is redirected to SabPaisa, then
-- updated when SabPaisa redirects back through /api/pay/callback.
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  client_txn_id TEXT NOT NULL UNIQUE,
  sabpaisa_txn_id TEXT,
  payer_name TEXT NOT NULL,
  payer_email TEXT NOT NULL,
  payer_mobile TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  paid_amount NUMERIC(12, 2),
  status TEXT NOT NULL DEFAULT 'INITIATED',
  payment_mode TEXT,
  bank_name TEXT,
  status_code TEXT,
  -- Full decrypted response object from SabPaisa, kept for support/reconciliation.
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Employee onboarding records used by the protected HR workspace. Offer
-- letters are rendered from the current record, so corrections made by an
-- administrator are reflected the next time the PDF is generated.
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  employee_code TEXT UNIQUE,
  full_name TEXT NOT NULL,
  personal_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
  work_location TEXT NOT NULL,
  joining_date DATE NOT NULL,
  annual_ctc NUMERIC(12, 2) NOT NULL CHECK (annual_ctc >= 0),
  probation_months INTEGER NOT NULL DEFAULT 3 CHECK (probation_months BETWEEN 0 AND 24),
  reporting_manager TEXT,
  status TEXT NOT NULL DEFAULT 'offer_drafted' CHECK (status IN ('offer_drafted', 'offer_sent', 'accepted', 'joined')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
