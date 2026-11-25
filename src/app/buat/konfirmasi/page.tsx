"use client";
// Langkah 2 alur baru: konfirmasi data sebelum memilih
// template. Menampilkan SEMUA data yang diisi dalam seksi
// rapi; bagian yang kosong tidak ditampilkan. Kalau belum
// ada nama lengkap (belum mengisi form), kembali ke /buat.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SKILL_LEVEL_LABELS } from "@/lib/types";
import { emptyBuatDraft, loadValidatedBuatDraft, type BuatDraft } from "@/lib/buat";
import { formatDate, formatRange } from "@/components/templates/shared";

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// "2024-03" -> "Maret 2024". Nilai lain dikembalikan apa adanya.
function formatBulanTahun(nilai: string | undefined): string {
  if (!nilai) return "";
  const cocok = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(nilai.trim());
  if (!cocok) return nilai;
  const bulan = NAMA_BULAN[Number(cocok[2]) - 1];
  return `${bulan} ${cocok[1]}`;
}

export default function KonfirmasiPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<BuatDraft | null>(null);

  useEffect(() => {
    // Muat draft tersimpan — sudah divalidasi dengan schema
    // lalu digabung dengan draft kosong (loadValidatedBuatDraft).
    const isi: BuatDraft = loadValidatedBuatDraft() ?? emptyBuatDraft();
    if (!isi.fullName.trim()) {
      router.replace("/buat");
      return;
    }
    setDraft(isi);
  }, [router]);

  // Selama draft dimuat, tampilkan halaman kosong supaya
  // tidak sempat berkedip ke /buat sebelum redirect.
  if (!draft) return null;

  const lokasi = [draft.city, draft.province].map((s) => s.trim()).filter(Boolean).join(", ");
  const tautan: { label: string; href: string }[] = [];
  if (draft.websiteUrl) tautan.push({ label: "Website", href: draft.websiteUrl });
  if (draft.linkedinUrl) tautan.push({ label: "LinkedIn", href: draft.linkedinUrl });
  if (draft.githubUrl) tautan.push({ label: "GitHub", href: draft.githubUrl });
  if (draft.instagramUrl) tautan.push({ label: "Instagram", href: draft.instagramUrl });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <div className="fade-up">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">Langkah 2 dari 4 — Konfirmasi data</p>
        <h1 className="mt-4 text-4xl leading-[1.05] tracking-[-0.04em] sm:text-5xl">Apakah data Anda sudah benar?</h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
          Periksa sekali lagi — yang tampil di bawah inilah yang akan dipakai
          di portofolio kamu. Bagian yang kosong tidak ditampilkan.
        </p>
      </div>

      <div className="fade-up mt-10 space-y-8" style={{ animationDelay: "100ms" }}>
        {/* ---------- Identitas ---------- */}
        <section className="card p-6 sm:p-8">
          <h2 className="text-2xl">Identitas</h2>
          <div className="mt-5 flex items-start gap-5">
            {draft.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto profil pengguna dari upload, bukan aset statis.
              <img src={draft.photoUrl} alt={`Foto ${draft.fullName}`} className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-line" />
            ) : null}
            <dl className="space-y-2 text-[15px] leading-relaxed">
              <div>
                <dt className="text-sm text-muted">Nama lengkap</dt>
                <dd className="font-medium">{draft.fullName}</dd>
              </div>
              {draft.headline ? (
                <div>
                  <dt className="text-sm text-muted">Headline</dt>
                  <dd>{draft.headline}</dd>
                </div>
              ) : null}
              {draft.bio ? (
                <div>
                  <dt className="text-sm text-muted">Tentang saya</dt>
                  <dd className="whitespace-pre-line">{draft.bio}</dd>
                </div>
              ) : null}
              {draft.phone ? (
                <div>
                  <dt className="text-sm text-muted">No. HP</dt>
                  <dd>{draft.phone}</dd>
                </div>
              ) : null}
              {draft.whatsapp ? (
                <div>
                  <dt className="text-sm text-muted">WhatsApp</dt>
                  <dd>{draft.whatsapp}</dd>
                </div>
              ) : null}
              {lokasi ? (
                <div>
                  <dt className="text-sm text-muted">Kota / Provinsi</dt>
                  <dd>{lokasi}</dd>
                </div>
              ) : null}
              {tautan.length > 0 ? (
                <div>
                  <dt className="text-sm text-muted">Tautan</dt>
                  <dd className="space-y-1">
                    {tautan.map((t) => (
                      // Tampilkan alamatnya, bukan hanya labelnya,
                      // supaya user bisa memeriksa ketikannya.
                      <a key={t.label} href={t.href} target="_blank" rel="noreferrer" title={t.href} className="block break-all font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600">
                        {t.label}: {t.href.replace(/^https?:\/\//, "")}
                      </a>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </section>

        {/* ---------- Pendidikan ---------- */}
        {draft.education.length > 0 ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl">Pendidikan</h2>
            <ul className="mt-5 space-y-5">
              {draft.education.map((item, i) => (
                <li key={i} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                  <p className="font-medium">{item.institution}</p>
                  {[item.degree, item.fieldOfStudy].filter(Boolean).join(" — ") ? (
                    <p className="text-[15px] text-muted">{[item.degree, item.fieldOfStudy].filter(Boolean).join(" — ")}</p>
                  ) : null}
                  {formatRange(item.startDate ?? null, item.endDate ?? null) ? (
                    <p className="text-sm text-muted">{formatRange(item.startDate ?? null, item.endDate ?? null)}</p>
                  ) : null}
                  {typeof item.gpa === "number" ? (
                    <p className="text-sm text-muted">Nilai/IPK: {item.gpa}</p>
                  ) : null}
                  {item.description ? <p className="mt-1 text-[15px] leading-relaxed">{item.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------- Pengalaman ---------- */}
        {draft.experiences.length > 0 ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl">Pengalaman</h2>
            <ul className="mt-5 space-y-5">
              {draft.experiences.map((item, i) => (
                <li key={i} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                  <p className="font-medium">{item.position} — {item.company}</p>
                  {formatRange(item.startDate ?? null, item.endDate ?? null, item.isCurrent) ? (
                    <p className="text-sm text-muted">{formatRange(item.startDate ?? null, item.endDate ?? null, item.isCurrent)}</p>
                  ) : null}
                  {item.description ? <p className="mt-1 text-[15px] leading-relaxed">{item.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------- Proyek ---------- */}
        {draft.projects.length > 0 ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl">Proyek</h2>
            <ul className="mt-5 space-y-5">
              {draft.projects.map((item, i) => (
                <li key={i} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                  <p className="font-medium">{item.title}</p>
                  {item.description ? <p className="mt-1 text-[15px] leading-relaxed">{item.description}</p> : null}
                  {item.url ? (
                    <p className="mt-1 text-sm">
                      <a href={item.url} target="_blank" rel="noreferrer" className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600">
                        Lihat proyek
                      </a>
                    </p>
                  ) : null}
                  {item.imageUrl ? (
                    <p className="mt-1 break-all text-sm text-muted">Gambar: {item.imageUrl}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------- Keahlian ---------- */}
        {draft.skills.length > 0 ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl">Keahlian</h2>
            <ul className="mt-5 space-y-2">
              {draft.skills.map((item, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-2 text-[15px]">
                  <span className="font-medium">{item.name}</span>
                  {item.category ? <span className="text-muted">· {item.category}</span> : null}
                  {typeof item.level === "number" ? (
                    <span className="text-muted">· {item.level} – {SKILL_LEVEL_LABELS[item.level]}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------- Sertifikasi ---------- */}
        {draft.certifications.length > 0 ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl">Sertifikasi</h2>
            <ul className="mt-5 space-y-5">
              {draft.certifications.map((item, i) => (
                <li key={i} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                  <p className="font-medium">{item.name}</p>
                  {item.issuer ? <p className="text-[15px] text-muted">{item.issuer}</p> : null}
                  {formatDate(item.issueDate ?? null) ? (
                    <p className="text-sm text-muted">
                      Terbit: {formatDate(item.issueDate ?? null)}
                      {formatDate(item.expiryDate ?? null) ? ` · Berlaku sampai ${formatDate(item.expiryDate ?? null)}` : ""}
                    </p>
                  ) : null}
                  {item.credentialId ? <p className="text-sm text-muted">ID kredensial: {item.credentialId}</p> : null}
                  {item.credentialUrl ? (
                    <p className="mt-1 text-sm">
                      <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600">
                        Lihat kredensial
                      </a>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------- Pencapaian ---------- */}
        {draft.achievements.length > 0 ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl">Pencapaian</h2>
            <ul className="mt-5 space-y-5">
              {draft.achievements.map((item, i) => (
                <li key={i} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                  <p className="font-medium">{item.title}</p>
                  {item.issuer ? <p className="text-[15px] text-muted">{item.issuer}</p> : null}
                  {formatBulanTahun(item.date) ? (
                    <p className="text-sm text-muted">{formatBulanTahun(item.date)}</p>
                  ) : null}
                  {item.description ? <p className="mt-1 text-[15px] leading-relaxed">{item.description}</p> : null}
                  {item.documentUrl ? (
                    <p className="mt-1 text-sm">
                      <a href={item.documentUrl} target="_blank" rel="noreferrer" className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600">
                        Lihat dokumen pendukung
                      </a>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ---------- Bahasa ---------- */}
        {draft.languages.length > 0 ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl">Bahasa</h2>
            <ul className="mt-5 space-y-2">
              {draft.languages.map((item, i) => (
                <li key={i} className="flex flex-wrap items-baseline gap-x-2 text-[15px]">
                  <span className="font-medium">{item.language}</span>
                  <span className="text-muted">· {item.level}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="/buat"
            className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-md border border-line bg-white px-6 py-3 text-base font-medium hover:border-brand-500 hover:text-brand-500"
          >
            Ubah data
          </a>
          <a
            href="/buat/template"
            className="btn-primary inline-flex min-h-[52px] flex-1 items-center justify-center px-6 py-3 text-base"
          >
            Lanjut pilih template
          </a>
        </div>
      </div>
    </main>
  );
}
