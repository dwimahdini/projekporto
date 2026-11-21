import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";
import { TEMPLATE_IDS } from "@/lib/types";

// POST /api/orders/[token]/change-template — "Ganti template".
// Data klien TETAP (hanya template_id yang berubah).
// Hanya boleh saat status draft/preview/pending_payment.
// Kalau order sudah paid/domain_pending/published, ganti
// template harus lewat admin (Tahap 6-7), bukan dari sini.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid." }, { status: 401 });
  if (!["draft", "preview", "pending_payment"].includes(order.status)) {
    return NextResponse.json({ error: "Template sudah tidak bisa diganti untuk pesanan ini." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const templateId = String(body?.templateId ?? "");
  if (!(TEMPLATE_IDS as readonly string[]).includes(templateId)) {
    return NextResponse.json({ error: "Template tidak dikenal." }, { status: 400 });
  }
  const supabase = createAdminClient();
  const { data: template } = await supabase
    .from("templates")
    .select("id, price")
    .eq("id", templateId)
    .eq("is_active", true)
    .single();
  if (!template) return NextResponse.json({ error: "Template tidak aktif." }, { status: 400 });

  // Harga template baru ikut berlaku kalau belum bayar:
  // price_snapshot diperbarui karena belum ada pembayaran.
  const { error } = await supabase
    .from("orders")
    .update({ template_id: templateId, price_snapshot: template.price })
    .eq("id", order.id);
  if (error) return NextResponse.json({ error: "Gagal mengganti template." }, { status: 500 });
  return NextResponse.json({ ok: true, templateId });
}
