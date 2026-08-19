import "server-only";
import { getSql } from "@/lib/db";
import type { SabPaisaResponse } from "@/lib/sabpaisa";

export interface PaymentRecord {
  id: number;
  clientTxnId: string;
  sabpaisaTxnId: string | null;
  payerName: string;
  payerEmail: string;
  payerMobile: string;
  amount: number;
  paidAmount: number | null;
  status: string;
  paymentMode: string | null;
  bankName: string | null;
  statusCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  clientTxnId: string;
  amount: number;
  payerName: string;
  payerEmail: string;
  payerMobile: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): PaymentRecord {
  return {
    id: row.id,
    clientTxnId: row.client_txn_id,
    sabpaisaTxnId: row.sabpaisa_txn_id,
    payerName: row.payer_name,
    payerEmail: row.payer_email,
    payerMobile: row.payer_mobile,
    amount: Number(row.amount),
    paidAmount: row.paid_amount == null ? null : Number(row.paid_amount),
    status: row.status,
    paymentMode: row.payment_mode,
    bankName: row.bank_name,
    statusCode: row.status_code,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

export async function createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
  const rows = await getSql()`
    INSERT INTO payments (client_txn_id, amount, payer_name, payer_email, payer_mobile)
    VALUES (${input.clientTxnId}, ${input.amount}, ${input.payerName}, ${input.payerEmail}, ${input.payerMobile})
    RETURNING *
  `;
  return mapRow(rows[0]);
}

export async function getPaymentByClientTxnId(clientTxnId: string): Promise<PaymentRecord | null> {
  const rows = await getSql()`SELECT * FROM payments WHERE client_txn_id = ${clientTxnId}`;
  return rows[0] ? mapRow(rows[0]) : null;
}

// Applies SabPaisa's decrypted callback response to the matching payment
// row. Looks up by clientTxnId (ours) rather than trusting any id in the
// response to decide which row to touch.
export async function applyPaymentResponse(
  response: SabPaisaResponse
): Promise<PaymentRecord | null> {
  const clientTxnId = response.clientTxnId;
  if (!clientTxnId) return null;

  const rows = await getSql()`
    UPDATE payments SET
      sabpaisa_txn_id = ${response.sabpaisaTxnId ?? null},
      status = ${response.status ?? "UNKNOWN"},
      payment_mode = ${response.paymentMode ?? null},
      bank_name = ${response.bankName ?? null},
      status_code = ${response.statusCode ?? null},
      paid_amount = ${response.paidAmount ? Number(response.paidAmount) : null},
      raw_response = ${JSON.stringify(response)}::jsonb,
      updated_at = now()
    WHERE client_txn_id = ${clientTxnId}
    RETURNING *
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}
