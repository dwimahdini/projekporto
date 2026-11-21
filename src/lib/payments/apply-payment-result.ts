// applyPaymentResult — SATU jalur transisi untuk Mock
// sekarang dan webhook Midtrans nanti. Semua perubahan
// status order lewat fungsi ini, jangan ubah status order
// langsung dari route/webhook.
//
// Alur:
//  1. Panggil RPC database apply_payment_result() — atomik
//     dan idempoten (lihat migrasi 0004).
//  2. Kalau hasilnya changed=false (sudah diterapkan /
//     paid final / transisi tidak sah), JANGAN kirim email
//     dan JANGAN ubah apa pun lagi.
//  3. Kalau baru berubah menjadi paid, kirim email paid
//     SEKALI: tandai paid_email_sent_at dengan update
//     bersyarat (hanya kalau masih null). Kalau email
//     belum dikonfigurasi, catat ke log dan jangan error.
import { createAdminClient } from "@/lib/supabase/server";
import { sendPaidEmail } from "@/lib/email";
import type { PaymentResult } from "./transition";

export interface AppliedPaymentResult {
  ok: boolean;
  changed: boolean;
  alreadyApplied?: boolean;
  error?: string;
  orderId?: string;
  newOrderStatus?: string;
}

export async function applyPaymentResult(
  paymentId: string,
  result: PaymentResult
): Promise<AppliedPaymentResult> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("apply_payment_result", {
    p_payment_id: paymentId,
    p_result: result,
  });
  if (error) {
    console.error("[applyPaymentResult] RPC gagal", error);
    return { ok: false, changed: false, error: "rpc_failed" };
  }
  const out = data as {
    ok: boolean;
    changed: boolean;
    already?: boolean;
    error?: string;
    order_id?: string;
    new_order_status?: string;
  };
  if (!out.ok || !out.changed) {
    if (out.error) console.warn("[applyPaymentResult] ditolak:", out.error, "payment", paymentId);
    return { ok: out.ok, changed: false, alreadyApplied: out.already, error: out.error, orderId: out.order_id, newOrderStatus: out.new_order_status };
  }

  // Baru berubah menjadi paid -> kirim email sekali.
  if (result === "paid" && out.order_id) {
    const { data: order } = await supabase
      .from("orders")
      .select("email, subdomain, template_id, price_snapshot")
      .eq("id", out.order_id)
      .single();
    if (order) {
      try {
        await sendPaidEmail({
          to: order.email as string,
          subdomain: (order.subdomain as string) ?? "",
          templateId: order.template_id as string,
          amount: order.price_snapshot as number,
        });
      } catch (e) {
        // Email gagal bukan alasan membatalkan pembayaran.
        console.error("[applyPaymentResult] email paid gagal (pembayaran tetap paid)", e);
      }
      // Tandai hanya kalau masih null — cegah email ganda
      // kalau fungsi ini dipanggil lagi (meski RPC sudah
      // idempoten, ini lapisan kedua).
      await supabase
        .from("payments")
        .update({ paid_email_sent_at: new Date().toISOString() })
        .eq("id", paymentId)
        .is("paid_email_sent_at", null);
    }
  }

  return { ok: true, changed: true, orderId: out.order_id, newOrderStatus: out.new_order_status };
}
