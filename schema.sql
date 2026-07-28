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
