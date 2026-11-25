"use client";
// Form biodata alur baru (/buat): semua seksi dalam satu
// halaman panjang — Identitas, Pendidikan, Pengalaman,
// Proyek, Keahlian, Sertifikasi, Pencapaian, Bahasa.
// Bukan wizard: tiap seksi punya judul sendiri dan bisa
// diisi dalam urutan apa saja.
//
// Draft otomatis tersimpan di localStorage di setiap
// perubahan (saveBuatDraft). Tombol di bawah memvalidasi
// dengan buatDraftSchema; kalau lolos, lanjut ke
// /buat/konfirmasi. Foto & dokumen PDF di-upload ke
// POST /api/buat/upload — kalau upload gagal, form tetap
// bisa dilanjutkan (foto/dokumen bersifat opsional).
// Tidak ada verifikasi apa pun: yang diisi itulah yang
// ditampilkan di portofolio.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buatDraftSchema,
  languageLevelSchema,
  validateImageFile,
  validatePdfFile,
} from "@/lib/validation";
import { MASTER_SKILLS } from "@/lib/skills-master";
import { SKILL_LEVEL_LABELS } from "@/lib/types";
import {
  emptyBuatDraft,
  loadValidatedBuatDraft,
  normalizeBuatDraft,
  saveBuatDraft,
  type BuatAchievementItem,
  type BuatCertificationItem,
  type BuatDraft,
  type BuatEducationItem,
  type BuatExperienceItem,
  type BuatLanguageItem,
  type BuatProjectItem,
  type BuatSkillItem,
} from "@/lib/buat";

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const BAHASA_UMUM = [
  "Indonesia", "Inggris", "Jawa", "Sunda", "Mandarin", "Arab",
  "Jepang", "Korea", "Belanda", "Prancis", "Jerman", "Spanyol",
  "Melayu", "Tagalog", "Hindi", "Rusia", "Italia", "Portugis",
  "Turki", "Vietnam", "Thailand",
];

const TINGKAT_BAHASA = languageLevelSchema.options;

// Muat draft tersimpan — sudah divalidasi dengan schema
// lalu digabung dengan draft kosong (loadValidatedBuatDraft),
// supaya draft lama atau rusak tidak merusak form.
function muatDraftTersimpan(): BuatDraft {
  return loadValidatedBuatDraft() ?? emptyBuatDraft();
}

const barisPendidikanBaru = (): BuatEducationItem => ({
  institution: "",
  degree: "",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  gpa: undefined,
  description: "",
});

const barisPengalamanBaru = (): BuatExperienceItem => ({
  company: "",
  position: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
});

const barisProyekBaru = (): BuatProjectItem => ({
  title: "",
  description: "",
  url: "",
  imageUrl: "",
  isVisible: true,
});

const barisKeahlianBaru = (): BuatSkillItem => ({
  name: "",
  category: "",
  level: undefined,
});

const barisSertifikasiBaru = (): BuatCertificationItem => ({
  name: "",
  issuer: "",
  issueDate: "",
  expiryDate: "",
  credentialId: "",
  credentialUrl: "",
});

const barisPencapaianBaru = (): BuatAchievementItem => ({
  title: "",
  issuer: "",
  bulan: "",
  tahun: "",
  date: "",
  description: "",
  documentUrl: "",
});

const barisBahasaBaru = (): BuatLanguageItem => ({
  language: "",
  level: "Tingkat Dasar",
});

