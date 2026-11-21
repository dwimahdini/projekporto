import OrderForm from "@/components/order/OrderForm";

// Halaman order tamu: /pesanan/[token]
// Token di URL adalah kunci aksesnya — jangan dibagikan.
// Server memverifikasi hash token + masa berlakunya di
// setiap API call (lihat src/lib/order.ts).
export default function OrderPage({ params }: { params: { token: string } }) {
  return <OrderForm token={params.token} />;
}
