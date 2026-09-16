import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import { COMPANY_NAME, COMPANY_EMAIL, COMPANY_PHONE_1, COMPANY_WEBSITE, INVOICE_COMPANY_ADDRESS, INVOICE_BRANCH_ADDRESS, COMPANY_GSTIN, COMPANY_STATE } from "@/lib/config";
import { gstStateName } from "@/lib/gst";
import type { InvoiceRecord } from "@/lib/invoices";

const BLUE = "#07518A", DARK = "#073B6B", PALE = "#E7F1F9", WASH = "#F5F9FC";
const INK = "#101828", MUTED = "#475467", GRID = "#AFC3D4", WHITE = "#FFFFFF";
const border = `0.6 solid ${GRID}`;
const LOGO = readFileSync(join(process.cwd(), "public", "logo.jpg"));

const s = StyleSheet.create({
  page: { paddingTop: 24, paddingBottom: 35, paddingHorizontal: 22, fontFamily: "Helvetica", fontSize: 8.1, color: INK },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  brand: { width: "35%" },
  logo: { width: 76, height: 76, objectFit: "contain" },
  company: { width: "63%", paddingTop: 2 },
  companyName: { fontFamily: "Helvetica-Bold", fontSize: 12, marginBottom: 4 },
  companyText: { fontSize: 7.4, lineHeight: 1.35, color: MUTED },
  strong: { fontFamily: "Helvetica-Bold", color: INK },
  info: { flexDirection: "row", gap: 12, marginBottom: 11 },
  bill: { width: "50%", border },
  label: { backgroundColor: PALE, color: DARK, fontFamily: "Helvetica-Bold", fontSize: 8.5, paddingVertical: 5, paddingHorizontal: 8 },
  billBody: { paddingVertical: 7, paddingHorizontal: 9, minHeight: 72 },
  client: { fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 3 },
  detail: { fontSize: 8.1, lineHeight: 1.38 },
  meta: { flex: 1, border },
  title: { backgroundColor: BLUE, color: WHITE, fontFamily: "Helvetica-Bold", fontSize: 13.5, textAlign: "center", paddingVertical: 6, letterSpacing: .5 },
  metaRow: { flexDirection: "row", borderBottom: `0.5 solid ${GRID}`, paddingVertical: 5, paddingHorizontal: 8 },
  metaLabel: { width: "40%", fontFamily: "Helvetica-Bold" },
  colon: { width: "7%" },
  metaValue: { flex: 1 },
  notice: { backgroundColor: PALE, fontSize: 7, color: MUTED, lineHeight: 1.35, paddingVertical: 5, paddingHorizontal: 8 },
  table: { borderLeft: border, borderTop: border },
  row: { flexDirection: "row", minHeight: 19 },
  headerRow: { backgroundColor: BLUE, minHeight: 28 },
  cell: { borderRight: border, borderBottom: border, paddingHorizontal: 3.5, paddingVertical: 5, justifyContent: "center" },
  th: { color: WHITE, fontFamily: "Helvetica-Bold", fontSize: 7 },
  center: { textAlign: "center" }, right: { textAlign: "right" },
  serial: { width: "5%" }, desc: { width: "27%" }, hsn: { width: "10%" }, qty: { width: "5%" },
  rate: { width: "12%" }, amount: { width: "12%" }, tax: { width: "9%" }, total: { width: "11%" },
  totalRow: { flexDirection: "row", backgroundColor: PALE, minHeight: 23 },
  totalLabel: { width: "44%", borderRight: border, borderBottom: border, padding: 6, textAlign: "right", color: DARK, fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  totalQty: { width: "5%" },
  summaryArea: { flexDirection: "row", justifyContent: "space-between", alignItems: "stretch", marginTop: 7 },
  words: { width: "54%", justifyContent: "flex-end", paddingBottom: 6 },
  wordsLabel: { fontFamily: "Helvetica-Bold", fontSize: 8.5, marginBottom: 3 },
  wordsValue: { fontFamily: "Helvetica-Bold", fontSize: 9 },
  summary: { width: "41%", borderTop: border, borderLeft: border },
  summaryRow: { flexDirection: "row" },
  sumLabel: { width: "56%", borderRight: border, borderBottom: border, paddingVertical: 5, paddingHorizontal: 8, fontFamily: "Helvetica-Bold" },
  sumValue: { flex: 1, borderRight: border, borderBottom: border, paddingVertical: 5, paddingHorizontal: 8, textAlign: "right", fontFamily: "Helvetica-Bold" },
  grand: { backgroundColor: BLUE, color: WHITE, fontSize: 10 },
  bottom: { flexDirection: "row", marginTop: 10, paddingTop: 6, borderTop: `0.8 solid ${GRID}`, minHeight: 104 },
  terms: { width: "61%", paddingRight: 15 },
  sectionTag: { alignSelf: "flex-start", backgroundColor: PALE, color: DARK, fontFamily: "Helvetica-Bold", fontSize: 7.6, paddingVertical: 3, paddingHorizontal: 6, marginBottom: 5 },
  termRow: { flexDirection: "row", marginBottom: 3 },
  termNo: { width: 14, textAlign: "right", marginRight: 7, color: MUTED },
  termText: { flex: 1, fontSize: 6.7, lineHeight: 1.28, color: MUTED },
  signature: { flex: 1, borderLeft: border, paddingLeft: 18, justifyContent: "space-between" },
  signFor: { fontFamily: "Helvetica-Bold", fontSize: 8.2 },
  signatory: { fontFamily: "Helvetica-Bold", fontSize: 8, marginTop: 38, paddingTop: 4, borderTop: `0.6 solid ${GRID}` },
  thanks: { fontFamily: "Helvetica-BoldOblique", fontSize: 8.5, color: DARK, textAlign: "center", marginTop: 8 },
  footer: { position: "absolute", left: 22, right: 22, bottom: 15, height: 18, backgroundColor: BLUE, color: WHITE, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14 },
  footerText: { fontSize: 6, fontFamily: "Helvetica-Bold", letterSpacing: 1.7 },
  pageNo: { fontSize: 5.8 },
});

function money(n: number, decimals = 2) { return n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); }
function date(value: string) { const d = new Date(`${value}T00:00:00`); return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); }
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
function two(n: number) { return n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`; }
function three(n: number) { const a = []; if (Math.floor(n / 100)) a.push(`${ONES[Math.floor(n / 100)]} Hundred`); if (n % 100) a.push(two(n % 100)); return a.join(" "); }
function intWords(n: number) { if (!n) return "Zero"; const a = []; const crore = Math.floor(n / 10000000), lakh = Math.floor(n % 10000000 / 100000), thousand = Math.floor(n % 100000 / 1000), rest = n % 1000; if (crore) a.push(`${three(crore)} Crore`); if (lakh) a.push(`${three(lakh)} Lakh`); if (thousand) a.push(`${three(thousand)} Thousand`); if (rest) a.push(three(rest)); return a.join(" "); }
function words(n: number) { const rupees = Math.floor(n), paise = Math.round((n - rupees) * 100); return `Rupees ${intWords(rupees)}${paise ? ` and ${two(paise)} Paise` : ""} Only`; }
const BASE_TERMS = ["Prices are inclusive of GST at the rate shown in this document.", "Goods once sold will not be taken back or exchanged.", "Warranty is subject to the manufacturer's terms and conditions.", "Delivery and installation, if applicable, will be as separately agreed.", `Subject to ${COMPANY_STATE} jurisdiction only.`];

export default function InvoiceDocument({ invoice }: { invoice: InvoiceRecord }) {
  const intra = invoice.cgst > 0 || invoice.sgst > 0, proforma = invoice.documentType === "proforma", half = invoice.gstRate / 2;
  const terms = proforma ? ["This is a Proforma Invoice, not a demand for payment, and is not valid for GST input tax credit.", ...BASE_TERMS, "This quotation is valid for 30 days from the date of issue."] : BASE_TERMS;
  const boldBlue = { fontFamily: "Helvetica-Bold", color: DARK };
  return <Document title={invoice.invoiceNumber} author={COMPANY_NAME} subject={proforma ? "Proforma Invoice" : "Tax Invoice"}>
    <Page size="A4" style={s.page}>
      <View style={s.header} wrap={false}>
        <View style={s.brand}>
          {/* react-pdf Image has no HTML alt attribute; the company name follows beside it. */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={LOGO} style={s.logo} />
        </View>
        <View style={s.company}><Text style={s.companyName}>{COMPANY_NAME}</Text><Text style={s.companyText}>{INVOICE_COMPANY_ADDRESS}</Text><Text style={s.companyText}>Branch: {INVOICE_BRANCH_ADDRESS}</Text><Text style={[s.companyText, s.strong]}>GSTIN: {COMPANY_GSTIN}</Text><Text style={s.companyText}>{COMPANY_EMAIL} | {COMPANY_PHONE_1}</Text></View>
      </View>
      <View style={s.info} wrap={false}>
        <View style={s.bill}><Text style={s.label}>BILL TO</Text><View style={s.billBody}><Text style={s.client}>{invoice.clientName}</Text><Text style={s.detail}>{invoice.clientAddress}</Text><Text style={s.detail}>State: {gstStateName(invoice.clientStateCode)} ({invoice.clientStateCode})</Text>{invoice.clientGstin && <Text style={s.detail}>GSTIN: {invoice.clientGstin}</Text>}</View></View>
        <View style={s.meta}><Text style={s.title}>{proforma ? "PROFORMA INVOICE" : "TAX INVOICE"}</Text><Meta label="Invoice No." value={invoice.invoiceNumber}/><Meta label="Date" value={date(invoice.invoiceDate)}/><Meta label="Place of Supply" value={`${gstStateName(invoice.clientStateCode)} (${invoice.clientStateCode})`}/>{invoice.dueDate && <Meta label="Due Date" value={date(invoice.dueDate)}/>} {proforma && <Text style={s.notice}>This is a Proforma Invoice, not a demand for payment, and is not valid for GST input tax credit.</Text>}</View>
      </View>
      <View style={s.table}>
        <View style={[s.row, s.headerRow]} fixed><Cell t="S.No" x={[s.th,s.serial,s.center]}/><Cell t="Product Description" x={[s.th,s.desc]}/><Cell t="HSN/SAC" x={[s.th,s.hsn,s.center]}/><Cell t="Qty" x={[s.th,s.qty,s.center]}/><Cell t="Rate (Rs.)" x={[s.th,s.rate,s.right]}/><Cell t="Amount (Rs.)" x={[s.th,s.amount,s.right]}/><Cell t={intra ? `CGST ${money(half,1)}%` : `IGST ${money(invoice.gstRate,1)}%`} x={[s.th,s.tax,s.right]}/><Cell t={intra ? `SGST ${money(half,1)}%` : "Tax"} x={[s.th,s.tax,s.right]}/><Cell t="Total (Rs.)" x={[s.th,s.total,s.right]}/></View>
        {invoice.lineItems.map((item,i) => { const amount=item.quantity*item.rate, tax=amount*invoice.gstRate/100; return <View key={`${item.description}-${i}`} style={[s.row,i%2?{backgroundColor:WASH}:{}]} wrap={false}><Cell t={`${i+1}`} x={[s.serial,s.center]}/><Cell t={item.description} x={[s.desc]}/><Cell t={item.hsnSac||"-"} x={[s.hsn,s.center]}/><Cell t={`${item.quantity}`} x={[s.qty,s.center]}/><Cell t={money(item.rate)} x={[s.rate,s.right]}/><Cell t={money(amount)} x={[s.amount,s.right]}/><Cell t={money(intra?tax/2:tax)} x={[s.tax,s.right]}/><Cell t={intra?money(tax/2):"-"} x={[s.tax,s.right]}/><Cell t={money(amount+tax)} x={[s.total,s.right,{fontFamily:"Helvetica-Bold"}]}/></View> })}
        <View style={s.totalRow} wrap={false}><Text style={s.totalLabel}>TOTAL</Text><Cell t={`${invoice.lineItems.reduce((a,x)=>a+x.quantity,0)}`} x={[s.totalQty,s.center,boldBlue]}/><Cell t="" x={[s.rate]}/><Cell t={money(invoice.subtotal)} x={[s.amount,s.right,boldBlue]}/><Cell t={money(intra?invoice.cgst:invoice.igst)} x={[s.tax,s.right,boldBlue]}/><Cell t={intra?money(invoice.sgst):"-"} x={[s.tax,s.right,boldBlue]}/><Cell t={money(invoice.total)} x={[s.total,s.right,boldBlue]}/></View>
      </View>
      <View style={s.summaryArea} wrap={false}><View style={s.words}><Text style={s.wordsLabel}>Amount in Words (INR):</Text><Text style={s.wordsValue}>{words(invoice.total)}</Text></View><View style={s.summary}><Summary label="Total Taxable Value (Rs.)" value={money(invoice.subtotal)}/>{intra?<><Summary label={`CGST @ ${money(half,1)}%`} value={money(invoice.cgst)}/><Summary label={`SGST @ ${money(half,1)}%`} value={money(invoice.sgst)}/></>:<Summary label={`IGST @ ${money(invoice.gstRate,1)}%`} value={money(invoice.igst)}/>}<Summary label="Grand Total (Rs.)" value={money(invoice.total)} grand/></View></View>
      <View style={s.bottom} wrap={false}><View style={s.terms}><Text style={s.sectionTag}>TERMS & CONDITIONS</Text>{terms.map((x,i)=><View key={x} style={s.termRow}><Text style={s.termNo}>{i+1}.</Text><Text style={s.termText}>{x}</Text></View>)}{invoice.notes&&<View style={[s.termRow,{marginTop:2}]}><Text style={s.termNo}>Note:</Text><Text style={s.termText}>{invoice.notes}</Text></View>}</View><View style={s.signature}><View><Text style={s.signFor}>For {COMPANY_NAME}</Text><Text style={s.signatory}>Authorized Signatory</Text></View><Text style={s.thanks}>Thank you for choosing {COMPANY_NAME}!</Text></View></View>
      <View style={s.footer} fixed><Text style={s.footerText}>www.{COMPANY_WEBSITE}</Text><Text style={s.pageNo} render={({pageNumber,totalPages})=>`${pageNumber} / ${totalPages}`}/></View>
    </Page>
  </Document>;
}

function Cell({t,x}:{t:string;x:Style[]}) { return <Text style={[s.cell,...x]}>{t}</Text>; }
function Meta({label,value}:{label:string;value:string}) { return <View style={s.metaRow}><Text style={s.metaLabel}>{label}</Text><Text style={s.colon}>:</Text><Text style={s.metaValue}>{value}</Text></View>; }
function Summary({label,value,grand=false}:{label:string;value:string;grand?:boolean}) { return <View style={s.summaryRow}><Text style={[s.sumLabel,grand?s.grand:{}]}>{label}</Text><Text style={[s.sumValue,grand?s.grand:{}]}>{value}</Text></View>; }
