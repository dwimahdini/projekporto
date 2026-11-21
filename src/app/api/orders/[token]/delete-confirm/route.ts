import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";

// POST /api/orders/[token]/delete-confirm
// Body: { code } — kode dari link email konfirmasi.
// Langkah 2 (final, permanen): tandai permintaan terpakai,
// lalu HAPUS order beserta semua data terkaitnya (profile,
// tabel anak, payments, otps — lewat ON DELETE CASCADE).
// Setelah ini subdomain bebas dipakai orang lain lagi.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const code = String(body?.code ?? "");
  if (!code) return NextResponse.json({ error: "Kode konfirmasi tidak ada." }, { status: 400 });

  const supabase = createAdminClient();
  const tokenHash = createHash("sha256").update(code).digest("hex");
  const { data: request } = await supabase
    .from("deletion_requests")
    .select("id, expires_at, used_at")
    .eq("order_id", order.id)
    .eq("token_hash", tokenHash)
    .single();
  if (!request) return NextResponse.json({ error: "Kode konfirmasi tidak valid." }, { status: 403 });
  if (request.used_at) return NextResponse.json({ error: "Link ini sudah dipakai." }, { status: 403 });
  if (new Date(request.expires_at as string).getTime() < Date.now()) {
    return NextResponse.json({ error: "Link sudah kedaluwarsa. Minta link baru dari dashboard." }, { status: 403 });
  }

  // Tandai terpakai dulu, baru hapus — supaya link tidak
  // bisa dipakai dua kali, bahkan kalau hapus gagal.
  await supabase
    .from("deletion_requests")
    .update({ used_at: new Date().toISOString() })
    .eq("id", request.id);

  const { error } = await supabase.from("orders").delete().eq("id", order.id);
  if (error) {
    console.error("[delete-confirm] hapus order gagal", error);
    return NextResponse.json({ error: "Gagal menghapus data. Coba lagi." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, message: "Semua data kamu sudah dihapus secara permanen." });
}
