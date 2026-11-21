import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderByToken } from "@/lib/order";
import { isMockPaymentEnabled } from "@/lib/payments/mock-guard";
import { createAdminClient } from "@/lib/supabase/server";
import BayarSimulasiClient from "./BayarSimulasiClient";

// Halaman simulasi: noindex + Referrer-Policy no-referrer,
// sama seperti halaman pesanan lain. Dan 404 kalau mock
// tidak aktif (guard di server, bukan di frontend).
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function BayarSimulasiPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { paymentId?: string };
}) {
  if (!isMockPaymentEnabled()) notFound();

  const order = await getOrderByToken(params.token);
  if (!order) notFound();

  const paymentId = searchParams.paymentId ?? "";
  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, provider, provider_ref, amount, internal_status")
    .eq("id", paymentId)
    .eq("order_id", order.id)
    .eq("provider", "mock")
    .single();
  if (!payment) notFound();

  return (
    <BayarSimulasiClient
      token={params.token}
      paymentId={payment.id as string}
      order={{
        subdomain: order.subdomain ?? "",
        templateId: order.template_id,
        amount: order.price_snapshot,
        status: order.status,
      }}
    />
  );
}
