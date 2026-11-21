import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";
import { otpRequestSchema, otpVerifySchema } from "@/lib/validation";
import { createOtpCode, hashOtp, OTP_TTL_MS, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/orders/[token]/otp
// Body { action: 'request' | 'verify', purpose, code? }
// Respons request SELALU { ok: true } — jangan bocorkan
// apakah pengiriman berhasil atau tidak secara detail.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const action = body?.action;

  if (action === "request") {
    const parsed = otpRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const byEmail = checkRateLimit({ key: `otp:${order.email}`, ...RATE_LIMITS.otpPerEmail });
    const byIp = checkRateLimit({ key: `otp-ip:${ip}`, ...RATE_LIMITS.otpPerIp });
    if (!byEmail.allowed || !byIp.allowed) {
      return NextResponse.json({ error: "Terlalu banyak permintaan OTP. Coba lagi 1 jam lagi." }, { status: 429 });
    }

    const code = createOtpCode();
    const codeHash = await hashOtp(code);
    const supabase = createAdminClient();
    const { error } = await supabase.from("otps").insert({
      order_id: order.id,
      email: order.email,
      code_hash: codeHash,
      purpose: parsed.data.purpose,
      expires_at: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    });
    if (error) return NextResponse.json({ error: "Gagal membuat OTP." }, { status: 500 });
    await sendOtpEmail({ to: order.email, code });
    return NextResponse.json({ ok: true, message: "Kode OTP dikirim ke email kamu (berlaku 10 menit)." });
  }

  if (action === "verify") {
    const parsed = otpVerifySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Kode OTP harus 6 digit angka." }, { status: 400 });

    const supabase = createAdminClient();
    const { data: otp } = await supabase
      .from("otps")
      .select("*")
      .eq("order_id", order.id)
      .eq("purpose", parsed.data.purpose)
      .is("used_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (!otp) return NextResponse.json({ error: "Kode OTP tidak ditemukan atau sudah kedaluwarsa. Minta kode baru." }, { status: 400 });
    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Terlalu banyak percobaan. Minta kode baru." }, { status: 400 });
    }

    const codeHash = await hashOtp(parsed.data.code);
    await supabase.from("otps").update({ attempts: otp.attempts + 1 }).eq("id", otp.id);
    if (codeHash !== otp.code_hash) {
      return NextResponse.json({ error: "Kode OTP salah." }, { status: 400 });
    }
    await supabase.from("otps").update({ used_at: new Date().toISOString() }).eq("id", otp.id);
    return NextResponse.json({ ok: true, message: "OTP terverifikasi. Kamu bisa mengubah data pribadi 15 menit ke depan." });
  }

  return NextResponse.json({ error: "Aksi tidak dikenal." }, { status: 400 });
}
