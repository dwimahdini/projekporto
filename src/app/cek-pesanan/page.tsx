"use client";
import { useState } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";

// "Cek pesanan saya": masukkan email, server mengirim ulang
// link ke email itu. Respons SELALU sama — halaman ini tidak
// pernah memberitahu apakah email itu terdaftar atau tidak.
export default function CekPesananPage() {
  const [email, setEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("dev");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setDone("");
    try {
      const res = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      const data = await res.json();
      setDone(data.message ?? "Kalau email ini punya pesanan, link-nya sudah kami kirim.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold">Cek pesanan saya</h1>
      <p className="mt-2 text-sm text-muted">
        Masukkan email yang kamu pakai saat pesan. Kami kirim ulang link pesananmu ke email itu.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border bg-white p-4 sm:p-6">
        <div>
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className="mt-1 block w-full min-h-[48px] rounded-md border px-3 py-2 text-base" />
        </div>
        <TurnstileWidget onToken={setTurnstileToken} />
        <button type="submit" disabled={busy} className="min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white disabled:opacity-50">
          {busy ? "Mengirim…" : "Kirim link pesanan ke email saya"}
        </button>
        {done ? <p className="rounded-xl bg-green-50 p-3 text-sm text-success">{done}</p> : null}
      </form>
    </main>
  );
}
