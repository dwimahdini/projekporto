import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminRequest } from "@/lib/admin-auth";
import AdminLogin, { ActivateButton } from "./AdminClient";

// Halaman admin TIDAK BOLEH diindeks.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

// Halaman admin — TIDAK ditautkan dari situs publik.
// Daftar "Menunggu domain": semua order berstatus
// domain_pending (transisi paid -> domain_pending sudah
// ditangani applyPaymentResult di Tahap 5 — di sini hanya
// MENAMPILKAN daftarnya, tidak membuat jalur baru).
// Tombol "Tandai domain aktif" ada di tiap baris.
export default async function AdminPage() {
  if (!(await isAdminRequest())) return <AdminLogin />;

  const supabase = createAdminClient();
  const { data: waiting } = await supabase
    .from("orders")
    .select("id, subdomain, email, template_id, price_snapshot, created_at, domain_status, domain_status_updated_at")
    .eq("status", "domain_pending")
    .order("created_at", { ascending: true });

  // Nama klien + tanggal bayar per order (dari profile dan
  // payment yang sudah paid). Dipakai daftar "Menunggu domain".
  const waitingIds = (waiting ?? []).map((o) => o.id as string);
  const [{ data: profiles }, { data: paidPayments }] = await Promise.all([
    waitingIds.length > 0
      ? supabase.from("profiles").select("order_id, full_name").in("order_id", waitingIds)
      : Promise.resolve({ data: [] as { order_id: string; full_name: string }[] }),
    waitingIds.length > 0
      ? supabase
          .from("payments")
          .select("order_id, paid_at")
          .in("order_id", waitingIds)
          .eq("internal_status", "paid")
          .order("paid_at", { ascending: false })
      : Promise.resolve({ data: [] as { order_id: string; paid_at: string | null }[] }),
  ]);
  const nameByOrder = new Map((profiles ?? []).map((p) => [p.order_id as string, p.full_name as string]));
  const paidAtByOrder = new Map((paidPayments ?? []).map((p) => [p.order_id as string, p.paid_at as string | null]));
  const { data: published } = await supabase
    .from("orders")
    .select("id, subdomain, email, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Admin — Menunggu domain</h1>
      <p className="mt-2 text-sm text-gray-600">
        Order di bawah ini sudah lunas dan menunggu kamu menambahkan domainnya secara manual di Vercel (Project &gt; Domains) dan CNAME di Cloudflare ke cname.vercel-dns.com (DNS only). Setelah domain ditambahkan, tekan &ldquo;Tandai domain aktif&rdquo; — situs baru tampil dan email pemberitahuan terkirim ke klien (sekali saja).
      </p>

      {(waiting ?? []).length === 0 ? (
        <p className="mt-6 rounded-2xl border p-4 text-gray-600">Tidak ada order yang menunggu domain.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {(waiting ?? []).map((o) => {
            const paidAt = paidAtByOrder.get(o.id as string);
            return (
            <li key={o.id as string} className="rounded-2xl border p-4">
              <p className="font-bold">{o.subdomain as string}.portofolio.my.id</p>
              <p className="mt-1 text-sm text-gray-600">
                {nameByOrder.get(o.id as string) ?? "-"} · {o.email as string} · Template {o.template_id as string} · Rp{Number(o.price_snapshot ?? 0).toLocaleString("id-ID")}
              </p>
              <p className="mt-1 text-sm text-gray-600">
                Tanggal bayar: {paidAt ? new Date(paidAt).toLocaleDateString("id-ID") : "—"} · Status domain: {o.domain_status as string}
              </p>
              <div className="mt-3">
                <ActivateButton orderId={o.id as string} subdomain={o.subdomain as string} />
              </div>
            </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-10 text-xl font-bold">Sudah aktif (20 terakhir)</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {(published ?? []).map((o) => (
          <li key={o.id as string} className="flex justify-between gap-2 rounded-xl border px-3 py-2">
            <span>{o.subdomain as string}.portofolio.my.id</span>
            <span className="text-gray-500">{o.published_at ? new Date(o.published_at as string).toLocaleDateString("id-ID") : ""}</span>
          </li>
        ))}
        {(published ?? []).length === 0 ? <li className="text-gray-600">Belum ada.</li> : null}
      </ul>
    </main>
  );
}
