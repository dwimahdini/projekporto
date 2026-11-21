import { NextResponse } from "next/server";
import { getOrderByToken, canProceedToPayment } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments/factory";
import { PaymentUnavailableError } from "@/lib/payments/types";

// POST /api/orders/[token]/proceed-to-payment
// Dipanggil tombol "Lanjut ke pembayaran" di halaman preview.
// Alur:
//  1. Validasi token + email terverifikasi.
//  2. Kalau order sudah pending_payment, cari payment pending
//     yang masih aktif dan arahkan ke halamannya (jangan buat
//     payment baru dua kali).
//  3. Kalau belum, buat payment lewat provider aktif:
//     - Mock: buat payment, ubah order preview -> pending_payment,
//       arahkan ke /pesanan/[token]/bayar-simulasi.
//     - Midtrans (belum diimplementasi): kembalikan pesan rapi
//       "Pembayaran belum tersedia" (503), BUKAN error mentah.
// Harga HANYA dari server (order.price_snapshot) — body
// request tidak boleh membawa harga, dan kalau ada, diabaikan.
export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid." }, { status: 401 });

  const supabase = createAdminClient();

  if (order.status === "pending_payment") {
    const { data: existing } = await supabase
      .from("payments")
      .select("id, provider")
      .eq("order_id", order.id)
      .eq("internal_status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (existing?.provider === "mock") {
      return NextResponse.json({
        ok: true,
        already: true,
        next: `/pesanan/${params.token}/bayar-simulasi?paymentId=${existing.id}`,
      });
    }
    return NextResponse.json({ ok: true, already: true, next: `/pesanan/${params.token}/bayar` });
  }

  if (!canProceedToPayment(order)) {
    return NextResponse.json(
      { error: "Email harus terverifikasi dulu sebelum lanjut ke pembayaran." },
      { status: 403 }
    );
  }

  // Cek ulang keunikan subdomain saat masuk pending_payment
  // (lapisan kedua setelah cek di pembuatan order + UNIQUE
  // di database). Kalau ada order lain yang masih hidup
  // dengan subdomain yang sama, tolak — jangan buat payment.
  if (order.subdomain) {
    const { data: conflict } = await supabase
      .from("orders")
      .select("id")
      .eq("subdomain", order.subdomain)
      .neq("id", order.id)
      .not("status", "in", "(deleted,cancelled,expired)")
      .limit(1);
    if (conflict && conflict.length > 0) {
      return NextResponse.json(
        { error: "Subdomain sudah dipakai orang lain. Hubungi admin untuk mengganti subdomain." },
        { status: 409 }
      );
    }
  }

  let created;
  try {
    const provider = getPaymentProvider();
    created = await provider.createPayment({
      id: order.id,
      template_id: order.template_id,
      email: order.email,
      subdomain: order.subdomain,
      status: order.status,
      price_snapshot: order.price_snapshot,
    });
  } catch (e) {
    if (e instanceof PaymentUnavailableError) {
      return NextResponse.json({ error: "Pembayaran belum tersedia." }, { status: 503 });
    }
    console.error("[proceed-to-payment] createPayment gagal", e);
    return NextResponse.json({ error: "Gagal membuat pembayaran. Coba lagi." }, { status: 500 });
  }

  // Ubah status secara bersyarat: hanya kalau masih preview.
  // Kalau dua klik cepat, hanya satu yang berhasil mengubah.
  const { data: updated } = await supabase
    .from("orders")
    .update({ status: "pending_payment" })
    .eq("id", order.id)
    .eq("status", "preview")
    .select("id")
    .single();
  if (!updated) {
    // Status sudah berubah oleh klik lain — arahkan ke payment yang sama.
    return NextResponse.json({ ok: true, already: true, next: created.nextUrl.replace("TOKEN_PLACEHOLDER", params.token) });
  }

  return NextResponse.json({ ok: true, next: created.nextUrl.replace("TOKEN_PLACEHOLDER", params.token) });
}
