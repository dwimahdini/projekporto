"use client";
import { useState } from "react";
import TurnstileWidget from "../TurnstileWidget";

// Langkah 1 di landing: email + subdomain + template +
// checkbox privasi wajib. Setelah berhasil, user diarahkan
// membuka link yang dikirim ke email (di dev, linknya
// ditampilkan langsung supaya bisa dites).
export default function CreateOrderForm({ templates }: { templates: { id: string; name: string; price: number }[] }) {
  const [email, setEmail] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("dev");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [devLink, setDevLink] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone("");
    setDevLink("");
    if (!consent) {
      setError("Kamu harus menyetujui Kebijakan Privasi dulu.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subdomain, templateId, privacyConsent: consent, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat pesanan.");
      setDone(data.message ?? "Link pesanan sudah dikirim ke email kamu.");
      if (data.devLink) setDevLink(data.devLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pesanan.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls = "mt-1 block w-full min-h-[48px] rounded-xl border px-3 py-2 text-base";

  return (
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold">Mulai pesan portofolio</h2>
      <div>
        <label className="text-sm font-medium" htmlFor="email">Email kamu</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="subdomain">Subdomain yang kamu mau</label>
        <div className="flex items-center gap-2">
          <input id="subdomain" required value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="namamu" className={inputCls} />
          <span className="shrink-0 text-sm text-gray-500">.portofolio.my.id</span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Huruf kecil, angka, dan strip. Minimal 3 karakter.</p>
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="template">Pilih template</label>
        <select id="template" value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={inputCls}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name} — Rp{t.price.toLocaleString("id-ID")}</option>
          ))}
        </select>
      </div>
      <label className="flex min-h-[48px] items-start gap-3 rounded-xl border px-3 py-2 text-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />
        <span>Saya menyetujui <a className="text-blue-600 underline" href="/privasi">Kebijakan Privasi</a> dan <a className="text-blue-600 underline" href="/syarat">Syarat Layanan</a>. Saya paham data saya dipakai untuk membuat portofolio ini.</span>
      </label>
      <TurnstileWidget onToken={setTurnstileToken} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {done ? <p className="text-sm text-green-700">{done}</p> : null}
      {devLink ? (
        <p className="break-all rounded-xl bg-yellow-50 p-3 text-sm">
          Mode development — buka link pesananmu: <a className="text-blue-600 underline" href={devLink}>{devLink}</a>
        </p>
      ) : null}
      <button type="submit" disabled={busy} className="min-h-[52px] w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white disabled:opacity-50">
        {busy ? "Membuat pesanan…" : "Buat pesanan & kirim link ke email"}
      </button>
    </form>
  );
}
