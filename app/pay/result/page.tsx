import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { getPaymentByClientTxnId } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Payment Status — Viviz Technologies",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_response: "SabPaisa did not return a payment response. If money was deducted, please contact us.",
  unknown_transaction: "We couldn't find this transaction. If money was deducted, please contact us.",
  verification_failed: "We couldn't verify SabPaisa's response. If money was deducted, please contact us.",
};

function Card({
  icon,
  iconClass,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md p-8 rounded-2xl border border-white/5 bg-[#0F1929] text-center space-y-5">
      <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${iconClass}`}>
        {icon}
      </div>
      <h1 className="text-lg font-bold text-white">{title}</h1>
      <div className="text-sm text-[#94A3B8] space-y-1">{children}</div>
      <Link
        href="/pay"
        className="inline-block text-xs font-semibold text-[#00D4FF] hover:opacity-80 transition-opacity"
      >
        ← Back to payment page
      </Link>
    </div>
  );
}

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ txn?: string; error?: string }>;
}) {
  const { txn, error } = await searchParams;

  const wrapperClass = "min-h-[70vh] flex items-center justify-center py-16 px-4";

  if (error) {
    return (
      <div className={wrapperClass}>
        <Card icon={<HelpCircle size={28} className="text-white" />} iconClass="bg-[#F59E0B]" title="Payment Status Unknown">
          <p>{ERROR_MESSAGES[error] ?? "Something went wrong while confirming your payment."}</p>
        </Card>
      </div>
    );
  }

  const payment = txn ? await getPaymentByClientTxnId(txn) : null;

  if (!payment) {
    return (
      <div className={wrapperClass}>
        <Card icon={<HelpCircle size={28} className="text-white" />} iconClass="bg-[#F59E0B]" title="Transaction Not Found">
          <p>We couldn&rsquo;t find that transaction.</p>
        </Card>
      </div>
    );
  }

  const amountDisplay = `₹${payment.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

  if (payment.status === "SUCCESS") {
    return (
      <div className={wrapperClass}>
        <Card icon={<CheckCircle2 size={28} className="text-white" />} iconClass="bg-[#10D9A0]" title="Payment Successful">
          <p>{amountDisplay} received from {payment.payerName}.</p>
          {payment.paymentMode && <p>Paid via {payment.paymentMode}.</p>}
          <p className="text-xs text-[#475569] pt-2">Transaction ID: {payment.clientTxnId}</p>
        </Card>
      </div>
    );
  }

  if (payment.status === "FAILED" || payment.status === "ABORTED") {
    return (
      <div className={wrapperClass}>
        <Card icon={<XCircle size={28} className="text-white" />} iconClass="bg-red-500" title="Payment Failed">
          <p>Your payment of {amountDisplay} could not be completed.</p>
          <p className="text-xs text-[#475569] pt-2">Transaction ID: {payment.clientTxnId}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <Card icon={<HelpCircle size={28} className="text-white" />} iconClass="bg-[#F59E0B]" title="Payment Pending">
        <p>We&rsquo;re still confirming your payment of {amountDisplay}. This can take a few minutes.</p>
        <p className="text-xs text-[#475569] pt-2">Transaction ID: {payment.clientTxnId}</p>
      </Card>
    </div>
  );
}
