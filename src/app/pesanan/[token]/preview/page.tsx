import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderByToken } from "@/lib/order";

// Rute lama dari Tahap 2 (/pesanan/[token]/preview) tetap
// didukung: arahkan ke rute baru /preview/[orderId]?token=...
// supaya link lama tidak rusak. Rute baru inilah yang
// menjadi halaman pratinjau utama di Tahap 4.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function PreviewLegacyPage({ params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) notFound();
  redirect(`/preview/${order.id}?token=${params.token}`);
}
