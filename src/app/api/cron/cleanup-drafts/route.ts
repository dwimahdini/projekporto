import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// GET /api/cron/cleanup-drafts — hapus draft 14 hari yang tidak dibayar.
// Dipanggil Vercel Cron harian 03:00 WIB (lihat vercel.json).
// Wajib header: Authorization: Bearer <CRON_SECRET>
// Kalau CRON_SECRET belum diisi, route hanya boleh di dev.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (secret) {
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
    }
  } else {
    console.warn("[cron] CRON_SECRET belum diisi — cleanup diizinkan tanpa auth (dev saja).");
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("cleanup_expired_drafts");
  if (error) {
    console.error("[cron] cleanup gagal", error);
    return NextResponse.json({ error: "Cleanup gagal." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deleted: data ?? 0 });
}
