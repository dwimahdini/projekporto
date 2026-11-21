import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isCronAuthorized } from "@/lib/sanitize";

// GET /api/cron/cleanup-drafts — hapus draft 14 hari yang tidak dibayar.
// Dipanggil Vercel Cron harian 03:00 WIB (lihat vercel.json).
// Wajib header: Authorization: Bearer <CRON_SECRET>.
// Fail-closed: kalau CRON_SECRET belum diisi, route HANYA
// diizinkan di development, tidak di production.
export async function GET(req: Request) {
  const authorized = isCronAuthorized({
    secret: process.env.CRON_SECRET,
    authorizationHeader: req.headers.get("authorization") ?? "",
    nodeEnv: process.env.NODE_ENV,
  });
  if (!authorized) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("cleanup_expired_drafts");
  if (error) {
    console.error("[cron] cleanup gagal", error);
    return NextResponse.json({ error: "Cleanup gagal." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deleted: data ?? 0 });
}
