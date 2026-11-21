import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/orders/[token]/export
// Ekspor seluruh data klien sebagai JSON.
// Akses ke data pribadi WAJIB OTP email yang sudah
// terverifikasi (purpose edit-private, dipakai <15 menit
// yang lalu) — sama seperti edit data pribadi di Tahap 2.
// Rate limit 5x/jam per token.
export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid." }, { status: 401 });

  const rl = checkRateLimit({ key: `export:${order.id}`, ...RATE_LIMITS.exportPerToken });
  if (!rl.allowed) return NextResponse.json({ error: "Terlalu banyak permintaan ekspor. Coba lagi nanti." }, { status: 429 });

  const supabase = createAdminClient();
  const { data: otp } = await supabase
    .from("otps")
    .select("id")
    .eq("order_id", order.id)
    .eq("purpose", "edit-private")
    .not("used_at", "is", null)
    .gte("used_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
    .order("used_at", { ascending: false })
    .limit(1);
  if (!otp || otp.length === 0) {
    return NextResponse.json({ error: "OTP_REQUIRED", message: "Untuk mengunduh data pribadi, verifikasi dulu dengan kode OTP yang dikirim ke email kamu." }, { status: 403 });
  }

  const profileId = (order.profile as { id?: string } | null)?.id;
  const [edu, exp, proj, skills, certs, pubs, vis, pays] = await Promise.all([
    supabase.from("education").select("*").eq("profile_id", profileId ?? ""),
    supabase.from("experiences").select("*").eq("profile_id", profileId ?? ""),
    supabase.from("projects").select("*").eq("profile_id", profileId ?? ""),
    supabase.from("skills").select("*").eq("profile_id", profileId ?? ""),
    supabase.from("certifications").select("*").eq("profile_id", profileId ?? ""),
    supabase.from("publications").select("*").eq("profile_id", profileId ?? ""),
    supabase.from("profile_visibility").select("field_name, is_visible").eq("profile_id", profileId ?? ""),
    supabase.from("payments").select("id, provider, provider_ref, amount, internal_status, created_at, paid_at").eq("order_id", order.id),
  ]);

  const data = {
    exported_at: new Date().toISOString(),
    order: {
      id: order.id,
      subdomain: order.subdomain,
      template_id: order.template_id,
      status: order.status,
      email: order.email,
      price_snapshot: order.price_snapshot,
      created_at: (order.profile as Record<string, unknown>)?.created_at ?? null,
    },
    profile: order.profile,
    visibility: vis.data ?? [],
    education: edu.data ?? [],
    experiences: exp.data ?? [],
    projects: proj.data ?? [],
    skills: skills.data ?? [],
    certifications: certs.data ?? [],
    publications: pubs.data ?? [],
    payments: pays.data ?? [],
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="data-portofolio-${order.subdomain ?? "klien"}.json"`,
    },
  });
}