export default function BuatForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<BuatDraft>(emptyBuatDraft);
  // Draft baru dimuat di useEffect (bukan di inisialisasi
  // state) supaya render server dan hasil hydration sama —
  // localStorage hanya ada di browser.
  const [siap, setSiap] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorAtas, setErrorAtas] = useState("");
  const [sibuk, setSibuk] = useState(false);

  // Foto profil
  const [fotoSibuk, setFotoSibuk] = useState(false);
  const [fotoError, setFotoError] = useState("");
  // Dokumen PDF pencapaian, per baris
  const [dokSibuk, setDokSibuk] = useState<number | null>(null);
  const [dokError, setDokError] = useState<Record<number, string>>({});
  const [dokNama, setDokNama] = useState<Record<number, string>>({});

  useEffect(() => {
    setDraft(muatDraftTersimpan());
    setSiap(true);
  }, []);

  // Autosave di setiap perubahan, tapi hanya setelah draft
  // tersimpan selesai dimuat — kalau tidak, draft kosong
  // dari render pertama akan menimpa draft tersimpan.
  useEffect(() => {
    if (siap) saveBuatDraft(draft);
  }, [draft, siap]);

  // --- Helper daftar berulang (tambah / ubah / hapus baris) ---
  const ubahPendidikan = (i: number, patch: Partial<BuatEducationItem>) =>
    setDraft((d) => ({ ...d, education: d.education.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const ubahPengalaman = (i: number, patch: Partial<BuatExperienceItem>) =>
    setDraft((d) => ({ ...d, experiences: d.experiences.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const ubahProyek = (i: number, patch: Partial<BuatProjectItem>) =>
    setDraft((d) => ({ ...d, projects: d.projects.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const ubahKeahlian = (i: number, patch: Partial<BuatSkillItem>) =>
    setDraft((d) => ({ ...d, skills: d.skills.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const ubahSertifikasi = (i: number, patch: Partial<BuatCertificationItem>) =>
    setDraft((d) => ({ ...d, certifications: d.certifications.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const ubahPencapaian = (i: number, patch: Partial<BuatAchievementItem>) =>
    setDraft((d) => ({ ...d, achievements: d.achievements.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
  const ubahBahasa = (i: number, patch: Partial<BuatLanguageItem>) =>
    setDraft((d) => ({ ...d, languages: d.languages.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));

  const hapusDari = <K extends "education" | "experiences" | "projects" | "skills" | "certifications" | "achievements" | "languages">(
    kunci: K,
    i: number,
  ) => setDraft((d) => ({ ...d, [kunci]: d[kunci].filter((_, j) => j !== i) }));

  // --- Upload foto profil (opsional) ---
  async function uploadFoto(file: File) {
    const salah = validateImageFile(file);
    if (salah) {
      setFotoError(salah);
      return;
    }
    setFotoError("");
    setFotoSibuk(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "photo");
      const res = await fetch("/api/buat/upload", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload gagal. Coba lagi.");
      if (!data.url) throw new Error("Upload gagal. Coba lagi.");
      setDraft((d) => ({ ...d, photoUrl: data.url as string }));
    } catch (err) {
      // Foto opsional: tampilkan pesan, user tetap bisa
      // lanjut tanpa foto.
      setFotoError(err instanceof Error ? err.message : "Upload gagal. Coba lagi.");
    } finally {
      setFotoSibuk(false);
    }
  }

  // --- Upload dokumen PDF pencapaian (opsional) ---
  async function uploadDokumen(i: number, file: File) {
    const salah = validatePdfFile(file);
    if (salah) {
      setDokError((e) => ({ ...e, [i]: salah }));
      return;
    }
    setDokError((e) => ({ ...e, [i]: "" }));
    setDokSibuk(i);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "document");
      const res = await fetch("/api/buat/upload", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Upload gagal. Coba lagi.");
      if (!data.url) throw new Error("Upload gagal. Coba lagi.");
      ubahPencapaian(i, { documentUrl: data.url });
      setDokNama((n) => ({ ...n, [i]: file.name }));
    } catch (err) {
      setDokError((e) => ({ ...e, [i]: err instanceof Error ? err.message : "Upload gagal. Coba lagi." }));
    } finally {
      setDokSibuk(null);
    }
  }

  function simpan(e: React.FormEvent) {
    e.preventDefault();
    setSibuk(true);
    const parsed = buatDraftSchema.safeParse(draft);
    if (!parsed.success) {
      const peta: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const kunci = issue.path.join(".");
        if (!peta[kunci]) peta[kunci] = issue.message;
      }
      setErrors(peta);
      setErrorAtas("Masih ada data yang perlu diperbaiki. Periksa kolom yang ditandai merah di bawah.");
      setSibuk(false);
      return;
    }
    setErrors({});
    setErrorAtas("");
    // Hasil parse schema punya field opsional bertipe
    // string | undefined; normalisasi dulu ke BuatDraft
    // penuh (string kosong untuk yang tidak diisi).
    const normal = normalizeBuatDraft(parsed.data);
    if (!normal) {
      setErrorAtas("Data tidak bisa disimpan. Coba muat ulang halaman.");
      setSibuk(false);
      return;
    }
    saveBuatDraft(normal);
    router.push("/buat/konfirmasi");
  }

  // --- Kelas & potongan tampilan bersama ---
  // Input 48px, radius 6px, border #E8E8EC — sesuai Genesis.
  const inputCls =
    "mt-1 block w-full min-h-[48px] rounded-md border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder:text-faint focus:border-brand-500";
  const inputSalah = (kunci: string) => (errors[kunci] ? " border-danger" : "");
  const PesanError = ({ kunci }: { kunci: string }) =>
    errors[kunci] ? <p className="mt-1 text-sm text-danger">{errors[kunci]}</p> : null;
  const labelCls = "text-sm font-medium";

  const tahunBerjalan = new Date().getFullYear();
  const daftarTahun: number[] = [];
  for (let t = tahunBerjalan; t >= 1990; t--) daftarTahun.push(t);

  // Bulan & tahun disimpan TERPISAH di baris pencapaian.
  // Dulu keduanya hanya diturunkan dari `date`, dan memilih
  // satu saja langsung mengosongkan `date` — pilihan ikut
  // hilang dan dropdown kembali ke placeholder. Sekarang
  // pilihan bertahan; `date` ("YYYY-MM") baru dibentuk
  // kalau bulan DAN tahun sudah terpilih.
  function ubahBulanTahunPencapaian(i: number, bulan: string, tahun: string) {
    ubahPencapaian(i, { bulan, tahun, date: bulan && tahun ? `${tahun}-${bulan}` : "" });
  }

  // Nama keahlian: kalau cocok dengan daftar master
  // (tidak peduli huruf besar-kecil), kategori terisi
  // otomatis; kalau tidak cocok, user pilih sendiri.
  function ubahNamaKeahlian(i: number, nama: string) {
    const cocok = MASTER_SKILLS.find((s) => s.name.toLowerCase() === nama.trim().toLowerCase());
    ubahKeahlian(i, { name: nama, ...(cocok ? { category: cocok.category } : {}) });
  }

  return (
    <form onSubmit={simpan} className="space-y-8" noValidate>
      {errorAtas ? (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-danger">
          {errorAtas}
        </p>
      ) : null}

      {/* ---------- Identitas ---------- */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl">Identitas</h2>
        <p className="mt-1 text-sm text-muted">Data diri yang tampil di portofolio kamu.</p>
        <div className="mt-6 space-y-5">
          <div>
            <label className={labelCls} htmlFor="fullName">Nama lengkap *</label>
            <input
              id="fullName"
              type="text"
              required
              value={draft.fullName}
              onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
              placeholder="Nama kamu"
              className={inputCls + inputSalah("fullName")}
            />
            <PesanError kunci="fullName" />
          </div>
          <div>
            <label className={labelCls} htmlFor="headline">Headline</label>
            <input
              id="headline"
              type="text"
              value={draft.headline}
              onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))}
              placeholder="cth. Web Developer | Fresh Graduate Informatika"
              maxLength={120}
              className={inputCls + inputSalah("headline")}
            />
            <PesanError kunci="headline" />
          </div>
          <div>
            <label className={labelCls} htmlFor="bio">Tentang saya</label>
            <textarea
              id="bio"
              rows={4}
              value={draft.bio}
              onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
              placeholder="Ceritakan singkat tentang dirimu"
              maxLength={1000}
              className={inputCls + " resize-y" + inputSalah("bio")}
            />
            <PesanError kunci="bio" />
          </div>
          <div>
            <span className={labelCls}>Foto profil</span>
            <p className="mt-1 text-xs text-muted">JPG, PNG, atau WebP, maksimal 2 MB. Opsional — boleh lanjut tanpa foto.</p>
            {draft.photoUrl ? (
              <div className="mt-3 flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element -- pratinjau foto yang baru di-upload pengguna, bukan aset statis. */}
                <img src={draft.photoUrl} alt="Pratinjau foto profil" className="h-24 w-24 rounded-full object-cover ring-1 ring-line" />
                <button
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, photoUrl: null }))}
                  className="min-h-[48px] rounded-md border border-line px-4 py-2.5 text-sm font-medium text-danger hover:border-danger"
                >
                  Hapus foto
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={fotoSibuk}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadFoto(file);
                  e.target.value = "";
                }}
                className="mt-3 block w-full text-sm text-muted file:mr-3 file:min-h-[48px] file:rounded-md file:border-0 file:bg-brand-500 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600 disabled:opacity-50"
              />
            )}
            {fotoSibuk ? <p className="mt-1 text-sm text-muted">Mengunggah foto…</p> : null}
            {fotoError ? <p className="mt-1 text-sm text-danger">{fotoError}</p> : null}
            <PesanError kunci="photoUrl" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="phone">No. HP</label>
              <input
                id="phone"
                type="tel"
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                placeholder="cth. 081234567890"
                className={inputCls + inputSalah("phone")}
              />
              <PesanError kunci="phone" />
            </div>
            <div>
              <label className={labelCls} htmlFor="whatsapp">WhatsApp</label>
              <input
                id="whatsapp"
                type="tel"
                value={draft.whatsapp}
                onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))}
                placeholder="cth. 081234567890"
                className={inputCls + inputSalah("whatsapp")}
              />
              <PesanError kunci="whatsapp" />
            </div>
            <div>
              <label className={labelCls} htmlFor="city">Kota</label>
              <input
                id="city"
                type="text"
                value={draft.city}
                onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))}
                placeholder="cth. Pekanbaru"
                className={inputCls + inputSalah("city")}
              />
              <PesanError kunci="city" />
            </div>
            <div>
              <label className={labelCls} htmlFor="province">Provinsi</label>
              <input
                id="province"
                type="text"
                value={draft.province}
                onChange={(e) => setDraft((d) => ({ ...d, province: e.target.value }))}
                placeholder="cth. Riau"
                className={inputCls + inputSalah("province")}
              />
              <PesanError kunci="province" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="websiteUrl">Website</label>
              <input
                id="websiteUrl"
                type="text"
                inputMode="url"
                value={draft.websiteUrl}
                onChange={(e) => setDraft((d) => ({ ...d, websiteUrl: e.target.value }))}
                placeholder="cth. namamu.com"
                className={inputCls + inputSalah("websiteUrl")}
              />
              <PesanError kunci="websiteUrl" />
            </div>
            <div>
              <label className={labelCls} htmlFor="linkedinUrl">LinkedIn</label>
              <input
                id="linkedinUrl"
                type="text"
                inputMode="url"
                value={draft.linkedinUrl}
                onChange={(e) => setDraft((d) => ({ ...d, linkedinUrl: e.target.value }))}
                placeholder="cth. linkedin.com/in/namamu"
                className={inputCls + inputSalah("linkedinUrl")}
              />
              <PesanError kunci="linkedinUrl" />
            </div>
            <div>
              <label className={labelCls} htmlFor="githubUrl">GitHub</label>
              <input
                id="githubUrl"
                type="text"
                inputMode="url"
                value={draft.githubUrl}
                onChange={(e) => setDraft((d) => ({ ...d, githubUrl: e.target.value }))}
                placeholder="cth. github.com/namamu"
                className={inputCls + inputSalah("githubUrl")}
              />
              <PesanError kunci="githubUrl" />
            </div>
            <div>
              <label className={labelCls} htmlFor="instagramUrl">Instagram</label>
              <input
                id="instagramUrl"
                type="text"
                inputMode="url"
                value={draft.instagramUrl}
                onChange={(e) => setDraft((d) => ({ ...d, instagramUrl: e.target.value }))}
                placeholder="cth. instagram.com/namamu"
                className={inputCls + inputSalah("instagramUrl")}
              />
              <PesanError kunci="instagramUrl" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Pendidikan ---------- */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl">Pendidikan</h2>
        <p className="mt-1 text-sm text-muted">Riwayat pendidikan formal kamu.</p>
        <div className="mt-6 space-y-5">
          {draft.education.map((item, i) => (
            <div key={i} className="rounded-xl border border-line p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Pendidikan {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => hapusDari("education", i)}
                  className="min-h-[48px] px-3 text-sm font-medium text-danger hover:underline"
                >
                  Hapus
                </button>
              </div>
              <div className="mt-4 space-y-5">
                <div>
                  <label className={labelCls} htmlFor={`edu-institution-${i}`}>Institusi *</label>
                  <input
                    id={`edu-institution-${i}`}
                    type="text"
                    value={item.institution}
                    onChange={(e) => ubahPendidikan(i, { institution: e.target.value })}
                    placeholder="cth. Universitas Indonesia"
                    className={inputCls + inputSalah(`education.${i}.institution`)}
                  />
                  <PesanError kunci={`education.${i}.institution`} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor={`edu-degree-${i}`}>Jenjang</label>
                    <input
                      id={`edu-degree-${i}`}
                      type="text"
                      value={item.degree ?? ""}
                      onChange={(e) => ubahPendidikan(i, { degree: e.target.value })}
                      placeholder="cth. S1, D3, SMA"
                      className={inputCls + inputSalah(`education.${i}.degree`)}
                    />
                    <PesanError kunci={`education.${i}.degree`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`edu-field-${i}`}>Bidang studi</label>
                    <input
                      id={`edu-field-${i}`}
                      type="text"
                      value={item.fieldOfStudy ?? ""}
                      onChange={(e) => ubahPendidikan(i, { fieldOfStudy: e.target.value })}
                      placeholder="cth. Teknik Informatika"
                      className={inputCls + inputSalah(`education.${i}.fieldOfStudy`)}
                    />
                    <PesanError kunci={`education.${i}.fieldOfStudy`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`edu-start-${i}`}>Tanggal mulai</label>
                    <input
                      id={`edu-start-${i}`}
                      type="date"
                      value={item.startDate ?? ""}
                      onChange={(e) => ubahPendidikan(i, { startDate: e.target.value })}
                      className={inputCls + inputSalah(`education.${i}.startDate`)}
                    />
                    <PesanError kunci={`education.${i}.startDate`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`edu-end-${i}`}>Tanggal selesai</label>
                    <input
                      id={`edu-end-${i}`}
                      type="date"
                      value={item.endDate ?? ""}
                      onChange={(e) => ubahPendidikan(i, { endDate: e.target.value })}
                      className={inputCls + inputSalah(`education.${i}.endDate`)}
                    />
                    <PesanError kunci={`education.${i}.endDate`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`edu-gpa-${i}`}>Nilai/IPK</label>
                    <input
                      id={`edu-gpa-${i}`}
                      type="number"
                      min={0}
                      max={4}
                      step={0.01}
                      inputMode="decimal"
                      value={item.gpa ?? ""}
                      // IPK langsung dibulatkan ke 2 desimal saat
                      // mengetik — nilai mentah input angka kadang
                      // tersimpan sebagai float kotor (3.4600000381469727).
                      onChange={(e) => ubahPendidikan(i, { gpa: e.target.value === "" ? undefined : Math.round(Number(e.target.value) * 100) / 100 })}
                      placeholder="0 – 4, boleh kosong"
                      className={inputCls + inputSalah(`education.${i}.gpa`)}
                    />
                    <PesanError kunci={`education.${i}.gpa`} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} htmlFor={`edu-desc-${i}`}>Keterangan</label>
                  <textarea
                    id={`edu-desc-${i}`}
                    rows={3}
                    value={item.description ?? ""}
                    onChange={(e) => ubahPendidikan(i, { description: e.target.value })}
                    placeholder="Keterangan tambahan tentang pendidikan ini"
                    maxLength={500}
                    className={inputCls + " resize-y" + inputSalah(`education.${i}.description`)}
                  />
                  <PesanError kunci={`education.${i}.description`} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, education: [...d.education, barisPendidikanBaru()] }))}
            className="min-h-[48px] w-full rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:border-brand-500 hover:text-brand-500"
          >
            + Tambah pendidikan
          </button>
        </div>
      </section>

      {/* ---------- Pengalaman ---------- */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl">Pengalaman</h2>
        <p className="mt-1 text-sm text-muted">Pengalaman kerja, magang, atau organisasi.</p>
        <div className="mt-6 space-y-5">
          {draft.experiences.map((item, i) => (
            <div key={i} className="rounded-xl border border-line p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Pengalaman {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => hapusDari("experiences", i)}
                  className="min-h-[48px] px-3 text-sm font-medium text-danger hover:underline"
                >
                  Hapus
                </button>
              </div>
              <div className="mt-4 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor={`exp-company-${i}`}>Perusahaan *</label>
                    <input
                      id={`exp-company-${i}`}
                      type="text"
                      value={item.company}
                      onChange={(e) => ubahPengalaman(i, { company: e.target.value })}
                      placeholder="cth. PT Contoh Sejahtera"
                      className={inputCls + inputSalah(`experiences.${i}.company`)}
                    />
                    <PesanError kunci={`experiences.${i}.company`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`exp-position-${i}`}>Posisi *</label>
                    <input
                      id={`exp-position-${i}`}
                      type="text"
                      value={item.position}
                      onChange={(e) => ubahPengalaman(i, { position: e.target.value })}
                      placeholder="cth. Web Developer"
                      className={inputCls + inputSalah(`experiences.${i}.position`)}
                    />
                    <PesanError kunci={`experiences.${i}.position`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`exp-start-${i}`}>Tanggal mulai</label>
                    <input
                      id={`exp-start-${i}`}
                      type="date"
                      value={item.startDate ?? ""}
                      onChange={(e) => ubahPengalaman(i, { startDate: e.target.value })}
                      className={inputCls + inputSalah(`experiences.${i}.startDate`)}
                    />
                    <PesanError kunci={`experiences.${i}.startDate`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`exp-end-${i}`}>Tanggal selesai</label>
                    <input
                      id={`exp-end-${i}`}
                      type="date"
                      disabled={item.isCurrent}
                      value={item.endDate ?? ""}
                      onChange={(e) => ubahPengalaman(i, { endDate: e.target.value })}
                      className={inputCls + inputSalah(`experiences.${i}.endDate`) + (item.isCurrent ? " opacity-50" : "")}
                    />
                    <PesanError kunci={`experiences.${i}.endDate`} />
                  </div>
                </div>
                <label className="flex min-h-[48px] items-start gap-3 rounded-md border border-line px-3.5 py-2.5 text-sm">
                  <input
                    type="checkbox"
                    checked={item.isCurrent}
                    onChange={(e) => ubahPengalaman(i, { isCurrent: e.target.checked, ...(e.target.checked ? { endDate: "" } : {}) })}
                    className="mt-0.5 h-5 w-5 shrink-0 rounded-full accent-brand-500"
                  />
                  <span>Saya masih bekerja di sini</span>
                </label>
                <div>
                  <label className={labelCls} htmlFor={`exp-desc-${i}`}>Deskripsi</label>
                  <textarea
                    id={`exp-desc-${i}`}
                    rows={3}
                    value={item.description ?? ""}
                    onChange={(e) => ubahPengalaman(i, { description: e.target.value })}
                    placeholder="Apa yang kamu kerjakan di sana?"
                    maxLength={800}
                    className={inputCls + " resize-y" + inputSalah(`experiences.${i}.description`)}
                  />
                  <PesanError kunci={`experiences.${i}.description`} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, experiences: [...d.experiences, barisPengalamanBaru()] }))}
            className="min-h-[48px] w-full rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:border-brand-500 hover:text-brand-500"
          >
            + Tambah pengalaman
          </button>
        </div>
      </section>

      {/* ---------- Proyek ---------- */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl">Proyek</h2>
        <p className="mt-1 text-sm text-muted">Proyek yang pernah kamu buat atau kerjakan.</p>
        <div className="mt-6 space-y-5">
          {draft.projects.map((item, i) => (
            <div key={i} className="rounded-xl border border-line p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Proyek {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => hapusDari("projects", i)}
                  className="min-h-[48px] px-3 text-sm font-medium text-danger hover:underline"
                >
                  Hapus
                </button>
              </div>
              <div className="mt-4 space-y-5">
                <div>
                  <label className={labelCls} htmlFor={`proj-title-${i}`}>Judul proyek *</label>
                  <input
                    id={`proj-title-${i}`}
                    type="text"
                    value={item.title}
                    onChange={(e) => ubahProyek(i, { title: e.target.value })}
                    placeholder="cth. Website Toko Online"
                    className={inputCls + inputSalah(`projects.${i}.title`)}
                  />
                  <PesanError kunci={`projects.${i}.title`} />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`proj-desc-${i}`}>Deskripsi</label>
                  <textarea
                    id={`proj-desc-${i}`}
                    rows={3}
                    value={item.description ?? ""}
                    onChange={(e) => ubahProyek(i, { description: e.target.value })}
                    placeholder="Apa yang dibuat dan untuk siapa?"
                    maxLength={800}
                    className={inputCls + " resize-y" + inputSalah(`projects.${i}.description`)}
                  />
                  <PesanError kunci={`projects.${i}.description`} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor={`proj-url-${i}`}>URL proyek</label>
                    <input
                      id={`proj-url-${i}`}
                      type="text"
                      inputMode="url"
                      value={item.url ?? ""}
                      onChange={(e) => ubahProyek(i, { url: e.target.value })}
                      placeholder="cth. proyekmu.com"
                      className={inputCls + inputSalah(`projects.${i}.url`)}
                    />
                    <PesanError kunci={`projects.${i}.url`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`proj-image-${i}`}>URL gambar proyek</label>
                    <input
                      id={`proj-image-${i}`}
                      type="text"
                      inputMode="url"
                      value={item.imageUrl ?? ""}
                      onChange={(e) => ubahProyek(i, { imageUrl: e.target.value })}
                      placeholder="cth. gambarmu.com/proyek.jpg"
                      className={inputCls + inputSalah(`projects.${i}.imageUrl`)}
                    />
                    <PesanError kunci={`projects.${i}.imageUrl`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, projects: [...d.projects, barisProyekBaru()] }))}
            className="min-h-[48px] w-full rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:border-brand-500 hover:text-brand-500"
          >
            + Tambah proyek
          </button>
        </div>
      </section>

      {/* ---------- Keahlian ---------- */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl">Keahlian</h2>
        <p className="mt-1 text-sm text-muted">Ketik nama keahlian — pilih dari daftar saran atau isi sendiri.</p>
        <datalist id="master-skill-list">
          {MASTER_SKILLS.map((s) => (
            <option key={s.name} value={s.name} label={`${s.name} — ${s.field}`} />
          ))}
        </datalist>
        <div className="mt-6 space-y-5">
          {draft.skills.map((item, i) => (
            <div key={i} className="rounded-xl border border-line p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Keahlian {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => hapusDari("skills", i)}
                  className="min-h-[48px] px-3 text-sm font-medium text-danger hover:underline"
                >
                  Hapus
                </button>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-3">
                <div>
                  <label className={labelCls} htmlFor={`skill-name-${i}`}>Nama keahlian *</label>
                  <input
                    id={`skill-name-${i}`}
                    type="text"
                    list="master-skill-list"
                    value={item.name}
                    onChange={(e) => ubahNamaKeahlian(i, e.target.value)}
                    placeholder="cth. JavaScript"
                    className={inputCls + inputSalah(`skills.${i}.name`)}
                  />
                  <PesanError kunci={`skills.${i}.name`} />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`skill-category-${i}`}>Kategori</label>
                  <select
                    id={`skill-category-${i}`}
                    value={item.category ?? ""}
                    onChange={(e) => ubahKeahlian(i, { category: e.target.value })}
                    className={inputCls + inputSalah(`skills.${i}.category`)}
                  >
                    <option value="">Pilih kategori</option>
                    <option value="Hard skill">Hard skill</option>
                    <option value="Soft skill">Soft skill</option>
                  </select>
                  <PesanError kunci={`skills.${i}.category`} />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`skill-level-${i}`}>Tingkat</label>
                  <select
                    id={`skill-level-${i}`}
                    value={item.level ?? ""}
                    onChange={(e) => ubahKeahlian(i, { level: e.target.value === "" ? undefined : Number(e.target.value) })}
                    className={inputCls + inputSalah(`skills.${i}.level`)}
                  >
                    <option value="">Pilih tingkat</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{`${n} – ${SKILL_LEVEL_LABELS[n]}`}</option>
                    ))}
                  </select>
                  <PesanError kunci={`skills.${i}.level`} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, skills: [...d.skills, barisKeahlianBaru()] }))}
            className="min-h-[48px] w-full rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:border-brand-500 hover:text-brand-500"
          >
            + Tambah keahlian
          </button>
        </div>
      </section>

      {/* ---------- Sertifikasi ---------- */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl">Sertifikasi</h2>
        <p className="mt-1 text-sm text-muted">Sertifikat kursus, pelatihan, atau lisensi.</p>
        <div className="mt-6 space-y-5">
          {draft.certifications.map((item, i) => (
            <div key={i} className="rounded-xl border border-line p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Sertifikasi {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => hapusDari("certifications", i)}
                  className="min-h-[48px] px-3 text-sm font-medium text-danger hover:underline"
                >
                  Hapus
                </button>
              </div>
              <div className="mt-4 space-y-5">
                <div>
                  <label className={labelCls} htmlFor={`cert-name-${i}`}>Nama sertifikasi *</label>
                  <input
                    id={`cert-name-${i}`}
                    type="text"
                    value={item.name}
                    onChange={(e) => ubahSertifikasi(i, { name: e.target.value })}
                    placeholder="cth. Google IT Support"
                    className={inputCls + inputSalah(`certifications.${i}.name`)}
                  />
                  <PesanError kunci={`certifications.${i}.name`} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className={labelCls} htmlFor={`cert-issuer-${i}`}>Penerbit</label>
                    <input
                      id={`cert-issuer-${i}`}
                      type="text"
                      value={item.issuer ?? ""}
                      onChange={(e) => ubahSertifikasi(i, { issuer: e.target.value })}
                      placeholder="cth. Google / Coursera"
                      className={inputCls + inputSalah(`certifications.${i}.issuer`)}
                    />
                    <PesanError kunci={`certifications.${i}.issuer`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`cert-id-${i}`}>ID kredensial</label>
                    <input
                      id={`cert-id-${i}`}
                      type="text"
                      value={item.credentialId ?? ""}
                      onChange={(e) => ubahSertifikasi(i, { credentialId: e.target.value })}
                      placeholder="cth. ABC123"
                      className={inputCls + inputSalah(`certifications.${i}.credentialId`)}
                    />
                    <PesanError kunci={`certifications.${i}.credentialId`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`cert-issue-${i}`}>Tanggal terbit</label>
                    <input
                      id={`cert-issue-${i}`}
                      type="date"
                      value={item.issueDate ?? ""}
                      onChange={(e) => ubahSertifikasi(i, { issueDate: e.target.value })}
                      className={inputCls + inputSalah(`certifications.${i}.issueDate`)}
                    />
                    <PesanError kunci={`certifications.${i}.issueDate`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`cert-expiry-${i}`}>Tanggal kedaluwarsa</label>
                    <input
                      id={`cert-expiry-${i}`}
                      type="date"
                      value={item.expiryDate ?? ""}
                      onChange={(e) => ubahSertifikasi(i, { expiryDate: e.target.value })}
                      className={inputCls + inputSalah(`certifications.${i}.expiryDate`)}
                    />
                    <PesanError kunci={`certifications.${i}.expiryDate`} />
                  </div>
                </div>
                <div>
                  <label className={labelCls} htmlFor={`cert-url-${i}`}>URL kredensial</label>
                  <input
                    id={`cert-url-${i}`}
                    type="text"
                    inputMode="url"
                    value={item.credentialUrl ?? ""}
                    onChange={(e) => ubahSertifikasi(i, { credentialUrl: e.target.value })}
                    placeholder="cth. coursera.org/verify/ABC123"
                    className={inputCls + inputSalah(`certifications.${i}.credentialUrl`)}
                  />
                  <PesanError kunci={`certifications.${i}.credentialUrl`} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, certifications: [...d.certifications, barisSertifikasiBaru()] }))}
            className="min-h-[48px] w-full rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:border-brand-500 hover:text-brand-500"
          >
            + Tambah sertifikasi
          </button>
        </div>
      </section>

      {/* ---------- Pencapaian ---------- */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl">Pencapaian</h2>
        <p className="mt-1 text-sm text-muted">Penghargaan, lomba, atau pencapaian lainnya.</p>
        <div className="mt-6 space-y-5">
          {draft.achievements.map((item, i) => {
            // Bulan/tahun dibaca dari field-nya sendiri, bukan
            // dari `date` — supaya pilihan sebagian (baru bulan
            // saja / baru tahun saja) tetap tampil di select.
            // Draft lama yang hanya punya `date` sudah
            // dilengkapi bulan/tahun oleh normalizeBuatDraft.
            const bulanPilih = item.bulan ?? "";
            const tahunPilih = item.tahun ?? "";
            return (
              <div key={i} className="rounded-xl border border-line p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg">Pencapaian {i + 1}</h3>
                  <button
                    type="button"
                    onClick={() => hapusDari("achievements", i)}
                    className="min-h-[48px] px-3 text-sm font-medium text-danger hover:underline"
                  >
                    Hapus
                  </button>
                </div>
                <div className="mt-4 space-y-5">
                  <div>
                    <label className={labelCls} htmlFor={`ach-title-${i}`}>Nama pencapaian *</label>
                    <input
                      id={`ach-title-${i}`}
                      type="text"
                      value={item.title}
                      onChange={(e) => ubahPencapaian(i, { title: e.target.value })}
                      placeholder="cth. Juara 1 Lomba Web Design"
                      className={inputCls + inputSalah(`achievements.${i}.title`)}
                    />
                    <PesanError kunci={`achievements.${i}.title`} />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor={`ach-issuer-${i}`}>Penerbit atau penyelenggara</label>
                    <input
                      id={`ach-issuer-${i}`}
                      type="text"
                      value={item.issuer ?? ""}
                      onChange={(e) => ubahPencapaian(i, { issuer: e.target.value })}
                      placeholder="cth. Universitas Riau"
                      className={inputCls + inputSalah(`achievements.${i}.issuer`)}
                    />
                    <PesanError kunci={`achievements.${i}.issuer`} />
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelCls} htmlFor={`ach-month-${i}`}>Bulan</label>
                      <select
                        id={`ach-month-${i}`}
                        value={bulanPilih ?? ""}
                        onChange={(e) => ubahBulanTahunPencapaian(i, e.target.value, tahunPilih ?? "")}
                        className={inputCls + inputSalah(`achievements.${i}.date`)}
                      >
                        <option value="">Pilih bulan</option>
                        {BULAN.map((b, idx) => (
                          <option key={b} value={String(idx + 1).padStart(2, "0")}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls} htmlFor={`ach-year-${i}`}>Tahun</label>
                      <select
                        id={`ach-year-${i}`}
                        value={tahunPilih ?? ""}
                        onChange={(e) => ubahBulanTahunPencapaian(i, bulanPilih ?? "", e.target.value)}
                        className={inputCls + inputSalah(`achievements.${i}.date`)}
                      >
                        <option value="">Pilih tahun</option>
                        {daftarTahun.map((t) => (
                          <option key={t} value={String(t)}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <PesanError kunci={`achievements.${i}.date`} />
                  <div>
                    <label className={labelCls} htmlFor={`ach-desc-${i}`}>Deskripsi</label>
                    <textarea
                      id={`ach-desc-${i}`}
                      rows={3}
                      value={item.description ?? ""}
                      onChange={(e) => ubahPencapaian(i, { description: e.target.value })}
                      placeholder="Ceritakan singkat pencapaian ini (opsional)"
                      maxLength={500}
                      className={inputCls + " resize-y" + inputSalah(`achievements.${i}.description`)}
                    />
                    <PesanError kunci={`achievements.${i}.description`} />
                  </div>
                  <div>
                    <span className={labelCls}>Dokumen pendukung (PDF)</span>
                    <p className="mt-1 text-xs text-muted">Maksimal 5 MB. Opsional — misalnya sertifikat atau piagam.</p>
                    {item.documentUrl ? (
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <a
                          href={item.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600"
                        >
                          {dokNama[i] ?? "Lihat dokumen terunggah"}
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            ubahPencapaian(i, { documentUrl: "" });
                            setDokNama((n) => ({ ...n, [i]: "" }));
                          }}
                          className="min-h-[48px] rounded-md border border-line px-4 py-2.5 text-sm font-medium text-danger hover:border-danger"
                        >
                          Hapus dokumen
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={dokSibuk === i}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadDokumen(i, file);
                          e.target.value = "";
                        }}
                        className="mt-3 block w-full text-sm text-muted file:mr-3 file:min-h-[48px] file:rounded-md file:border-0 file:bg-brand-500 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-brand-600 disabled:opacity-50"
                      />
                    )}
                    {dokSibuk === i ? <p className="mt-1 text-sm text-muted">Mengunggah dokumen…</p> : null}
                    {dokError[i] ? <p className="mt-1 text-sm text-danger">{dokError[i]}</p> : null}
                    <PesanError kunci={`achievements.${i}.documentUrl`} />
                  </div>
                </div>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, achievements: [...d.achievements, barisPencapaianBaru()] }))}
            className="min-h-[48px] w-full rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:border-brand-500 hover:text-brand-500"
          >
            + Tambah pencapaian
          </button>
        </div>
      </section>

      {/* ---------- Bahasa ---------- */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-2xl">Bahasa</h2>
        <p className="mt-1 text-sm text-muted">Bahasa yang kamu kuasai beserta tingkatnya.</p>
        <datalist id="language-list">
          {BAHASA_UMUM.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
        <div className="mt-6 space-y-5">
          {draft.languages.map((item, i) => (
            <div key={i} className="rounded-xl border border-line p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">Bahasa {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => hapusDari("languages", i)}
                  className="min-h-[48px] px-3 text-sm font-medium text-danger hover:underline"
                >
                  Hapus
                </button>
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls} htmlFor={`lang-name-${i}`}>Bahasa *</label>
                  <input
                    id={`lang-name-${i}`}
                    type="text"
                    list="language-list"
                    value={item.language}
                    onChange={(e) => ubahBahasa(i, { language: e.target.value })}
                    placeholder="cth. Inggris"
                    className={inputCls + inputSalah(`languages.${i}.language`)}
                  />
                  <PesanError kunci={`languages.${i}.language`} />
                </div>
                <div>
                  <label className={labelCls} htmlFor={`lang-level-${i}`}>Tingkat kemahiran</label>
                  <select
                    id={`lang-level-${i}`}
                    value={item.level}
                    onChange={(e) => ubahBahasa(i, { level: e.target.value as BuatLanguageItem["level"] })}
                    className={inputCls + inputSalah(`languages.${i}.level`)}
                  >
                    {TINGKAT_BAHASA.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <PesanError kunci={`languages.${i}.level`} />
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft((d) => ({ ...d, languages: [...d.languages, barisBahasaBaru()] }))}
            className="min-h-[48px] w-full rounded-md border border-line px-4 py-2.5 text-sm font-medium hover:border-brand-500 hover:text-brand-500"
          >
            + Tambah bahasa
          </button>
        </div>
      </section>

      <p className="text-sm text-muted">
        Data tersimpan otomatis di browser kamu setiap kali diubah.
      </p>
      <button type="submit" disabled={sibuk} className="btn-primary min-h-[52px] w-full px-4 py-3 text-base">
        {sibuk ? "Memeriksa data…" : "Simpan & lanjut ke konfirmasi"}
      </button>
    </form>
  );
}
