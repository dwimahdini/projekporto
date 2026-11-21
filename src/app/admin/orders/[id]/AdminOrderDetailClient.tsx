"use client";
import { useState } from "react";

interface OrderInfo {
  id: string;
  subdomain: string;
  email: string;
  templateId: string;
  status: string;
  price: number;
  createdAt: string;
  domainStatus: string;
  publishedAt: string | null;
}

export default function AdminOrderDetailClient({
  order,
  profile,
  payments,
  audit,
}: {
  order: OrderInfo;
  profile: Record<string, unknown>;
  payments: { id: string; provider: string; providerRef: string; amount: number; status: string; createdAt: string }[];
  audit: { adminEmail: string; action: string; createdAt: string }[];
}) {
  const [privateData, setPrivateData] = useState<Record<string, unknown> | null>(null);
  const [revealError, setRevealError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function reveal() {
    setBusy(true);
    setRevealError("");
    const res = await fetch(`/api/admin/orders/${order.id}/reveal`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) setRevealError(data.error ?? "Gagal menampilkan data pribadi.");
    else setPrivateData(data.profile as Record<string, unknown>);
  }

  async function action(kind: "disable" | "enable" | "cancel") {
    const label = kind === "disable" ? "menonaktifkan situs ini" : kind === "enable" ? "mengaktifkan kembali situs ini" : "membatalkan pesanan ini";
    if (!window.confirm(`Yakin ${label}?`)) return;
    setBusy(true);
    setNotice("");
    const res = await fetch(`/api/admin/orders/${order.id}/${kind}`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) setNotice(data.error ?? "Aksi gagal.");
    else window.location.reload();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <a href="/admin" className="text-sm text-brand-500 underline">← Kembali ke panel admin</a>
      <h1 className="mt-4 text-2xl font-bold">{order.subdomain}.portofolio.my.id</h1>
      <p className="mt-1 text-sm text-muted">
        Status: <strong>{order.status}</strong> · Template {order.templateId} · Rp{order.price.toLocaleString("id-ID")} · dibuat {new Date(order.createdAt).toLocaleDateString("id-ID")} · Status domain: {order.domainStatus}
      </p>
      <p className="mt-2">
        <a href={`/preview/${order.id}`} className="rounded-md border px-3 py-2 text-sm font-medium">Lihat pratinjau (sebagai admin)</a>
      </p>

      <h2 className="mt-8 text-xl font-bold">Data klien</h2>
      <dl className="mt-3 space-y-1 rounded-2xl border p-4 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Nama</dt><dd>{String(profile.full_name ?? "-")}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Email</dt><dd>{String(profile.email ?? order.email)}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Headline</dt><dd>{String(profile.headline ?? "-")}</dd></div>
        <div className="flex justify-between"><dt className="text-muted">Lokasi</dt><dd>{String(profile.location ?? "-")}</dd></div>
      </dl>

      <div className="mt-4 rounded-2xl border p-4">
        <p className="font-medium">Data pribadi (tanggal lahir, alamat, nomor HP)</p>
        <p className="mt-1 text-xs text-muted">Disembunyikan secara default. Menampilkannya dicatat di audit log.</p>
        {privateData ? (
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Tanggal lahir</dt><dd>{String(privateData.date_of_birth ?? "-")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Alamat</dt><dd>{String(privateData.address ?? "-")}, {String(privateData.city ?? "")} {String(privateData.postal_code ?? "")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Nomor HP</dt><dd>{String(privateData.phone ?? "-")}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">WhatsApp</dt><dd>{String(privateData.whatsapp ?? "-")}</dd></div>
          </dl>
        ) : (
          <button type="button" onClick={reveal} disabled={busy} className="mt-3 min-h-[48px] rounded-md border px-4 py-2 font-medium disabled:opacity-50">
            {busy ? "Memuat…" : "Tampilkan data pribadi"}
          </button>
        )}
        {revealError ? <p className="mt-2 text-sm text-danger">{revealError}</p> : null}
      </div>

      <h2 className="mt-8 text-xl font-bold">Riwayat pembayaran</h2>
      {payments.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Belum ada percobaan pembayaran.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {payments.map((p) => (
            <li key={p.id} className="flex justify-between gap-2 rounded-md border px-3 py-2">
              <span>{p.provider} · {p.providerRef} · Rp{p.amount.toLocaleString("id-ID")}</span>
              <span className="font-medium">{p.status}</span>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 text-xl font-bold">Aksi admin</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {order.status === "published" ? (
          <button type="button" onClick={() => action("disable")} disabled={busy} className="min-h-[48px] rounded-xl bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Nonaktifkan situs</button>
        ) : null}
        {order.status === "disabled" ? (
          <button type="button" onClick={() => action("enable")} disabled={busy} className="min-h-[48px] rounded-xl bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50">Aktifkan kembali</button>
        ) : null}
        {!["published", "disabled", "deleted", "cancelled", "expired"].includes(order.status) ? (
          <button type="button" onClick={() => action("cancel")} disabled={busy} className="min-h-[48px] rounded-md border border-red-300 px-4 py-2 font-medium text-danger disabled:opacity-50">Batalkan pesanan</button>
        ) : null}
      </div>
      {notice ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-danger">{notice}</p> : null}

      <h2 className="mt-8 text-xl font-bold">Audit log (20 terakhir)</h2>
      {audit.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Belum ada aksi admin yang tercatat untuk pesanan ini.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {audit.map((a, i) => (
            <li key={i} className="flex justify-between gap-2 rounded-md border px-3 py-2">
              <span>{a.action} — {a.adminEmail}</span>
              <span className="text-muted">{new Date(a.createdAt).toLocaleString("id-ID")}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
