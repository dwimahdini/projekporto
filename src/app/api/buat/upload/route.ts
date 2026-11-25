// POST /api/buat/upload — upload foto/dokumen alur baru.
// Anonim (tanpa token/login). FormData: file, kind
// ("photo" | "document"). Foto: JPG/PNG/WebP maks 2 MB ke
// folder foto/; dokumen: PDF maks 5 MB ke folder dokumen/.
// Bucket "portfolio-public" harus sudah dibuat lewat
// migrasi 0008 — kalau belum, kembalikan pesan yang jelas.
// Kembalikan { ok: true, url } (URL publik).
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { validateImageFile, validatePdfFile } from "@/lib/validation";
import { validateImageMagicBytes, validatePdfMagicBytes } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";

const BUCKET = "portfolio-public";
// Anonim per IP: 20 upload per jam.
const BATAS_UPLOAD = { limit: 20, windowMs: 60 * 60 * 1000 };

function ekstensiFoto(mime: string): string | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return null;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = checkRateLimit({ key: `buat-upload:${ip}`, ...BATAS_UPLOAD });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Terlalu banyak upload. Coba lagi nanti." },
      { status: 429 }
    );
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Form tidak valid." }, { status: 400 });
  }
  const file = form.get("file");
  const kind = form.get("kind");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  }
  if (kind !== "photo" && kind !== "document") {
    return NextResponse.json(
      { error: "Jenis file tidak dikenal. Pilih foto atau dokumen PDF." },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  let path: string;
  if (kind === "photo") {
    const err = validateImageFile(file);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    // Validasi ISI file berdasarkan magic bytes, bukan hanya
    // ekstensi/MIME dari browser (keduanya bisa dipalsukan).
    const magicErr = validateImageMagicBytes(bytes, file.type);
    if (magicErr) return NextResponse.json({ error: magicErr }, { status: 400 });
    const ext = ekstensiFoto(file.type);
    if (!ext) return NextResponse.json({ error: "Tipe foto tidak didukung." }, { status: 400 });
    path = `foto/${crypto.randomUUID()}.${ext}`;
  } else {
    const err = validatePdfFile(file);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    const magicErr = validatePdfMagicBytes(bytes);
    if (magicErr) return NextResponse.json({ error: magicErr }, { status: 400 });
    path = `dokumen/${crypto.randomUUID()}.pdf`;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) {
    console.error("[buat/upload] gagal", error);
    if (error.message.includes("Bucket not found")) {
      return NextResponse.json(
        { error: "Bucket belum disiapkan. Terapkan migrasi 0008 lewat SQL Editor Supabase dulu." },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: "Upload gagal. Coba lagi." }, { status: 500 });
  }

  const { data: publik } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: publik.publicUrl });
}
