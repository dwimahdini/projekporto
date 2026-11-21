# Tahap 9 — Tiga template MIT baru (Developer, Desainer, Resume & CV)

Keputusan user (21 Nov 2026 22:27 WIB): pakai template dari
[100 Free HTML Templates — portfolio](https://mmrahmanbappi.github.io/100-free-html-templates/portfolio/)
(lisensi MIT, terkonfirmasi di halaman itu), mulai dari 3 terbaik.
Kelima template lama TETAP aktif — order yang sudah ada
(wirza = minimalis, kurnia = kreatif) memakai template_id itu,
jadi menghapusnya akan merusak pratinjau mereka.

## Yang dibuat

- `src/components/templates/DeveloperTemplate.tsx` — konversi
  "Developer Portfolio" (Maya Okafor).
- `src/components/templates/DesignerTemplate.tsx` — konversi
  "Designer Portfolio" (Lena Park).
- `src/components/templates/ResumeCvTemplate.tsx` — konversi
  "Resume and CV" (Aisha Rahman).
- `src/components/templates/mit/{developer,designer,resume}.css.ts` —
  CSS asli tiap template, dibatasi ke wrapper `.tpl-<nama>`
  (skrip sekali pakai di `/tmp/scope-css.py`; `:root` → wrapper,
  `body` → wrapper, `html`/`*` dibuang, semua selektor diawali
  `.tpl-<nama>`, termasuk di dalam `@media`).
- `src/lib/types.ts` — `TemplateId` + `TEMPLATE_IDS` jadi 8.
- `src/lib/templates/registry.ts` — 3 entri baru.
- `supabase/migrations/0007_templates_mit.sql` — insert 3 template,
  harga Rp49.000, `on conflict do update` (idempoten).
- `src/app/page.tsx` — teks "5 template" → "8 template"
  ("Delapan template, satu harga").
- `src/lib/__tests__/tahap9.test.ts` — 6 tes baru.
- `docs/LICENSES.md` — atribusi MIT untuk ketiga template.

## Prinsip konversi (aturan yang tidak boleh dilanggar)

Template hanya "kulit". Semua isi berasal dari `data: PortfolioData`
(form klien). Tidak ada nama, email, foto, atau teks contoh
dari template asli yang tersisa — diverifikasi dengan grep dan
tes (CSS + komponen tidak mengandung "Maya"/"Lena"/"Aisha"/
"Unsplash"). Bagian yang tidak punya kolom di form DIHAPUS,
bukan diisi karangan:

| Template | Dihapus | Alasan |
|---|---|---|
| Developer | Grafik aktivitas (1.284 kontribusi) | Angka kontribusi palsu |
| Developer | Badge "Open to new projects from November" | Status karangan |
| Developer | Tombol "Download CV (PDF)", tautan "Source code" | Tidak ada field-nya |
| Desainer | Kutipan testimoni klien | Nama + kalimat palsu |
| Desainer | Formulir kontak (Formspree) | Tidak ada backend penerima |
| Desainer | Angka hasil studi kasus ("+38% ...") | Bukan data klien |
| Resume & CV | Languages, References | Form tidak punya kolomnya |

Pemetaan data (yang TIDAK ada di template asli, ditambahkan):

- Developer: chip filter proyek diambil dari `tech_stack` klien;
  blok terminal `$ whoami` / `$ cat stack.txt` diisi nama, headline,
  lokasi, dan 6 skill pertama; skill dikelompokkan per kategori
  dengan "Level x/5"; tombol salin email (clipboard).
- Desainer: judul hero = headline klien (kata terakhir highlight
  peach); "Worked with" = perusahaan unik dari pengalaman;
  studi kasus = proyek klien (gambar hanya kalau `image_url` ada,
  kalau tidak blok warna + huruf awal judul); "Tools I use" =
  nama skill klien.
- Resume & CV: bar skill = `level/5` (level kosong → 3/5);
  deskripsi pengalaman dipisah per "•" jadi poin-poin CV;
  tombol Print/Save as PDF dipertahankan (fitur asli template);
  seksi Projects + Publications ditambahkan dengan gaya h2 yang
  sama supaya data klien tidak hilang.

Font: Developer memakai JetBrains Mono + DM Sans (sudah dimuat
layout — tanpa unduhan tambahan). Desainer (Gloock + Manrope)
dan Resume (Source Serif 4 + Public Sans) dimuat lewat `@import`
di baris pertama `<style>` masing-masing komponen.

## Migrasi database

Dijalankan di SQL Editor Supabase (project group-portofolio,
ref ohvcssgmqovfgtuhkqig), 22:31–22:33 WIB 21 Nov 2026 —
"Success. No rows returned". Verifikasi `select` mengembalikan
8 baris, semua `price = 49000`, `is_active = true`.

Catatan: `vercel env pull` menulis `SUPABASE_SERVICE_ROLE_KEY`
sebagai placeholder yang disensor (`[SENSITIVE...]`), jadi insert
lewat REST tidak bisa dipakai — migrasi SQL lewat browser adalah
jalur yang bekerja (sama seperti migrasi 0001–0006).

## Verifikasi

- `npx tsc --noEmit`: lolos.
- `npx eslint` (file baru + registry + types + page): bersih.
  Satu perbaikan: teks `// selected work` di dalam JSX harus
  ditulis `{"// selected work"}` (aturan jsx-no-comment-textnodes).
- `npm test`: 99/99 (93 lama + 6 baru).
- `npm run build`: berhasil.
- Server production lokal port 3101: `/demo/developer`,
  `/demo/desainer`, `/demo/resume-cv` semua HTTP 200, memuat
  "Dwi Mahdini" (data demo), nol kebocoran nama contoh
  (Maya/Lena/Aisha/Unsplash). Landing memuat ketiga nama template
  baru dari database dan judul "Delapan template, satu harga".

## Yang belum / keputusan berikut

- Tiga template MIT lain (Photographer Nils, Video Editor Kai,
  Artist Mira) belum dikonversi — menunggu ada klien dari
  profesi itu atau instruksi user.
- Font Google di Desainer/Resume diunduh saat halaman template
  itu dibuka (bukan di halaman lain). Kalau koneksi klien lambat,
  fallback serif/sans sistem tetap tampil.
- Tes render visual (browser) dilakukan setelah deploy production.
