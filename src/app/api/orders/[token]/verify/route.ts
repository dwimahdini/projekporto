import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/orders/[token]/verify — verifikasi email.
// Membuka link /pesanan/[token] dari email sama dengan
// membuktikan pemilik email itu. Route ini menandai
// email_verified_at. Tanpa ini, order TIDAK BOLEH lanjut
// ke pembayaran (dicek di canProceedToPayment + Tahap 5).
export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid atau sudah kedaluwarsa." }, { status: 401 });
  if (order.email_verified_at) return NextResponse.json({ ok: true, already: true });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({ email_verified_at: new Date().toISOString() })
    .eq("id", order.id);
  if (error) return NextResponse.json({ error: "Gagal verifikasi." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
