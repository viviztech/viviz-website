import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  COMPANY_NAME,
  COMPANY_EMAIL,
  COMPANY_PHONE_1,
  INVOICE_COMPANY_ADDRESS,
  COMPANY_GSTIN,
} from "@/lib/config";
import { gstStateName } from "@/lib/gst";
import type { InvoiceRecord } from "@/lib/invoices";

// Built-in fonts only (Helvetica) — Font.register() with remote fonts has a
// known race where renderToBuffer() can fire before the download finishes.
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  muted: {
    color: "#64748B",
    marginBottom: 2,
  },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 9,
    color: "#64748B",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #111827",
    paddingBottom: 6,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #E2E8F0",
    paddingVertical: 6,
  },
  colDescription: { flex: 3 },
  colHsn: { flex: 1.2, textAlign: "center" },
  colQty: { flex: 0.8, textAlign: "right" },
  colRate: { flex: 1, textAlign: "right" },
  colAmount: { flex: 1.2, textAlign: "right" },
  thText: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  totalsBlock: {
    alignSelf: "flex-end",
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalsGrandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTop: "1 solid #111827",
  },
  totalsGrandText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
  notes: {
    marginTop: 24,
    fontSize: 9,
    color: "#64748B",
  },
});

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function InvoiceDocument({ invoice }: { invoice: InvoiceRecord }) {
  const isIntraState = invoice.cgst > 0 || invoice.sgst > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{COMPANY_NAME}</Text>
            <Text style={styles.muted}>{INVOICE_COMPANY_ADDRESS}</Text>
            <Text style={styles.muted}>GSTIN: {COMPANY_GSTIN}</Text>
            <Text style={styles.muted}>{COMPANY_EMAIL} | {COMPANY_PHONE_1}</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>
              {invoice.documentType === "proforma" ? "PROFORMA INVOICE" : "TAX INVOICE"}
            </Text>
            <Text style={[styles.muted, { textAlign: "right", marginTop: 6 }]}>
              {invoice.invoiceNumber}
            </Text>
            {invoice.documentType === "proforma" && (
              <Text style={[styles.muted, { textAlign: "right", maxWidth: 220, marginTop: 6 }]}>
                This is a Proforma Invoice — not a demand for payment and not valid for GST
                input tax credit.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={{ maxWidth: 260 }}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={{ marginBottom: 2 }}>{invoice.clientName}</Text>
            <Text style={styles.muted}>{invoice.clientAddress}</Text>
            <Text style={styles.muted}>
              State: {gstStateName(invoice.clientStateCode)} ({invoice.clientStateCode})
            </Text>
            {invoice.clientGstin && (
              <Text style={styles.muted}>GSTIN: {invoice.clientGstin}</Text>
            )}
          </View>
          <View style={{ minWidth: 160 }}>
            <Text style={styles.sectionLabel}>Details</Text>
            <View style={styles.totalsRow}>
              <Text style={styles.muted}>Invoice Date</Text>
              <Text>{invoice.invoiceDate}</Text>
            </View>
            {invoice.dueDate && (
              <View style={styles.totalsRow}>
                <Text style={styles.muted}>Due Date</Text>
                <Text>{invoice.dueDate}</Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.muted}>Place of Supply</Text>
              <Text>{isIntraState ? "Intra-state" : "Inter-state"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDescription, styles.thText]}>Description</Text>
            <Text style={[styles.colHsn, styles.thText]}>HSN/SAC</Text>
            <Text style={[styles.colQty, styles.thText]}>Qty</Text>
            <Text style={[styles.colRate, styles.thText]}>Rate</Text>
            <Text style={[styles.colAmount, styles.thText]}>Amount</Text>
          </View>
          {invoice.lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colHsn}>{item.hsnSac || "-"}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colRate}>{formatCurrency(item.rate)}</Text>
              <Text style={styles.colAmount}>
                {formatCurrency(item.quantity * item.rate)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalsRow}>
            <Text style={styles.muted}>Subtotal</Text>
            <Text>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          {isIntraState ? (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.muted}>CGST ({(invoice.gstRate / 2).toFixed(2)}%)</Text>
                <Text>{formatCurrency(invoice.cgst)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.muted}>SGST ({(invoice.gstRate / 2).toFixed(2)}%)</Text>
                <Text>{formatCurrency(invoice.sgst)}</Text>
              </View>
            </>
          ) : (
            <View style={styles.totalsRow}>
              <Text style={styles.muted}>IGST ({invoice.gstRate.toFixed(2)}%)</Text>
              <Text>{formatCurrency(invoice.igst)}</Text>
            </View>
          )}
          <View style={styles.totalsGrandRow}>
            <Text style={styles.totalsGrandText}>Total</Text>
            <Text style={styles.totalsGrandText}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
