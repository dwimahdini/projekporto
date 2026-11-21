import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";
import { deleteOrderFiles } from "@/lib/storage-cleanup";

// POST /api/orders/[token]/delete-confirm
// Body: { code } — kode dari link email konfirmasi.
// Langkah 2 (final, permanen).
//
// KEPUTUSAN RETENSI (UU PDP, pembukuan):
// - Order yang BELUM dibayar (draft/preview/pending_payment/
//   expired/cancelled): hapus TOTAL — order beserta semua
//   data terkait dan file Storage (hard delete, cascade).
// - Order yang SUDAH dibayar (paid/domain_pending/
//   published/disabled): hapus data PRIBADI dan konten
//   (profile dianonimkan, tabel anak dihapus, file Storage
//   dihapus), tapi SIMPAN catatan transaksi minimal untuk
//   pembukuan: ID pesanan, nominal (price_snapshot),
//   tanggal, dan status. Subdomain dibebaskan (di-null-kan)
//   supaya bisa dipakai orang lain. Detail keputusan ini
//   dijelaskan di docs/TAHAP7.md dan Kebijakan Privasi.
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

  const { data: paidPayments } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", order.id)
    .eq("internal_status", "paid")
    .limit(1);
  const hasPaidPayment = (paidPayments ?? []).length > 0;
  const retainTransaction = hasPaidPayment || ["paid", "domain_pending", "published", "disabled"].includes(order.status);

  // Hapus file Storage dulu (di kedua jalur).
  await deleteOrderFiles(order.id);

  if (!retainTransaction) {
    const { error } = await supabase.from("orders").delete().eq("id", order.id);
    if (error) {
      console.error("[delete-confirm] hapus order gagal", error);
      return NextResponse.json({ error: "Gagal menghapus data. Coba lagi." }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: "Semua data kamu sudah dihapus secara permanen." });
  }

  // Jalur retensi: anonimkan profile, hapus tabel anak,
  // bebaskan subdomain, simpan order + payments sebagai
  // catatan transaksi minimal.
  const profileId = (order.profile as { id?: string } | null)?.id;
  if (profileId) {
    await supabase
      .from("profiles")
      .update({
        full_name: "Klien terhapus",
        headline: null,
        bio: null,
        date_of_birth: null,
        gender: null,
        nationality: null,
        address: null,
        city: null,
        province: null,
        postal_code: null,
        phone: null,
        whatsapp: null,
        email: null,
        location: null,
        photo_url: null,
        website_url: null,
        linkedin_url: null,
        github_url: null,
        instagram_url: null,
      })
      .eq("id", profileId);
    for (const table of ["education", "experiences", "projects", "skills", "certifications", "publications"]) {
      await supabase.from(table).delete().eq("profile_id", profileId);
    }
    await supabase.from("profile_visibility").delete().eq("profile_id", profileId);
  }
  const { error } = await supabase
    .from("orders")
    .update({ subdomain: null, status: "deleted", deleted_at: new Date().toISOString() })
    .eq("id", order.id);
  if (error) {
    console.error("[delete-confirm] anonimisasi gagal", error);
    return NextResponse.json({ error: "Gagal menghapus data. Coba lagi." }, { status: 500 });
  }
  return NextResponse.json({
    ok: true,
    message: "Data pribadi dan konten kamu sudah dihapus. Catatan transaksi minimal (ID pesanan, nominal, tanggal, status) disimpan untuk pembukuan, sesuai Kebijakan Privasi.",
  });
}
