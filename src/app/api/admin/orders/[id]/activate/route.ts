import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { addDomain } from "@/lib/domains/add-domain";
import { sendPublishedEmail } from "@/lib/email";

// POST /api/admin/orders/[id]/activate
// "Tandai domain aktif": domain_pending -> published.
// Hanya admin yang login. Idempoten:
//  - Update bersyarat WHERE status='domain_pending' —
//    klik kedua tidak menemukan baris, jadi tidak mengubah.
//  - Email "situs aktif" hanya dikirim kalau
//    published_email_sent_at masih null (update bersyarat
//    kedua). Jadi email tidak terkirim dua kali.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Hanya admin yang bisa mengaktifkan domain." }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, subdomain, email, status, published_email_sent_at")
    .eq("id", params.id)
    .single();
  if (!order) return NextResponse.json({ error: "Order tidak ditemukan." }, { status: 404 });
  if (order.status === "published") {
    return NextResponse.json({ ok: true, already: true, message: "Domain sudah aktif." });
  }
  if (order.status !== "domain_pending") {
    return NextResponse.json(
      { error: `Order berstatus ${order.status}, hanya domain_pending yang bisa diaktifkan.` },
      { status: 409 }
    );
  }

  // Update bersyarat: hanya kalau masih domain_pending.
  const { data: updated } = await supabase
    .from("orders")
    .update({
      status: "published",
      published_at: new Date().toISOString(),
      domain_status: "active",
      domain_status_updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("status", "domain_pending")
    .select("id")
    .single();
  if (!updated) {
    // Berubah di antara dua pengecekan (klik ganda) — baca ulang.
    const { data: now } = await supabase.from("orders").select("status").eq("id", order.id).single();
    if (now?.status === "published") return NextResponse.json({ ok: true, already: true, message: "Domain sudah aktif." });
    return NextResponse.json({ error: "Gagal mengaktifkan domain." }, { status: 500 });
  }

  // Catat checklist manual Vercel + Cloudflare (addDomain
  // masih log saja sampai ada API-nya).
  await addDomain(order.subdomain as string);

  // Kirim email hanya sekali.
  if (!order.published_email_sent_at) {
    try {
      await sendPublishedEmail({ to: order.email as string, subdomain: order.subdomain as string });
    } catch (e) {
      console.error("[activate] email published gagal (domain tetap aktif)", e);
    }
    await supabase
      .from("orders")
      .update({ published_email_sent_at: new Date().toISOString() })
      .eq("id", order.id)
      .is("published_email_sent_at", null);
  }

  return NextResponse.json({ ok: true, message: "Domain aktif." });
}
