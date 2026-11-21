import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminRequest, getAdminEmail } from "@/lib/admin-auth";
import { logAudit, decideAdminAction } from "@/lib/audit";

// POST /api/admin/orders/[id]/enable
// disabled -> published (aktifkan kembali).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Hanya admin." }, { status: 403 });

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, subdomain, status")
    .eq("id", params.id)
    .single();
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });

  const decision = decideAdminAction({ isAdmin: true, action: "enable", orderStatus: order.status as string });
  if (!decision.allowed) return NextResponse.json({ error: "Hanya order disabled yang bisa diaktifkan kembali." }, { status: 409 });

  const { data: updated } = await supabase
    .from("orders")
    .update({ status: "published", published_at: new Date().toISOString(), domain_status: "active", domain_status_updated_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", "disabled")
    .select("id")
    .single();
  if (!updated) return NextResponse.json({ error: "Gagal mengaktifkan kembali." }, { status: 500 });

  await logAudit({ adminEmail: (await getAdminEmail()) ?? "admin", action: "enable_site", orderId: order.id as string, details: { subdomain: order.subdomain } });
  return NextResponse.json({ ok: true });
}
