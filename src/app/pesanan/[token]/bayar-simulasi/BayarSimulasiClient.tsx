"use client";
import { useState } from "react";

// Halaman simulasi pembayaran (MOCK).
// Tiga tombol di bawah TIDAK memindahkan uang apa pun —
// mereka hanya memanggil applyPaymentResult lewat API.
export default function BayarSimulasiClient({
  token,
  paymentId,
  order,
}: {
  token: string;
  paymentId: string;
  order: { subdomain: string; templateId: string; amount: number; status: string };
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function simulate(result: "paid" | "failed" | "expired") {
    setBusy(result);
    setError("");
    try {
      const res = await fetch(`/api/orders/${token}/bayar-simulasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, result }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Simulasi gagal.");
      window.location.href = data.next ?? `/pesanan/${token}/status`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulasi gagal.");
      setBusy(null);
    }
  }

  const btn = "min-h-[52px] w-full rounded-xl px-4 py-3 font-semibold text-white disabled:opacity-50";

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <div className="rounded-2xl border-4 border-yellow-400 bg-yellow-100 p-4 text-center">
        <p className="text-xl font-black">⚠️ MODE SIMULASI, BUKAN PEMBAYARAN ASLI</p>
        <p className="mt-1 text-sm">Tidak ada uang yang berpindah. Tombol di bawah hanya untuk mengetes alur.</p>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-5">
        <h1 className="text-xl font-bold">Ringkasan pesanan</h1>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-gray-500">Subdomain</dt><dd className="font-medium">{order.subdomain}.portofolio.my.id</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Template</dt><dd className="font-medium">{order.templateId}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Harga</dt><dd className="font-bold">Rp{order.amount.toLocaleString("id-ID")}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Status order</dt><dd className="font-medium">{order.status}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-gray-500">Harga di atas dari server. Kalau ada yang mengubah harga di browser, tetap diabaikan.</p>
      </div>

      <div className="mt-6 space-y-3">
        <button type="button" disabled={busy !== null} onClick={() => simulate("paid")} className={`${btn} bg-green-600`}>
          {busy === "paid" ? "Memproses…" : "✓ Simulasikan berhasil"}
        </button>
        <button type="button" disabled={busy !== null} onClick={() => simulate("failed")} className={`${btn} bg-red-600`}>
          {busy === "failed" ? "Memproses…" : "✕ Simulasikan gagal"}
        </button>
        <button type="button" disabled={busy !== null} onClick={() => simulate("expired")} className={`${btn} bg-gray-700`}>
          {busy === "expired" ? "Memproses…" : "⏰ Simulasikan kedaluwarsa"}
        </button>
      </div>
      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <a href={`/pesanan/${token}/status`} className="mt-6 block text-center text-sm text-blue-600 underline">
        Lihat status pesanan
      </a>
    </main>
  );
}
