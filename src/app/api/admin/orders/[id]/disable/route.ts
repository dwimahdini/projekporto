import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminRequest, getAdminEmail } from "@/lib/admin-auth";
import { logAudit, decideAdminAction } from "@/lib/audit";

// POST /api/admin/orders/[id]/disable
// published -> disabled. Situs (subdomain) langsung 404
// karena view public_portfolio hanya mengembalikan published.
// Dicatat di audit_log.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const isAdmin = await isAdminRequest();
  if (!isAdmin) return NextResponse.json({ error: "Hanya admin." }, { status: 403 });

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, subdomain, email, status")
    .eq("id", params.id)
    .single();
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });

  const decision = decideAdminAction({ isAdmin, action: "disable", orderStatus: order.status as string });
  if (!decision.allowed) return NextResponse.json({ error: "Hanya order published yang bisa dinonaktifkan." }, { status: 409 });

  const { data: updated } = await supabase
    .from("orders")
    .update({ status: "disabled", domain_status: "inactive", domain_status_updated_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", "published")
    .select("id")
    .single();
  if (!updated) return NextResponse.json({ error: "Gagal menonaktifkan situs." }, { status: 500 });

  await logAudit({
    adminEmail: (await getAdminEmail()) ?? "admin",
    action: "disable_site",
    orderId: order.id as string,
    details: { subdomain: order.subdomain },
  });
  return NextResponse.json({ ok: true });
}
