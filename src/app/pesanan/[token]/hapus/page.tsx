"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

// Halaman konfirmasi hapus data: /pesanan/[token]/hapus?code=...
// Dibuka dari link email. Menampilkan halaman ini saja
// TIDAK menghapus apa pun — data baru dihapus kalau klien
// menekan tombol konfirmasi di bawah.
export default function HapusPage({ params }: { params: { token: string } }) {
  const code = useSearchParams().get("code") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function confirmDelete() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${params.token}/delete-confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal menghapus data.");
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus data.");
      setBusy(false);
    }
  }

  if (!code) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-bold">Link tidak valid</h1>
        <p className="mt-2 text-gray-600">Buka link konfirmasi dari email kamu. Kalau sudah kedaluwarsa, minta link baru dari dashboard pesanan.</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-2xl font-bold">Data kamu sudah dihapus</h1>
        <p className="mt-2 text-gray-600">Semua data portofolio, termasuk biodata dan riwayat pembayaran, sudah dihapus secara permanen. Subdomain kamu sekarang bebas dipakai orang lain.</p>
        <a href="/" className="mt-6 inline-block rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white">Kembali ke beranda</a>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold">Hapus semua data saya?</h1>
      <p className="mt-4 text-gray-700">
        Ini <strong>permanen dan tidak bisa dibatalkan</strong>: biodata, pendidikan, pengalaman, proyek, foto, dan riwayat pembayaran akan dihapus. Kalau situs kamu sudah aktif, situs itu juga akan hilang.
      </p>
      {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <button
        type="button"
        onClick={confirmDelete}
        disabled={busy}
        className="mt-6 min-h-[52px] w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Menghapus…" : "Ya, hapus semua data saya secara permanen"}
      </button>
      <a href={`/pesanan/${params.token}`} className="mt-3 block rounded-xl border px-4 py-3 text-center font-medium">
        Batal — kembali ke pesanan
      </a>
    </main>
  );
}
