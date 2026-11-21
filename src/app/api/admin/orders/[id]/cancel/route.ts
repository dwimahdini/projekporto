import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminRequest, getAdminEmail } from "@/lib/admin-auth";
import { logAudit, decideAdminAction } from "@/lib/audit";

// POST /api/admin/orders/[id]/cancel
// Batalkan pesanan yang belum final (draft/preview/
// pending_payment/paid/domain_pending). Order yang sudah
// published/disabled tidak bisa dibatalkan dari sini —
// pakai nonaktifkan situs, atau hapus data lewat klien.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Hanya admin." }, { status: 403 });

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, subdomain, status")
    .eq("id", params.id)
    .single();
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });

  const decision = decideAdminAction({ isAdmin: true, action: "cancel", orderStatus: order.status as string });
  if (!decision.allowed) return NextResponse.json({ error: "Order ini sudah tidak bisa dibatalkan." }, { status: 409 });

  const { data: updated } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", order.id)
    .eq("status", order.status as string)
    .select("id")
    .single();
  if (!updated) return NextResponse.json({ error: "Gagal membatalkan pesanan." }, { status: 500 });

  await logAudit({ adminEmail: (await getAdminEmail()) ?? "admin", action: "cancel_order", orderId: order.id as string, details: { subdomain: order.subdomain, previous_status: order.status } });
  return NextResponse.json({ ok: true });
}
