import { COMPANY_STATE_CODE } from "@/lib/config";
import { toPaise } from "@/lib/money";

export interface InvoiceLineItem {
  description: string;
  hsnSac?: string;
  quantity: number;
  rate: number; // rupees, per unit
}

export interface InvoiceTotals {
  subtotalPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

export function calculateTotals(
  lineItems: InvoiceLineItem[],
  gstRatePercent: number,
  clientStateCode: string
): InvoiceTotals {
  const subtotalPaise = lineItems.reduce(
    (sum, item) => sum + toPaise(item.quantity * item.rate),
    0
  );

  const isIntraState = clientStateCode === COMPANY_STATE_CODE;
  const totalTaxPaise = Math.round((subtotalPaise * gstRatePercent) / 100);

  const cgstPaise = isIntraState ? Math.round(totalTaxPaise / 2) : 0;
  const sgstPaise = isIntraState ? totalTaxPaise - cgstPaise : 0;
  const igstPaise = isIntraState ? 0 : totalTaxPaise;
  const unroundedTotalPaise = subtotalPaise + cgstPaise + sgstPaise + igstPaise;

  return {
    subtotalPaise,
    cgstPaise,
    sgstPaise,
    igstPaise,
    // Customer-facing totals are always rounded upward to the next whole rupee.
    totalPaise: Math.ceil(unroundedTotalPaise / 100) * 100,
  };
}
