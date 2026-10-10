import type { CreateInvoiceInput, InvoiceLineItem } from "@/lib/invoices";

export function parseInvoicePayload(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any
): { data: CreateInvoiceInput } | { error: string } {
  const {
    documentType,
    clientName,
    clientAddress,
    clientGstin,
    clientStateCode,
    invoiceDate,
    dueDate,
    lineItems,
    gstRate,
    notes,
  } = body ?? {};

  if (
    !clientName ||
    !clientAddress ||
    !clientStateCode ||
    !invoiceDate ||
    typeof gstRate !== "number" ||
    !Array.isArray(lineItems) ||
    lineItems.length === 0
  ) {
    return { error: "Missing required invoice fields." };
  }

  if (documentType !== undefined && documentType !== "invoice" && documentType !== "proforma") {
    return { error: "Invalid document type." };
  }

  const validLineItems: InvoiceLineItem[] = lineItems.map((item) => ({
    description: String(item.description ?? ""),
    serviceDetails: item.serviceDetails ? String(item.serviceDetails).trim() : undefined,
    hsnSac: item.hsnSac ? String(item.hsnSac) : undefined,
    quantity: Number(item.quantity),
    rate: Number(item.rate),
  }));

  if (
    validLineItems.some(
      (item) => !item.description || !Number.isFinite(item.quantity) || !Number.isFinite(item.rate)
    )
  ) {
    return { error: "Invalid line item data." };
  }

  return {
    data: {
      documentType: documentType === "proforma" ? "proforma" : "invoice",
      clientName,
      clientAddress,
      clientGstin: clientGstin || null,
      clientStateCode,
      invoiceDate,
      dueDate: dueDate || null,
      lineItems: validLineItems,
      gstRate,
      notes: notes || null,
    },
  };
}
