// /buat/template — Langkah 2 alur baru: pilih template.
// Muat draft dari localStorage (sudah divalidasi schema);
// kalau belum ada nama lengkap, kembali ke /buat.
// Klik kartu = pilih template itu (templateId disimpan ke
// draft) dan pratinjau langsung tampil di bawah grid dengan
// data draft. Template bisa diganti berkali-kali, data
// tetap utuh — draft tidak berubah selain templateId.
// Daftar kartu diambil dari BUAT_TEMPLATE_LIST (3 template
// ThemeWagon saja): 8 template lama tidak me-render seksi
// Pencapaian/Bahasa, jadi tidak dipakai di alur baru.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BUAT_TEMPLATE_LIST, getTemplate } from "@/lib/templates/registry";
import {
  draftToPortfolioData,
  loadValidatedBuatDraft,
  saveBuatDraft,
  type BuatDraft,
} from "@/lib/buat";

export default function PilihTemplatePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BuatDraft | null>(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    const dimuat = loadValidatedBuatDraft();
    if (!dimuat || dimuat.fullName.trim() === "") {
      router.replace("/buat");
      return;
    }
    setDraft(dimuat);
    setMemuat(false);
  }, [router]);

  function pilihTemplate(templateId: string) {
    if (!draft) return;
    const baru = { ...draft, templateId };
    setDraft(baru);
    saveBuatDraft(baru);
  }

  if (memuat || !draft) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm text-muted">Memuat…</p>
      </main>
    );
  }

  const terpilih = draft.templateId ? getTemplate(draft.templateId) : null;
  const pratinjau =
    terpilih !== null ? draftToPortfolioData(draft, terpilih.id) : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <div className="fade-up">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">
          Langkah 2 dari 3 — Pilih template
        </p>
        <h1 className="mt-4 text-4xl leading-tight sm:text-5xl">
          Pilih template portofoliomu
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Halo, {draft.fullName}. Klik satu template untuk melihat
          pratinjau langsung dengan datamu. Kamu bisa ganti
          berkali-kali sebelum lanjut.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {BUAT_TEMPLATE_LIST.map((t) => {
          const aktif = draft.templateId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => pilihTemplate(t.id)}
              aria-pressed={aktif}
              className={`card card-hover overflow-hidden text-left ${
                aktif ? "ring-2 ring-brand-500" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail statis 800x500 yang sudah dioptimasi, lazy-loaded; next/image tidak menambah nilai di sini. */}
              <img
                src={`/templates/thumbs/${t.id}.jpg`}
                alt={`Pratinjau template ${t.name}`}
                width={800}
                height={500}
                loading="lazy"
                className="aspect-[8/5] w-full object-cover object-top"
              />
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-2xl">{t.name}</h2>
                  {aktif && (
                    <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">
                      Dipilih
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">
                  {t.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {terpilih && pratinjau && (
        <section className="mt-12">
          <h2 className="text-3xl">Pratinjau: {terpilih.name}</h2>
          <p className="mt-2 text-[15px] text-muted">
            Ini tampilan portofoliomu dengan template {terpilih.name}.
            Masih bisa diganti — klik template lain di atas.
          </p>
          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white">
            <terpilih.Component data={pratinjau} />
          </div>
        </section>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/buat/selesai")}
          disabled={!draft.templateId}
          className="btn-primary px-6 py-3 text-base"
        >
          Lanjut ke konfirmasi akhir
        </button>
        <Link
          href="/buat"
          className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600"
        >
          ← Kembali ubah data
        </Link>
      </div>
      {!draft.templateId && (
        <p className="mt-3 text-sm text-muted">
          Pilih satu template dulu untuk melanjutkan.
        </p>
      )}
    </main>
  );
}
