import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";
import { validateUploadFile, randomUploadPath } from "@/lib/upload";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/upload — upload foto/gambar lewat server.
// FormData: token, file, kind ('photo' | 'project').
// Batas: 2 MB, jpg/png/webp. Nama file acak di Storage.
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Form tidak valid." }, { status: 400 });
  const token = String(form.get("token") ?? "");
  const file = form.get("file");

  const order = await getOrderByToken(token);
  if (!order) return NextResponse.json({ error: "Token tidak valid." }, { status: 401 });

  const rl = checkRateLimit({ key: `upload:${order.id}`, ...RATE_LIMITS.uploadPerToken });
  if (!rl.allowed) return NextResponse.json({ error: "Terlalu banyak upload. Coba lagi nanti." }, { status: 429 });

  if (!(file instanceof File)) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
  const err = validateUploadFile(file);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const supabase = createAdminClient();
  const path = randomUploadPath(order.id, file.name);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await supabase.storage
    .from("portfolio-uploads")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) {
    console.error("[upload] gagal", error);
    return NextResponse.json({ error: "Upload gagal. Coba lagi." }, { status: 500 });
  }

  // Bucket privat, jadi kembalikan signed URL 1 jam untuk preview.
  const { data: signed } = await supabase.storage
    .from("portfolio-uploads")
    .createSignedUrl(path, 3600);

  return NextResponse.json({ ok: true, path, url: signed?.signedUrl ?? null });
}
