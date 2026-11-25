# Alur Baru — Buat Portofolio Tanpa Daftar (`/buat`)

Alur baru ini terpisah dari alur lama (pesan → bayar → aktif).
Tidak ada auth, tidak ada email, tidak ada pembayaran.
Pengguna mengisi biodata, memilih template, mengonfirmasi,
lalu mendapat tautan berbagi (`/bagikan/<kode>`).

> **Wajib sebelum dipakai:** terapkan migrasi
> `supabase/migrations/0008_buat_flow.sql` lewat SQL Editor
> Supabase (Dashboard → SQL Editor → tempel isi file → Run).
> Tanpa migrasi itu, upload foto/dokumen dan pembuatan
> portofolio gagal dengan pesan "belum disiapkan".

## Rute

| Rute | Jenis | Fungsi |
| --- | --- | --- |
| `/buat` | client (Bagian 2) | Form biodata; draft disimpan di localStorage (`buat-draft-v1`) |
| `/buat/konfirmasi` | client (Bagian 2) | Konfirmasi data sebelum memilih template |
| `/buat/template` | client (Bagian 3) | Pilih template; pratinjau langsung dengan data draft |
| `/buat/selesai` | client (Bagian 3) | Konfirmasi akhir "Buat portofolio?"; hasil + tautan berbagi |
| `/bagikan/[code]` | server | Halaman portofolio publik dari tabel `shares` |
| `POST /api/buat/upload` | route handler | Upload foto (JPG/PNG/WebP, maks 2 MB) atau dokumen (PDF, maks 5 MB) |
| `POST /api/buat/create` | route handler | Simpan draft + template ke `shares`, kembalikan `shareCode` + URL |

Alur lengkap:

1. `/buat` — isi biodata (nama, headline, bio, foto, nomor
   HP/WhatsApp, pendidikan, pengalaman, proyek, skill,
   sertifikasi, pencapaian, bahasa). Draft tersimpan otomatis
   di localStorage.
2. `/buat/konfirmasi` — periksa data, lanjut ke pilih template.
3. `/buat/template` — grid kartu dari `TEMPLATE_LIST` (satu
   registry di `src/lib/templates/registry.ts`). Klik kartu =
   pilih template itu; pratinjau langsung tampil di bawah grid
   dengan data draft. Template bisa diganti berkali-kali, data
   tetap utuh (draft hanya berubah `templateId`-nya).
   Tombol "Lanjut ke konfirmasi akhir" nonaktif sampai template
   dipilih.
4. `/buat/selesai` — ringkasan (nama + template) dan pratinjau
   kecil, lalu pertanyaan "Buat portofolio?". Tombol "Ya, buat
   portofolio" memanggil `POST /api/buat/create`. Kalau sukses,
   halaman yang sama menampilkan pratinjau lengkap + tautan
   `https://group-portofolio.vercel.app/bagikan/<shareCode>` +
   tombol "Salin tautan" + "Lihat halaman bagikan".
5. `/bagikan/<shareCode>` — siapa pun yang punya tautan bisa
   membuka portofolio (tanpa login). Tanpa watermark, tanpa UI edit.

Setiap halaman client memuat draft dari localStorage lalu
memvalidasinya dengan `buatDraftSchema.safeParse` dan menggabung
dengan `emptyBuatDraft()` (helper `loadValidatedBuatDraft()` /
`normalizeBuatDraft()` di `src/lib/buat.ts`). Draft yang tidak
lengkap mengarahkan kembali ke langkah sebelumnya
(`/buat` → `/buat/template` → `/buat/selesai`).

## Tabel `shares` (migrasi 0008)

```sql
id uuid primary key default gen_random_uuid(),
share_code text unique not null,   -- kode acak 16 karakter URL-safe
data jsonb not null,               -- PortfolioData lengkap
template_id text not null,
created_at timestamptz default now()
```

RLS aktif **tanpa policy anon** — baca/tulis hanya lewat
`service_role` (`createAdminClient` di `/bagikan/[code]` dan
`/api/buat/create`). Kode acak 16 karakter (96 bit entropi)
sudah cukup sebagai kunci; tidak ada login/token.

`POST /api/buat/create` menangani tabrakan `share_code`
(unique constraint, kode Postgres `23505`) dengan membuat kode
baru dan mencoba lagi (maks 3 kali).

## Bucket `portfolio-public` (migrasi 0008)

Bucket publik baru, terpisah dari bucket lama
(`portfolio-uploads`). Isi:

- `foto/<uuid>.jpg|png|webp` — foto profil / gambar (maks 2 MB)
- `dokumen/<uuid>.pdf` — dokumen pencapaian (maks 5 MB)

Hanya ada policy **baca publik** (`SELECT` untuk
`bucket_id = 'portfolio-public'`). Tulis tetap hanya lewat
server (`/api/buat/upload` dengan service_role) — tidak ada
policy insert/update anon. URL dikembalikan lewat
`getPublicUrl`, jadi bisa langsung dipakai di `<img>` / tautan.

Validasi upload (dua lapis): tipe + ukuran file
(`validateImageFile` / `validatePdfFile`) **dan** isi file
berdasarkan magic bytes (`validateImageMagicBytes` untuk
gambar; `validatePdfMagicBytes` di `src/lib/sanitize.ts` untuk
PDF — 4 byte pertama harus `%PDF`).

Rate limit anonim per IP (in-memory, `src/lib/rate-limit.ts`):

- upload: 20x per jam
- create: 5x per jam (sama dengan batas buat order lama)

## Keputusan desain

- **Tanpa auth / email / pembayaran.** Alur lama
  (`/pesanan`, `/preview`, `/bayar-simulasi`, `/admin`,
  `/cek-pesanan`, `/demo`, `/s`, `OrderForm`) tidak disentuh
  sama sekali.
- **Draft di localStorage.** Tidak ada data yang dikirim ke
  server sebelum pengguna menekan "Ya, buat portofolio".
  Kunci: `buat-draft-v1`.
- **Email selalu null.** Form baru tidak meminta email, jadi
  `draftToPortfolioData` mengeset `email: null`. Nomor
  `phone`/`whatsapp` dari draft **ditampilkan** di portofolio.
- **Satu registry template.** `/buat/template` dan
  `/bagikan/[code]` sama-sama memakai `TEMPLATE_LIST` /
  `getTemplate()` dari `src/lib/templates/registry.ts`, jadi
  template baru muncul otomatis begitu di-registry (tidak ada
  daftar template kedua yang harus dijaga).
- **Tanpa watermark** di `/bagikan/[code]` — itu halaman
  portofolio final, bukan pratinjau.
- **Tanpa `next/font/google`** dan tanpa `framer-motion`;
  animasi masuk memakai CSS `.fade-up` (sudah ada di
  `globals.css`). Komentar dan UI berbahasa Indonesia sederhana.

## Catatan verifikasi

- `npx tsc --noEmit` dan `npm test` harus bersih.
- Migrasi 0008 **belum diterapkan** (tidak ada akses untuk
  menjalankannya dari sini) — terapkan lewat SQL Editor
  Supabase sebelum menguji upload/buat di production.
- Setelah migrasi diterapkan, uji manual: isi `/buat` →
  pilih template di `/buat/template` (pratinjau berubah saat
  ganti template) → "Ya" di `/buat/selesai` → buka tautan
  `/bagikan/<kode>` di tab privat (harus tampil tanpa login).
