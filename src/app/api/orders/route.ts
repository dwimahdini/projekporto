import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { orderStep1Schema, createOrderToken, hashToken } from "@/lib/validation";
import { sendOrderLinkEmail } from "@/lib/email";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/orders — Langkah 1: buat order draft.
// Body: { email, subdomain, templateId, privacyConsent, turnstileToken }
// Respons SELALU { ok: true } kalau berhasil; kalau subdomain
// sudah dipakai, kembalikan 409 dengan pesan yang jelas
// (itu bukan data pribadi, jadi aman diungkap).
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit({ key: `create:${ip}`, ...RATE_LIMITS.createOrder });
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = orderStep1Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }
  const { email, subdomain, templateId, privacyConsent } = parsed.data;

  // Turnstile: wajib di production. Di dev (secret belum diisi),
  // lewati dengan catatan di log supaya tetap bisa dites.
  if (process.env.TURNSTILE_SECRET_KEY) {
    const human = await verifyTurnstile(parsed.data.turnstileToken, ip);
    if (!human) return NextResponse.json({ error: "Verifikasi keamanan gagal." }, { status: 400 });
  } else {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY belum diisi — verifikasi dilewati (dev saja).");
  }

  const supabase = createAdminClient();

  const { data: template } = await supabase
    .from("templates")
    .select("id, price, is_active")
    .eq("id", templateId)
    .eq("is_active", true)
    .single();
  if (!template) return NextResponse.json({ error: "Template tidak ditemukan." }, { status: 400 });

  const { data: taken } = await supabase
    .from("orders")
    .select("id")
    .eq("subdomain", subdomain)
    .neq("status", "deleted")
    .neq("status", "cancelled")
    .neq("status", "expired")
    .limit(1);
  if (taken && taken.length > 0) {
    return NextResponse.json({ error: "Subdomain sudah dipakai. Coba nama lain." }, { status: 409 });
  }

  const token = createOrderToken();
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      template_id: templateId,
      email,
      subdomain,
      token_hash: tokenHash,
      token_expires_at: expiresAt,
      draft_expires_at: expiresAt,
      status: "draft",
      price_snapshot: template.price,
      privacy_consent: privacyConsent,
      privacy_consent_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error || !order) {
    console.error("[orders] insert gagal", error);
    return NextResponse.json({ error: "Gagal membuat pesanan. Coba lagi." }, { status: 500 });
  }

  // Profile kosong sementara (nama diisi dari subdomain, akan
  // diganti di Langkah 2). full_name wajib diisi di database.
  await supabase.from("profiles").insert({
    order_id: order.id,
    role: "client",
    full_name: subdomain,
    email,
  });

  const emailResult = await sendOrderLinkEmail({ to: email, token, subdomain });

  // Di dev (Resend belum diisi), kembalikan link di respons
  // supaya bisa dites tanpa email. Di production (sent=true),
  // JANGAN kembalikan token — link hanya lewat email.
  return NextResponse.json({
    ok: true,
    message: "Link pesanan sudah dikirim ke email kamu.",
    ...(emailResult.sent ? {} : { devLink: emailResult.devLink }),
  });
}
