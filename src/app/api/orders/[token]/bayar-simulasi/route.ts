import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";
import { assertMockPaymentEnabled, MockNotAvailableError } from "@/lib/payments/mock-guard";
import { canAccessPayment } from "@/lib/payments/transition";
import { applyPaymentResult } from "@/lib/payments/apply-payment-result";

// POST /api/orders/[token]/bayar-simulasi
// Body: { paymentId, result: 'paid' | 'failed' | 'expired' }
// HANYA aktif kalau mock guard lolos, kalau tidak -> 404.
// Token pesanan A tidak bisa memakai payment pesanan B.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    assertMockPaymentEnabled();
  } catch (e) {
    if (e instanceof MockNotAvailableError) return NextResponse.json({ error: "Tidak ditemukan." }, { status: 404 });
    throw e;
  }

  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const paymentId = String(body?.paymentId ?? "");
  const result = body?.result as "paid" | "failed" | "expired" | undefined;
  if (!paymentId || !result || !["paid", "failed", "expired"].includes(result)) {
    return NextResponse.json({ error: "Data simulasi tidak valid." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, order_id, provider")
    .eq("id", paymentId)
    .single();
  if (!payment || payment.provider !== "mock" || !canAccessPayment(order.id, payment.order_id as string)) {
    return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
  }

  const applied = await applyPaymentResult(paymentId, result);
  if (!applied.ok) {
    return NextResponse.json({ error: applied.error ?? "Transisi tidak sah.", changed: false }, { status: 409 });
  }
  return NextResponse.json({ ok: true, changed: applied.changed, next: `/pesanan/${params.token}/status` });
}
