import type { Metadata } from "next";
import PaymentForm from "@/components/pay/PaymentForm";
import { getWebsitePackagePayment } from "@/lib/website-packages";

export const metadata: Metadata = {
  title: "Pay Viviz Technologies",
  robots: { index: false, follow: false },
};

export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ package?: string }>;
}) {
  const { package: packageId } = await searchParams;
  const selectedPackage = getWebsitePackagePayment(packageId);

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <PaymentForm selectedPackage={selectedPackage} />
    </div>
  );
}
