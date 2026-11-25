// POST /api/buat/create — buat portofolio alur baru.
// Anonim (tanpa token/login). Body JSON: { draft, templateId }.
// Draft divalidasi schema, templateId harus ada di registry.
// Simpan ke tabel "shares" dengan share_code acak 16 karakter
// (tabrakan unique constraint -> buat kode baru, maks 3 kali).
// Kembalikan { ok: true, shareCode, url }.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates/registry";
import { createShareCode, draftToPortfolioData, normalizeBuatDraft } from "@/lib/buat";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const BASIS_URL = "https://group-portofolio.vercel.app";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit({ key: `buat-create:${ip}`, ...RATE_LIMITS.createOrder });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi nanti." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  const draft = normalizeBuatDraft((body as { draft?: unknown }).draft);
  if (!draft || draft.fullName.trim() === "") {
    return NextResponse.json({ error: "Data tidak valid. Lengkapi dulu biodatamu." }, { status: 400 });
  }
  const templateId = (body as { templateId?: unknown }).templateId;
  if (typeof templateId !== "string" || !getTemplate(templateId)) {
    return NextResponse.json({ error: "Template tidak ditemukan." }, { status: 400 });
  }

  const data = draftToPortfolioData(draft, templateId);
  const supabase = createAdminClient();

  // Coba sampai 3 kali: kalau share_code kebetulan sudah
  // dipakai (unique constraint, kode 23505), buat kode baru.
  let shareCode: string | null = null;
  for (let percobaan = 0; percobaan < 3; percobaan++) {
    const kode = createShareCode();
    const { error } = await supabase.from("shares").insert({
      share_code: kode,
      data,
      template_id: templateId,
    });
    if (!error) {
      shareCode = kode;
      break;
    }
    if (error.code === "23505") continue;
    console.error("[buat/create] insert gagal", error);
    if (error.message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Tabel shares belum disiapkan. Terapkan migrasi 0008 lewat SQL Editor Supabase dulu." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Gagal membuat portofolio. Coba lagi." }, { status: 500 });
  }
  if (!shareCode) {
    return NextResponse.json(
      { error: "Gagal membuat kode berbagi. Coba lagi." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    shareCode,
    url: `${BASIS_URL}/bagikan/${shareCode}`,
  });
}
