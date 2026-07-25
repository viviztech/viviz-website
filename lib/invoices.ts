import "server-only";
import { getSql } from "@/lib/db";
import { calculateTotals, type InvoiceLineItem } from "@/lib/invoice-calc";
import { fromPaise } from "@/lib/money";

export type { InvoiceLineItem };

export interface InvoiceRecord {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientAddress: string;
  clientGstin: string | null;
  clientStateCode: string;
  invoiceDate: string;
  dueDate: string | null;
  lineItems: InvoiceLineItem[];
  gstRate: number;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  notes: string | null;
  createdAt: string;
}

export interface CreateInvoiceInput {
  clientName: string;
  clientAddress: string;
  clientGstin?: string | null;
  clientStateCode: string;
  invoiceDate: string;
  dueDate?: string | null;
  lineItems: InvoiceLineItem[];
  gstRate: number;
  notes?: string | null;
}

export function formatInvoiceNumber(id: number): string {
  return `VZ-INV-${String(id).padStart(4, "0")}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): InvoiceRecord {
  return {
    id: row.id,
    invoiceNumber: formatInvoiceNumber(row.id),
    clientName: row.client_name,
    clientAddress: row.client_address,
    clientGstin: row.client_gstin,
    clientStateCode: row.client_state_code,
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    lineItems:
      typeof row.line_items === "string" ? JSON.parse(row.line_items) : row.line_items,
    gstRate: Number(row.gst_rate),
    subtotal: Number(row.subtotal),
    cgst: Number(row.cgst),
    sgst: Number(row.sgst),
    igst: Number(row.igst),
    total: Number(row.total),
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function createInvoice(input: CreateInvoiceInput): Promise<InvoiceRecord> {
  // Totals are always recomputed here, server-side, from the line items —
  // any subtotal/tax/total fields submitted by the client are ignored.
  const totals = calculateTotals(input.lineItems, input.gstRate, input.clientStateCode);
  const sql = getSql();

  const rows = await sql`
    INSERT INTO invoices (
      client_name, client_address, client_gstin, client_state_code,
      invoice_date, due_date, line_items, gst_rate,
      subtotal, cgst, sgst, igst, total, notes
    ) VALUES (
      ${input.clientName}, ${input.clientAddress}, ${input.clientGstin ?? null}, ${input.clientStateCode},
      ${input.invoiceDate}, ${input.dueDate ?? null}, ${JSON.stringify(input.lineItems)}::jsonb, ${input.gstRate},
      ${fromPaise(totals.subtotalPaise)}, ${fromPaise(totals.cgstPaise)}, ${fromPaise(totals.sgstPaise)},
      ${fromPaise(totals.igstPaise)}, ${fromPaise(totals.totalPaise)}, ${input.notes ?? null}
    )
    RETURNING *
  `;

  return mapRow(rows[0]);
}

export async function listInvoices(): Promise<InvoiceRecord[]> {
  const rows = await getSql()`SELECT * FROM invoices ORDER BY id DESC`;
  return rows.map(mapRow);
}

export async function getInvoiceById(id: number): Promise<InvoiceRecord | null> {
  const rows = await getSql()`SELECT * FROM invoices WHERE id = ${id}`;
  return rows[0] ? mapRow(rows[0]) : null;
}
