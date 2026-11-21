"use client";
import { useState } from "react";

// Upload foto/gambar lewat server (/api/upload).
// File tidak pernah dikirim langsung ke Supabase dari browser.
export default function UploadField({
  token,
  label,
  onUploaded,
  currentUrl,
}: {
  token: string;
  label: string;
  onUploaded: (url: string, path: string) => void;
  currentUrl?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(file: File | undefined) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("token", token);
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload gagal.");
      onUploaded(data.url ?? data.path, data.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload gagal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium">{label} (JPG/PNG/WebP, maks 2 MB)</label>
      {currentUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentUrl} alt="Pratinjau upload" className="mt-2 h-28 w-28 rounded-xl object-cover" />
      ) : null}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(e) => handle(e.target.files?.[0])}
        className="mt-2 block w-full min-h-[48px] rounded-md border px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-500 file:px-3 file:py-2 file:text-white"
      />
      {busy ? <p className="mt-1 text-sm text-muted">Mengunggah…</p> : null}
      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
