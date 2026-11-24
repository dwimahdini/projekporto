# Perbaikan template & form — 24 Nov 2026

Asal: uji alur gratis end-to-end (persona Budi Santoso, desainer,
data lengkap) pada 24 Nov 2026 18:45–18:53 WIB. Temuan: dua template
membuang sebagian besar data klien, dan tiga kolom form tidak punya
input padahal skema + API sudah menerimanya sejak Tahap 2.

## Yang diperbaiki

### Form (`src/components/order/OrderForm.tsx`)
- **Pendidikan — kolom IPK** (angka 0–4, boleh kosong). Sebelumnya
  pengguna tidak bisa mengisi IPK sama sekali; satu-satunya jalan
  adalah mengetik "IPK 3.75" di kolom Keterangan, dan hanya
  Minimalis yang menampilkan Keterangan itu.
- **Pengalaman — centang "Saya masih bekerja di sini"**.
  Mencetang mengisi `is_current`, mengosongkan dan menonaktifkan
  tanggal selesai. Pratinjau menampilkan "Jan 2023 – Sekarang"
  (fungsi `formatRange` di `shared.tsx` sudah mendukung ini).
- **Proyek — kolom Teknologi** (pisah koma, contoh "Figma, HTML")
  dan **kolom URL gambar proyek**. Sebelumnya `techStack` dan
  `imageUrl` ada di state tapi tidak ada inputnya — catatan di
  bawah langkah proyek menyuruh menempel URL ke "kolom gambar"
  yang tidak ada.
- `renderListEditor` diperluas: field mendukung `step/min/max/
  placeholder/parse/display/disabledWhen`, plus parameter `extra`
  untuk kontrol per item. Nilai angka kosong disimpan sebagai
  `undefined` (bukan 0) supaya tidak tampil sebagai "IPK 0".

Tidak ada perubahan API: `PATCH /api/orders/[token]` dan skema
Zod di `src/lib/validation.ts` sudah menerima `gpa`, `isCurrent`,
dan `techStack` sejak Tahap 2.

### Bug kolom Teknologi (ditemukan saat verifikasi browser)
Percobaan pertama memakai `parse` di setiap ketikan: nilai yang
ditampilkan selalu dirender ulang dari daftar hasil parse, sehingga
koma dan spasi langsung hilang ("Figma, HTML" jadi "FigmaHTML")
dan teknologi tidak bisa diketik. Perbaikan: kolom menyimpan teks
mentah (`techStackText`) dan baru diubah menjadi daftar oleh
`parseTechStackText` di `src/lib/validation.ts` saat menyimpan
(`saveStep`). Nilai tes "FigmaHTML" yang sempat tersimpan di order
"budi" diperbaiki kembali menjadi "Figma, HTML, CSS" lewat form
setelah perbaikan ini.

### Template Desainer
- Bagian **Experience** (posisi, perusahaan, tanggal, deskripsi),
  **Education** (termasuk IPK), dan **Certificates** ditambahkan —
  sebelumnya template ini hanya menampilkan nama perusahaan di
  "Worked with" dan membuang detail pengalaman, pendidikan, dan
  sertifikat.
- Nama pemilik kini tampil sebagai baris kapital di atas headline
  hero (sebelumnya hanya kecil di nav dan caption avatar).
- Skill kini menampilkan level ("Figma · 5/5").
- Menu nav ditambah tautan Experience.

### Template Developer
- Bagian **Education** (termasuk IPK) dan **Certificates**
  ditambahkan dengan gaya timeline `// education` / `// certificates`
  yang sama seperti Experience. Sebelumnya kedua bagian ini tidak ada.
- Menu nav ditambah tautan education dan certificates.

### Template Resume & CV
- Pendidikan kini menampilkan IPK (`IPK 3.58`) — sebelumnya satu-satunya
  template yang tidak menampilkannya.

### Template Kreatif
- Skill kini menampilkan level ("Figma · 5/5").
- Judul bagian tidak lagi memakai emoji (Tentang, Pengalaman, Proyek,
  Skill, Sertifikasi, Publikasi, Kontak) — terasa lebih profesional.

### Template Minimalis
- Jarak antar-bagian `py-14` → `py-10` (celah putih yang terlalu
  lebar menurut uji).

Tidak berubah: Minimalis, Kreatif, Visual, Profesional, dan Gelap
Futuristik sudah menampilkan IPK (kalau `gpa` terisi) sebelum
perbaikan ini; masalahnya adalah `gpa` tidak pernah bisa diisi
dari form.

## Verifikasi
- `npx tsc --noEmit`, `eslint`, `npm test` **102/102** (tes baru:
  `src/lib/__tests__/validation-form.test.ts` — IPK 0–4, isCurrent
  tanpa tanggal selesai, techStack maks 12), `npm run build` lolos.
- Demo lokal + production: Desainer menampilkan Experience /
  Education / Certificates / IPK 3.58 / "Sekarang" / level skill;
  Developer menampilkan Education / Certificates / IPK 3.58;
  Resume & CV menampilkan IPK 3.58; Kreatif tanpa emoji + level
  skill (0 emoji di halaman).
- Thumbnail `desainer.jpg` dirender ulang (hero berubah) dan
  di-upload lewat halaman GitHub web.
- Uji browser pada order tes "budi" (19:02–19:08 WIB): kolom IPK,
  centang "masih bekerja", dan kolom Teknologi diisi dan tersimpan;
  pratinjau Desainer / Developer / Kreatif menampilkan data baru
  dengan benar; pekerjaan sekarang tampil "Jan 2023 – Sekarang".
- Uji ulang kolom Teknologi setelah perbaikan bug (19:14–19:16
  WIB): mengetik "Figma, HTML, CSS" huruf demi huruf — koma dan
  spasi utuh; setelah simpan dan muat ulang, kolom tetap
  "Figma, HTML, CSS"; Developer menampilkan ketiga chip
  (filter + kartu proyek), Desainer menampilkan dua chip pertama
  (Figma, HTML) sesuai desain aslinya (`slice(0, 2)`).

## Commit
- Lokal `be4f58d` (kode), `d428432` (thumbnail desainer).
- GitHub snapshot `05579ca11fe769747b2e17316a992cbb16b69b77`
  (teks saja; thumbnail di-upload terpisah lewat web).
