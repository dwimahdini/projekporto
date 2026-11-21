import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPaymentProviderName } from "@/lib/payments/factory";
import AdminLogin, { ActivateButton, LogoutButton } from "./AdminClient";

// Halaman admin TIDAK BOLEH diindeks.
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

const STATUSES = ["draft", "preview", "pending_payment", "paid", "domain_pending", "published", "disabled", "expired", "cancelled"] as const;
const PAGE_SIZE = 20;

// Daftar "Menunggu domain" tetap di atas (Tahap 6), lalu
// daftar SEMUA pesanan dengan filter status, pencarian
// subdomain/email, dan paginasi (Tahap 7).
export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string; page?: string };
}) {
  if (!(await isAdminRequest())) return <AdminLogin />;

  const provider = getPaymentProviderName();
  const mockInProduction =
    process.env.PAYMENT_PROVIDER === "mock" &&
    process.env.ALLOW_MOCK_PAYMENT === "true" &&
    process.env.VERCEL_ENV === "production";

  const supabase = createAdminClient();
  const { data: waiting } = await supabase
    .from("orders")
    .select("id, subdomain, email, template_id, price_snapshot, created_at, domain_status")
    .eq("status", "domain_pending")
    .order("created_at", { ascending: true });

  const waitingIds = (waiting ?? []).map((o) => o.id as string);
  const [{ data: profiles }, { data: paidPayments }] = await Promise.all([
    waitingIds.length > 0
      ? supabase.from("profiles").select("order_id, full_name").in("order_id", waitingIds)
      : Promise.resolve({ data: [] as { order_id: string; full_name: string }[] }),
    waitingIds.length > 0
      ? supabase.from("payments").select("order_id, paid_at").in("order_id", waitingIds).eq("internal_status", "paid").order("paid_at", { ascending: false })
      : Promise.resolve({ data: [] as { order_id: string; paid_at: string | null }[] }),
  ]);
  const nameByOrder = new Map((profiles ?? []).map((p) => [p.order_id as string, p.full_name as string]));
  const paidAtByOrder = new Map((paidPayments ?? []).map((p) => [p.order_id as string, p.paid_at as string | null]));

  // --- Daftar semua pesanan (filter + cari + paginasi) ---
  const statusFilter = searchParams.status && (STATUSES as readonly string[]).includes(searchParams.status) ? searchParams.status : "";
  const q = (searchParams.q ?? "").trim();
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select("id, subdomain, email, template_id, status, price_snapshot, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (statusFilter) query = query.eq("status", statusFilter);
  if (q) query = query.or(`subdomain.ilike.%${q}%,email.ilike.%${q}%`);
  const { data: orders, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Admin</h1>
        <LogoutButton />
      </div>

      {mockInProduction ? (
        <p className="mt-4 rounded-2xl border-4 border-red-600 bg-red-100 p-4 text-lg font-black text-red-800">
          ⚠️ BAHAYA: MODE MOCK MENYALA DI PRODUCTION — pembayaran simulasi aktif di situs live. Matikan segera: hapus ALLOW_MOCK_PAYMENT atau set PAYMENT_PROVIDER=midtrans.
        </p>
      ) : (
        <p className="mt-4 rounded-xl border p-3 text-sm text-gray-600">
          Provider pembayaran aktif: <strong>{provider}</strong>{provider === "mock" ? " (simulasi — hanya untuk testing, bukan production)" : ""}.
        </p>
      )}

      <h2 className="mt-8 text-xl font-bold">Menunggu domain ({(waiting ?? []).length})</h2>
      <p className="mt-1 text-sm text-gray-600">
        Order di bawah ini sudah lunas dan menunggu kamu menambahkan domainnya secara manual di Vercel (Project &gt; Domains) dan CNAME di Cloudflare ke cname.vercel-dns.com (DNS only). Setelah domain ditambahkan, tekan &ldquo;Tandai domain aktif&rdquo; — situs baru tampil dan email pemberitahuan terkirim ke klien (sekali saja).
      </p>
      {(waiting ?? []).length === 0 ? (
        <p className="mt-4 rounded-2xl border p-4 text-gray-600">Tidak ada order yang menunggu domain.</p>
      ) : (
        <ul className="mt-4 space-y-4">
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
                <a href={`/admin/orders/${o.id}`} className="mt-2 inline-block text-sm text-blue-600 underline">Lihat detail pesanan</a>
              </li>
            );
          })}
        </ul>
      )}

      <h2 className="mt-10 text-xl font-bold">Semua pesanan</h2>
      <form method="get" className="mt-4 flex flex-wrap gap-2">
        <select name="status" defaultValue={statusFilter} className="min-h-[48px] rounded-xl border px-3 py-2">
          <option value="">Semua status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari subdomain atau email"
          className="min-h-[48px] flex-1 rounded-xl border px-3 py-2"
        />
        <button type="submit" className="min-h-[48px] rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Cari</button>
      </form>
      <ul className="mt-4 space-y-2">
        {(orders ?? []).map((o) => (
          <li key={o.id as string} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm">
            <span>
              <strong>{o.subdomain as string}.portofolio.my.id</strong> · {o.email as string} · {o.status as string} · Rp{Number(o.price_snapshot ?? 0).toLocaleString("id-ID")}
            </span>
            <a href={`/admin/orders/${o.id}`} className="text-blue-600 underline">Detail</a>
          </li>
        ))}
        {(orders ?? []).length === 0 ? <li className="text-gray-600">Tidak ada pesanan yang cocok.</li> : null}
      </ul>
      <div className="mt-4 flex items-center gap-3 text-sm">
        <span>Halaman {page} dari {totalPages}</span>
        {page > 1 ? <a className="rounded-xl border px-3 py-2" href={`/admin?status=${statusFilter}&q=${encodeURIComponent(q)}&page=${page - 1}`}>← Sebelumnya</a> : null}
        {page < totalPages ? <a className="rounded-xl border px-3 py-2" href={`/admin?status=${statusFilter}&q=${encodeURIComponent(q)}&page=${page + 1}`}>Berikutnya →</a> : null}
      </div>
    </main>
  );
}
