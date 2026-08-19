import type { Metadata } from "next";
import PaymentForm from "@/components/pay/PaymentForm";

export const metadata: Metadata = {
  title: "Pay Viviz Technologies",
  robots: { index: false, follow: false },
};

export default function PayPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <PaymentForm />
    </div>
  );
}
