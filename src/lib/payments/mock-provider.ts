// MockProvider — implementasi PENUH untuk simulasi.
// Dipakai hanya kalau isMockPaymentEnabled() true.
// Harga diambil dari order.price_snapshot (server).
// Membuat payment baru membatalkan payment pending lama
// dari order yang sama (hanya satu pending pada satu waktu).
import { createAdminClient } from "@/lib/supabase/server";
import { assertMockPaymentEnabled } from "./mock-guard";
import { applyPaymentResult } from "./apply-payment-result";
import type { CreatedPayment, OrderForPayment, PaymentProvider } from "./types";

export class MockProvider implements PaymentProvider {
  readonly name = "mock" as const;

  async createPayment(order: OrderForPayment): Promise<CreatedPayment> {
    assertMockPaymentEnabled();

    const supabase = createAdminClient();
    const amount = order.price_snapshot; // harga server, bukan frontend

    // Batalkan payment pending lama dari order ini.
    await supabase
      .from("payments")
      .update({ internal_status: "expired", status: "expire" })
      .eq("order_id", order.id)
      .eq("internal_status", "pending");

    const providerRef = `MOCK-${order.id.slice(0, 8)}-${Date.now()}`;
    const { data, error } = await supabase
      .from("payments")
      .insert({
        order_id: order.id,
        provider: "mock",
        provider_ref: providerRef,
        midtrans_order_id: providerRef,
        gross_amount: amount,
        amount,
        status: "pending",
        internal_status: "pending",
        raw_payload: { provider: "mock", simulated: true },
        raw_notification: { provider: "mock", simulated: true },
      })
      .select("id")
      .single();
    if (error || !data) throw new Error("Gagal membuat pembayaran simulasi.");

    return {
      paymentId: data.id as string,
      providerRef,
      amount,
      nextUrl: `/pesanan/TOKEN_PLACEHOLDER/bayar-simulasi?paymentId=${data.id}`,
    };
  }

  async getStatus(paymentId: string): Promise<{ status: string }> {
    assertMockPaymentEnabled();
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("payments")
      .select("internal_status")
      .eq("id", paymentId)
      .eq("provider", "mock")
      .single();
    return { status: (data?.internal_status as string) ?? "unknown" };
  }

  // Notifikasi simulasi: body { paymentId, result }.
  // Dipakai route /api/orders/[token]/bayar-simulasi.
  async handleNotification(request: Request): Promise<{ ok: boolean; changed: boolean }> {
    assertMockPaymentEnabled();
    const body = await request.json().catch(() => null);
    const paymentId = String(body?.paymentId ?? "");
    const result = body?.result as "paid" | "failed" | "expired" | undefined;
    if (!paymentId || !result || !["paid", "failed", "expired"].includes(result)) {
      return { ok: false, changed: false };
    }
    const applied = await applyPaymentResult(paymentId, result);
    return { ok: applied.ok, changed: applied.changed };
  }
}
