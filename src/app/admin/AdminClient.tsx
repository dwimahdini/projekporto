"use client";
import { useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

// Tombol keluar admin.
export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        const supabase = createBrowserSupabaseClient();
        await supabase.auth.signOut();
        window.location.reload();
      }}
      className="min-h-[44px] rounded-md border px-3 py-2 text-sm font-medium"
    >
      Keluar
    </button>
  );
}

// Login admin (Supabase Auth, email + password) LEWAT
// SERVER (/api/admin/login) supaya ada rate limiting +
// penundaan percobaan gagal + cek role di server.
// Halaman admin tidak ditautkan dari situs publik.
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [failures, setFailures] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  async function login() {
    if (Date.now() < cooldownUntil) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setBusy(false);
      if (!res.ok) {
        // Penundaan bertingkat di client: gagal ke-1 tunggu
        // 2 detik, ke-2 tunggu 4 detik, dst (maks 30 detik).
        const nextFailures = failures + 1;
        setFailures(nextFailures);
        setCooldownUntil(Date.now() + Math.min(2000 * nextFailures, 30000));
        setError(data.error ?? "Login gagal.");
        return;
      }
      window.location.reload();
    } catch {
      setBusy(false);
      setError("Login gagal. Coba lagi.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Login admin</h1>
      <p className="mt-2 text-sm text-muted">Halaman ini hanya untuk admin. Akun admin dibuat di Supabase Auth dengan role admin di tabel profiles.</p>
      <label className="mt-6 block text-sm font-medium">Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block min-h-[48px] w-full rounded-md border px-3 py-2" />
      </label>
      <label className="mt-3 block text-sm font-medium">Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") login(); }} className="mt-1 block min-h-[48px] w-full rounded-md border px-3 py-2" />
      </label>
      {error ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-danger">{error}</p> : null}
      <button type="button" onClick={login} disabled={busy} className="mt-4 min-h-[52px] w-full btn-primary px-4 py-3 font-semibold text-white disabled:opacity-50">
        {busy ? "Masuk…" : "Masuk"}
      </button>
    </main>
  );
}

// Checklist langkah manual + tombol "Tandai domain aktif".
// Tombol baru aktif kalau ketiga langkah manual sudah
// dicentang — supaya admin tidak menandai aktif sebelum
// domain benar-benar ditambahkan di Vercel + Cloudflare.
const MANUAL_STEPS = [
  "Tambah domain di Vercel (Project > Domains)",
  "Tambah CNAME di Cloudflare ke cname.vercel-dns.com, DNS only (proxy mati)",
  "Tunggu Vercel menandai domain Valid",
] as const;

export function ActivateButton({ orderId, subdomain }: { orderId: string; subdomain: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);
  const allChecked = checked.every(Boolean);

  async function activate() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/orders/${orderId}/activate`, { method: "POST" });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) setError(data.error ?? "Gagal mengaktifkan domain.");
    else setDone(true);
  }

  if (done) return <span className="text-sm font-medium text-success">✓ Aktif — email pemberitahuan dikirim (sekali).</span>;

  return (
    <span className="flex flex-col gap-2">
      <span className="text-sm font-medium">Checklist manual:</span>
      {MANUAL_STEPS.map((label, i) => (
        <label key={label} className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={(e) => setChecked((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
            className="mt-0.5 h-5 w-5"
          />
          {label}
        </label>
      ))}
      <button type="button" onClick={activate} disabled={busy || !allChecked} className="min-h-[48px] rounded-xl bg-green-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
        {busy ? "Mengaktifkan…" : `Tandai domain aktif (${subdomain}.portofolio.my.id)`}
      </button>
      {!allChecked ? <span className="text-xs text-muted">Centang ketiga langkah di atas dulu.</span> : null}
      {error ? <span className="text-sm text-danger">{error}</span> : null}
    </span>
  );
}

// Keputusan murni untuk tes: siapa boleh mengaktifkan apa.
export function decideActivation(input: { isAdmin: boolean; orderStatus: string }): {
  allowed: boolean;
  error?: string;
  already?: boolean;
} {
  if (!input.isAdmin) return { allowed: false, error: "forbidden_non_admin" };
  if (input.orderStatus === "published") return { allowed: true, already: true };
  if (input.orderStatus !== "domain_pending") return { allowed: false, error: "invalid_order_status" };
  return { allowed: true };
}
