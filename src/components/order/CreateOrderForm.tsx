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

  // Genesis: input radius 6px, border #E8E8EC, fokus ring indigo.
  // Tinggi dipertahankan 48px supaya tetap nyaman disentuh.
  const inputCls =
    "mt-1 block w-full min-h-[48px] rounded-md border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-faint focus:border-brand-500";

  return (
    <form onSubmit={submit} className="card mt-10 space-y-5 p-6 sm:p-8">
      <h2 className="text-3xl tracking-[-0.03em]">Mulai pesan portofolio</h2>
      <div>
        <label className="text-sm font-medium" htmlFor="email">Email kamu</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" className={inputCls} />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="subdomain">Subdomain yang kamu mau</label>
        <div className="flex items-center gap-2">
          <input id="subdomain" required value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="namamu" className={inputCls} />
          <span className="shrink-0 text-sm text-muted">.portofolio.my.id</span>
        </div>
        <p className="mt-1 text-xs text-muted">Huruf kecil, angka, dan strip. Minimal 3 karakter.</p>
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="template">Pilih template</label>
        <select id="template" value={templateId} onChange={(e) => setTemplateId(e.target.value)} className={inputCls}>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name} — Rp{t.price.toLocaleString("id-ID")}</option>
          ))}
        </select>
      </div>
      <label className="flex min-h-[48px] items-start gap-3 rounded-md border border-line px-3.5 py-2.5 text-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded-full accent-brand-500" />
        <span>Saya menyetujui <a className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600" href="/kebijakan-privasi">Kebijakan Privasi</a> dan <a className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600" href="/syarat-layanan">Syarat Layanan</a>. Saya paham data saya dipakai untuk membuat portofolio ini.</span>
      </label>
      <TurnstileWidget onToken={setTurnstileToken} />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {done ? <p className="text-sm text-success">{done}</p> : null}
      {devLink ? (
        <p className="break-all rounded-xl bg-yellow-50 p-3 text-sm">
          Mode development — buka link pesananmu: <a className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600" href={devLink}>{devLink}</a>
        </p>
      ) : null}
      <button type="submit" disabled={busy} className="btn-primary min-h-[52px] w-full px-4 py-3 text-base">
        {busy ? "Membuat pesanan…" : "Buat pesanan & kirim link ke email"}
      </button>
    </form>
  );
}
