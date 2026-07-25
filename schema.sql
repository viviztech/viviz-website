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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice numbers are derived from `id` at read time (e.g. VZ-INV-0007), not
-- stored. Under GST rules, corrections should be issued as new invoices or
-- credit/debit notes, not edits to an existing row -- this table intentionally
-- has no update path for financial fields.
