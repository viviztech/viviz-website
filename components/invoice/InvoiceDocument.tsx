import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  COMPANY_NAME,
  COMPANY_EMAIL,
  COMPANY_PHONE_1,
  INVOICE_COMPANY_ADDRESS,
  INVOICE_BRANCH_ADDRESS,
  COMPANY_GSTIN,
} from "@/lib/config";
import { gstStateName } from "@/lib/gst";
import type { InvoiceRecord } from "@/lib/invoices";

// Built-in fonts only (Helvetica) — Font.register() with remote fonts has a
// known race where renderToBuffer() can fire before the download finishes.
const INK = "#0F172A";
const MUTED = "#64748B";
const BORDER = "#E2E8F0";
const SURFACE = "#F8FAFC";
const ACCENT = "#0E7490";
const ACCENT_SURFACE = "#ECFEFF";

const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 48,
    paddingHorizontal: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
  },
  accentBar: {
    height: 6,
    backgroundColor: INK,
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  muted: {
    color: MUTED,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  docBadge: {
    backgroundColor: ACCENT_SURFACE,
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    letterSpacing: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  invoiceNumber: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 2,
  },
  proformaNotice: {
    color: MUTED,
    fontSize: 8,
    textAlign: "right",
    maxWidth: 220,
    marginTop: 6,
    lineHeight: 1.4,
  },
  divider: {
    borderBottom: "1.5 solid " + INK,
    marginBottom: 20,
  },
  twoCol: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 6,
    border: "1 solid " + BORDER,
    padding: 12,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    marginBottom: 6,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  clientName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    marginBottom: 3,
  },
  table: {
    marginBottom: 16,
    borderRadius: 6,
    overflow: "hidden",
    border: "1 solid " + BORDER,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: INK,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid " + BORDER,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowAlt: {
    backgroundColor: SURFACE,
  },
  colDescription: { flex: 3 },
  colHsn: { flex: 1.2, textAlign: "center" },
  colQty: { flex: 0.8, textAlign: "right" },
  colRate: { flex: 1, textAlign: "right" },
  colAmount: { flex: 1.2, textAlign: "right" },
  thText: { fontFamily: "Helvetica-Bold", fontSize: 9, color: "#FFFFFF" },
  itemDescription: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  footerArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  totalsBlock: {
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalsGrandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: ACCENT_SURFACE,
    borderRadius: 4,
  },
  totalsGrandText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: ACCENT,
  },
  amountWords: {
    marginTop: 14,
    paddingTop: 10,
    borderTop: "1 solid " + BORDER,
  },
  amountWordsLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: MUTED,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  amountWordsValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  notes: {
    marginTop: 10,
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.4,
  },
  signatureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 24,
  },
  thankYou: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  signatureBox: {
    alignItems: "center",
    width: 180,
  },
  signatureFor: {
    fontSize: 9,
    color: MUTED,
    marginBottom: 22,
  },
  signatureLine: {
    borderTop: "1 solid " + INK,
    width: "100%",
    paddingTop: 4,
    textAlign: "center",
    fontSize: 8,
    color: MUTED,
  },
  pageFooter: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7.5,
    color: MUTED,
    borderTop: "1 solid " + BORDER,
    paddingTop: 8,
  },
});

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${TENS[tens]}${ones ? " " + ONES[ones] : ""}`;
}

function threeDigitWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest) parts.push(twoDigitWords(rest));
  return parts.join(" ");
}

// Indian numbering system: crore / lakh / thousand.
function integerToIndianWords(value: number): string {
  if (value === 0) return "Zero";
  const crore = Math.floor(value / 10000000);
  const lakh = Math.floor((value % 10000000) / 100000);
  const thousand = Math.floor((value % 100000) / 1000);
  const hundred = value % 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${threeDigitWords(crore)} Crore`);
  if (lakh) parts.push(`${threeDigitWords(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigitWords(thousand)} Thousand`);
  if (hundred) parts.push(threeDigitWords(hundred));
  return parts.join(" ");
}

function amountToWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  let words = `Rupees ${integerToIndianWords(rupees)}`;
  if (paise > 0) {
    words += ` and ${twoDigitWords(paise)} Paise`;
  }
  return `${words} Only`;
}

export default function InvoiceDocument({ invoice }: { invoice: InvoiceRecord }) {
  const isIntraState = invoice.cgst > 0 || invoice.sgst > 0;
  const isProforma = invoice.documentType === "proforma";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.accentBar} fixed />

        <View style={styles.headerRow}>
          <View>
            <Text style={styles.companyName}>{COMPANY_NAME}</Text>
            <Text style={styles.muted}>{INVOICE_COMPANY_ADDRESS}</Text>
            <Text style={styles.muted}>Branch: {INVOICE_BRANCH_ADDRESS}</Text>
            <Text style={styles.muted}>GSTIN: {COMPANY_GSTIN}</Text>
            <Text style={styles.muted}>{COMPANY_EMAIL} | {COMPANY_PHONE_1}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docBadge}>
              {isProforma ? "PROFORMA INVOICE" : "TAX INVOICE"}
            </Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <Text style={styles.muted}>Date: {formatDate(invoice.invoiceDate)}</Text>
            {isProforma && (
              <Text style={styles.proformaNotice}>
                This is a Proforma Invoice — not a demand for payment and not valid for
                GST input tax credit.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.twoCol}>
          <View style={[styles.card, { maxWidth: 260, flexGrow: 1, marginRight: 12 }]}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.clientName}>{invoice.clientName}</Text>
            <Text style={styles.muted}>{invoice.clientAddress}</Text>
            <Text style={styles.muted}>
              State: {gstStateName(invoice.clientStateCode)} ({invoice.clientStateCode})
            </Text>
            {invoice.clientGstin && (
              <Text style={styles.muted}>GSTIN: {invoice.clientGstin}</Text>
            )}
          </View>
          <View style={[styles.card, { minWidth: 180 }]}>
            <Text style={styles.sectionLabel}>Details</Text>
            <View style={styles.totalsRow}>
              <Text style={styles.muted}>Invoice Date</Text>
              <Text>{formatDate(invoice.invoiceDate)}</Text>
            </View>
            {invoice.dueDate && (
              <View style={styles.totalsRow}>
                <Text style={styles.muted}>Due Date</Text>
                <Text>{formatDate(invoice.dueDate)}</Text>
              </View>
            )}
            <View style={[styles.totalsRow, { marginBottom: 0 }]}>
              <Text style={styles.muted}>Supply Type</Text>
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
            <View
              key={i}
              style={[
                styles.tableRow,
                i % 2 === 1 ? styles.tableRowAlt : {},
                i === invoice.lineItems.length - 1 ? { borderBottom: "none" } : {},
              ]}
            >
              <Text style={[styles.colDescription, styles.itemDescription]}>
                {item.description}
              </Text>
              <Text style={styles.colHsn}>{item.hsnSac || "-"}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colRate}>{formatCurrency(item.rate)}</Text>
              <Text style={styles.colAmount}>
                {formatCurrency(item.quantity * item.rate)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.footerArea}>
          <View style={{ flex: 1 }} />
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
        </View>

        <View style={styles.amountWords}>
          <Text style={styles.amountWordsLabel}>Amount in Words</Text>
          <Text style={styles.amountWordsValue}>{amountToWords(invoice.total)}</Text>
        </View>

        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.signatureArea}>
          <Text style={styles.thankYou}>Thank you for your business!</Text>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureFor}>For {COMPANY_NAME}</Text>
            <Text style={styles.signatureLine}>Authorized Signatory</Text>
          </View>
        </View>

        <Text style={styles.pageFooter} fixed>
          This is a computer-generated {isProforma ? "proforma invoice" : "invoice"} and
          does not require a physical signature.
        </Text>
      </Page>
    </Document>
  );
}
