// /buat/selesai — Langkah 3 alur baru: konfirmasi akhir.
// Muat draft + templateId dari localStorage; kalau belum
// lengkap, kembali ke /buat/template. Tombol "Ya" memanggil
// POST /api/buat/create, lalu halaman yang sama menampilkan
// pratinjau lengkap + tautan berbagi yang bisa disalin.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTemplate } from "@/lib/templates/registry";
import {
  draftToPortfolioData,
  loadValidatedBuatDraft,
  type BuatDraft,
} from "@/lib/buat";

interface HasilBuat {
  shareCode: string;
  url: string;
}

export default function SelesaiPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BuatDraft | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [membuat, setMembuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [hasil, setHasil] = useState<HasilBuat | null>(null);
  const [disalin, setDisalin] = useState(false);

  useEffect(() => {
    const dimuat = loadValidatedBuatDraft();
    if (
      !dimuat ||
      dimuat.fullName.trim() === "" ||
      !dimuat.templateId ||
      !getTemplate(dimuat.templateId)
    ) {
      router.replace("/buat/template");
      return;
    }
    setDraft(dimuat);
    setMemuat(false);
  }, [router]);

  async function buatPortofolio() {
    if (!draft || !draft.templateId || membuat) return;
    setMembuat(true);
    setGalat(null);
    try {
      const res = await fetch("/api/buat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft, templateId: draft.templateId }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setGalat(body?.error ?? "Gagal membuat portofolio. Coba lagi.");
        return;
      }
      setHasil({ shareCode: body.shareCode, url: body.url });
    } catch {
      setGalat("Gagal terhubung ke server. Periksa koneksimu lalu coba lagi.");
    } finally {
      setMembuat(false);
    }
  }

  async function salinTautan() {
    if (!hasil) return;
    try {
      await navigator.clipboard.writeText(hasil.url);
      setDisalin(true);
    } catch {
      setGalat("Tautan tidak bisa disalin otomatis. Salin manual dari kolom di atas.");
    }
  }

  if (memuat || !draft) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm text-muted">Memuat…</p>
      </main>
    );
  }

  const meta = getTemplate(draft.templateId as string);
  if (!meta) return null;
  const data = draftToPortfolioData(draft, meta.id);

  // Sudah jadi: pratinjau lengkap + tautan berbagi.
  if (hasil) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="fade-up">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
            Portofoliomu sudah jadi
          </p>
          <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
            Selamat, {draft.fullName}!
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            Portofoliomu dengan template {meta.name} sudah bisa dibagikan
            lewat tautan di bawah ini.
          </p>
        </div>

        <div className="card mt-8 p-5">
          <label htmlFor="tautan-bagikan" className="text-sm font-medium">
            Tautan berbagi
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <input
              id="tautan-bagikan"
              type="text"
              readOnly
              value={hasil.url}
              onFocus={(e) => e.target.select()}
              className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-3 text-sm"
            />
            <button
              type="button"
              onClick={salinTautan}
              className="btn-primary px-5 py-3 text-sm"
            >
              Salin tautan
            </button>
            <Link
              href={`/bagikan/${hasil.shareCode}`}
              className="rounded-md border border-line bg-white px-5 py-3 text-sm font-medium hover:bg-gray-50"
            >
              Lihat halaman bagikan
            </Link>
          </div>
          {disalin && (
            <p className="mt-3 text-sm font-medium text-green-700">
              Tautan disalin
            </p>
          )}
        </div>

        <section className="mt-12">
          <h2 className="text-3xl">Pratinjau portofoliomu</h2>
          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white">
            <meta.Component data={data} />
          </div>
        </section>
      </main>
    );
  }

  // Belum dibuat: ringkasan + pertanyaan konfirmasi.
  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <div className="fade-up">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
          Langkah 3 dari 3 — Konfirmasi akhir
        </p>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
          Buat portofolio?
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Periksa dulu ringkasan di bawah ini. Kalau sudah benar,
          portofoliomu langsung jadi dan bisa dibagikan.
        </p>
      </div>

      <div className="card mt-8 p-5">
        <dl className="grid gap-3 text-[15px] sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-faint">
              Nama
            </dt>
            <dd className="mt-1 font-medium">{draft.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-faint">
              Template
            </dt>
            <dd className="mt-1 font-medium">{meta.name}</dd>
          </div>
          {draft.headline && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase tracking-wide text-faint">
                Headline
              </dt>
              <dd className="mt-1">{draft.headline}</dd>
            </div>
          )}
        </dl>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl">Pratinjau: {meta.name}</h2>
        <div className="relative mt-4 max-h-96 overflow-hidden rounded-xl border border-line bg-white">
          <meta.Component data={data} />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent"
          />
        </div>
        <p className="mt-3 text-sm text-muted">
          Cuplikan di atas hanya sebagian — pratinjau lengkap tampil
          setelah portofolio dibuat.
        </p>
      </section>

      {galat && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {galat}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={buatPortofolio}
          disabled={membuat}
          className="btn-primary px-6 py-3 text-base"
        >
          {membuat ? "Membuat portofolio…" : "Ya, buat portofolio"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/buat/template")}
          disabled={membuat}
          className="rounded-md border border-line bg-white px-6 py-3 text-base font-medium hover:bg-gray-50 disabled:opacity-50"
        >
          Tidak, ganti template
        </button>
      </div>
    </main>
  );
}
