"use client";
import { useCallback, useEffect, useState } from "react";

// Halaman status: polling ringan tiap 5 detik, berhenti
// saat status final (domain_pending/published) atau saat
// tab disembunyikan (document.hidden).
const FINAL_STATUSES = ["domain_pending", "published", "deleted", "cancelled"];

interface PaymentRow {
  id: string;
  provider: string;
  amount: number;
  internal_status: string;
  created_at: string;
}

export default function OrderStatusClient({ token }: { token: string }) {
  const [status, setStatus] = useState<string>("");
  const [subdomain, setSubdomain] = useState("");
  const [amount, setAmount] = useState(0);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memuat status.");
        return false;
      }
      setStatus(data.order?.status ?? "");
      setSubdomain(data.order?.subdomain ?? "");
      setAmount(data.order?.price_snapshot ?? 0);
      setPayments((data.payments ?? []) as PaymentRow[]);
      return FINAL_STATUSES.includes(data.order?.status ?? "");
    } catch {
      return false;
    }
  }, [token]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    let stopped = false;
    const tick = async () => {
      if (document.hidden) return;
      const done = await load();
      if (done) stopped = true;
      if (done && timer) clearInterval(timer);
    };
    tick();
    timer = setInterval(() => {
      if (!stopped) tick();
    }, 5000);
    const onVis = () => {
      if (!document.hidden && !stopped) tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [load]);

  async function retryPayment() {
    setBusy(true);
    setNotice("");
    setError("");
    try {
      const res = await fetch(`/api/orders/${token}/proceed-to-payment`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat pembayaran baru.");
      window.location.href = data.next ?? `/pesanan/${token}/bayar`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat pembayaran baru.");
      setBusy(false);
    }
  }

  if (error && !status) return <p className="mx-auto max-w-xl px-4 py-16 text-danger">{error}</p>;

  const lastPayment = payments[0];

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold">Status pesanan</h1>
      <p className="mt-1 text-sm text-muted">{subdomain ? `${subdomain}.portofolio.my.id` : ""} · Rp{amount.toLocaleString("id-ID")}</p>

      {status === "pending_payment" ? (
        <div className="mt-6 rounded-2xl border bg-yellow-50 p-5">
          <p className="font-bold">⏳ Menunggu pembayaran</p>
          <p className="mt-1 text-sm">Selesaikan pembayaranmu. Halaman ini memperbarui otomatis tiap 5 detik.</p>
        </div>
      ) : null}

      {(status === "paid" || status === "domain_pending") ? (
        <div className="mt-6 rounded-2xl border bg-green-50 p-5">
          <p className="font-bold">✓ Lunas — situs sedang diaktifkan</p>
          <p className="mt-1 text-sm">Pembayaran sudah lunas. Admin sedang menambahkan domainmu, maks. 1x24 jam. Kami kirim email lagi saat situs sudah bisa dibuka di {subdomain}.portofolio.my.id.</p>
        </div>
      ) : null}

      {status === "published" ? (
        <div className="mt-6 rounded-2xl border bg-green-50 p-5">
          <p className="font-bold">🎉 Portofolio kamu sudah aktif!</p>
          <p className="mt-1 text-sm"><a className="text-brand-500 underline" href={`https://${subdomain}.portofolio.my.id`}>{subdomain}.portofolio.my.id</a></p>
        </div>
      ) : null}

      {(status === "preview" || status === "draft") && lastPayment?.internal_status === "failed" ? (
        <div className="mt-6 rounded-2xl border bg-red-50 p-5">
          <p className="font-bold">✕ Pembayaran gagal</p>
          <p className="mt-1 text-sm">Pembayaran terakhir gagal. Kamu bisa coba bayar ulang — percobaan lama sudah dibatalkan.</p>
          <button type="button" onClick={retryPayment} disabled={busy} className="mt-4 min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white disabled:opacity-50">
            {busy ? "Membuat pembayaran…" : "Bayar ulang"}
          </button>
        </div>
      ) : null}

      {(status === "preview" || status === "draft") && lastPayment?.internal_status === "expired" ? (
        <div className="mt-6 rounded-2xl border bg-gray-100 p-5">
          <p className="font-bold">⏰ Pembayaran kedaluwarsa</p>
          <p className="mt-1 text-sm">Pembayaran terakhir kedaluwarsa. Buat pembayaran baru untuk lanjut.</p>
          <button type="button" onClick={retryPayment} disabled={busy} className="mt-4 min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white disabled:opacity-50">
            {busy ? "Membuat pembayaran…" : "Buat pembayaran baru"}
          </button>
        </div>
      ) : null}

      {(status === "preview" || status === "draft") && !lastPayment ? (
        <div className="mt-6 rounded-2xl border p-5">
          <p className="font-bold">Pesanan masih draft / preview</p>
          <p className="mt-1 text-sm">Lengkapi form dan lihat pratinjau dulu sebelum bayar.</p>
          <a href={`/pesanan/${token}`} className="mt-4 block rounded-md border px-4 py-3 text-center font-medium">Kembali ke form pesanan</a>
        </div>
      ) : null}

      {payments.length > 0 ? (
        <div className="mt-6 rounded-2xl border p-5">
          <h2 className="font-bold">Riwayat pembayaran</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between gap-2">
                <span>{p.provider} · Rp{p.amount.toLocaleString("id-ID")}</span>
                <span className="font-medium">{p.internal_status}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</p> : null}
      {notice ? <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-success">{notice}</p> : null}
      <p className="mt-6 text-xs text-muted">Status diperbarui otomatis tiap 5 detik, berhenti saat sudah final atau tab disembunyikan.</p>
    </main>
  );
}
