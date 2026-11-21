import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/orders/[token]/preview — "submit" setelah klien
// memilih template dan melengkapi form.
// draft -> preview. Kalau sudah preview / pending_payment,
// biarkan (idempoten) dan kembalikan orderId yang sama.
// Pembayaran BELUM bisa dari sini — tombol bayar baru
// muncul di halaman preview setelah render selesai.
export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid." }, { status: 401 });
  if (order.status === "published" || order.status === "deleted" || order.status === "cancelled" || order.status === "expired") {
    return NextResponse.json({ error: "Pesanan ini sudah tidak bisa dipratinjau." }, { status: 403 });
  }
  if (order.status === "draft") {
    const supabase = createAdminClient();
    const { error } = await supabase.from("orders").update({ status: "preview" }).eq("id", order.id);
    if (error) return NextResponse.json({ error: "Gagal mengubah status ke preview." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, orderId: order.id, status: "preview" });
}
