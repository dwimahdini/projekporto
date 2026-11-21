import type { Metadata } from "next";
import OrderForm from "@/components/order/OrderForm";

// Halaman order tamu: /pesanan/[token]
// Token di URL adalah kunci aksesnya — jangan dibagikan.
// Server memverifikasi hash token + masa berlakunya di
// setiap API call (lihat src/lib/order.ts).
// Halaman ini adalah dashboard klien (tanpa akun):
// status pesanan + domain, link situs, edit data,
// ganti template, dan hapus data.
// Halaman pesanan TIDAK BOLEH diindeks.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default function OrderPage({ params }: { params: { token: string } }) {
  return <OrderForm token={params.token} />;
}
