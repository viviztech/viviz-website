import type { Metadata } from "next";
import LoginForm from "@/components/invoice/LoginForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InvoiceLoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <LoginForm />
    </div>
  );
}
