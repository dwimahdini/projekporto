import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { lookupSchema } from "@/lib/validation";
import { sendOrderLinkEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/orders/lookup — "Cek pesanan saya".
// PENTING (privasi): respons SELALU sama, baik email itu
// terdaftar maupun tidak. Jangan pernah membocorkan
// "email tidak ditemukan" — itu bisa dipakai orang untuk
// menebak email siapa saja yang pernah pesan.
const SAME_RESPONSE = {
  ok: true,
  message: "Kalau email ini punya pesanan yang masih aktif, link-nya sudah kami kirim. Cek inbox / spam.",
};

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit({ key: `lookup:${ip}`, ...RATE_LIMITS.lookupPerIp });
  if (!rl.allowed) return NextResponse.json(SAME_RESPONSE);

  const body = await req.json().catch(() => null);
  const parsed = lookupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(SAME_RESPONSE);

  if (process.env.TURNSTILE_SECRET_KEY) {
    const human = await verifyTurnstile(parsed.data.turnstileToken, ip);
    if (!human) return NextResponse.json(SAME_RESPONSE);
  }

  // Cari order aktif terbaru untuk email ini. Kalau tidak ada,
  // tetap kembalikan respons yang sama — tanpa email, tanpa log
  // yang membedakan.
  try {
    const supabase = createAdminClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, subdomain")
      .eq("email", parsed.data.email)
      .in("status", ["draft", "preview", "pending_payment", "paid", "domain_pending", "published"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (!order) return NextResponse.json(SAME_RESPONSE);

    // Kirim link baru: buat token baru, ganti hash + masa berlaku.
    // Token lama otomatis tidak berlaku lagi.
    const { createOrderToken, hashToken } = await import("@/lib/validation");
    const token = createOrderToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from("orders")
      .update({ token_hash: tokenHash, token_expires_at: expiresAt })
      .eq("id", order.id);
    await sendOrderLinkEmail({ to: parsed.data.email, token, subdomain: order.subdomain ?? "portofolio" });
  } catch (e) {
    console.error("[lookup] gagal (tetap balas sama)", e);
  }
  return NextResponse.json(SAME_RESPONSE);
}
