import OrderStatusClient from "./OrderStatusClient";

// Halaman status pesanan — noindex + no-referrer.
export const metadata = {
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer" as const,
};

export default function OrderStatusPage({ params }: { params: { token: string } }) {
  return <OrderStatusClient token={params.token} />;
}
