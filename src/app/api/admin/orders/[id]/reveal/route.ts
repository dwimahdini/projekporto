import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminRequest, getAdminEmail } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/admin/orders/[id]/reveal
// Menampilkan data pribadi klien (tanggal lahir, alamat,
// nomor HP) yang di panel disembunyikan secara default.
// Setiap penayangan DICATAT di audit_log (siapa, kapan,
// order apa) — admin tidak bisa melihat data pribadi
// tanpa jejak. Rate limit 20x/jam per admin.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Hanya admin." }, { status: 403 });

  const adminEmail = (await getAdminEmail()) ?? "admin";
  const rl = checkRateLimit({ key: `reveal:${adminEmail}`, ...RATE_LIMITS.revealPerAdmin });
  if (!rl.allowed) return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });

  const supabase = createAdminClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, whatsapp, address, city, province, postal_code, date_of_birth, gender, nationality")
    .eq("order_id", params.id)
    .single();
  if (!profile) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });

  await logAudit({
    adminEmail,
    action: "reveal_private_data",
    orderId: params.id,
    details: { fields: ["date_of_birth", "address", "phone"] },
  });

  return NextResponse.json({ ok: true, profile });
}
