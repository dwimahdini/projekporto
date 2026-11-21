import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderByToken } from "@/lib/order";
import { buildPreviewPortfolio } from "@/lib/portfolio-preview";
import { isAdminRequest } from "@/lib/admin-auth";
import PreviewClient from "@/components/preview/PreviewClient";

// Pratinjau TIDAK BOLEH diindeks mesin pencari.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

// /preview/[orderId]?token=...
// Akses HANYA untuk:
//  - pemilik order (token di query cocok dengan orderId ini), atau
//  - admin (sesi Supabase Auth + role='admin').
// orderId saja (UUID) TIDAK cukup — tanpa token/admin,
// halaman ini 404 (jangan bocorkan order itu ada atau tidak).
export default async function PreviewByOrderIdPage({
  params,
  searchParams,
}: {
  params: { orderId: string };
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? null;
  let allowed = false;
  let orderId = params.orderId;

  if (token) {
    const order = await getOrderByToken(token);
    if (order && order.id === params.orderId) allowed = true;
  }
  if (!allowed && (await isAdminRequest())) {
    allowed = true;
  }
  if (!allowed) notFound();

  const data = await buildPreviewPortfolio(orderId);
  if (!data) notFound();

  return <PreviewClient data={data} token={token} isAdmin={!token} />;
}
