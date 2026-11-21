# Tahap 3 — Lima template portofolio

## Struktur

- `src/lib/types.ts` — `PortfolioData`: satu bentuk props untuk semua template (diambil dari view `public_portfolio`). Field null / array kosong = tidak ditampilkan.
- `src/components/templates/` — 5 komponen + `shared.tsx` (Reveal, Avatar, ContactLinks, format tanggal).
- `src/lib/templates/registry.ts` — pemetaan `template_id` → komponen. Tambah template = 1 baris registry + 1 file komponen.
- `src/lib/templates/demo-data.ts` — data contoh dari CV Dwi Mahdini.
- `src/app/demo/[template]/page.tsx` — bandingkan kelima template dengan data yang sama. Ada nav untuk pindah template.
- `src/app/s/[subdomain]/page.tsx` — halaman publik sekarang memakai registry, bukan placeholder Tahap 1.

## Kelima template

1. **Minimalis** — putih bersih, tipografi besar, banyak ruang kosong.
2. **Gelap Futuristik** — tema gelap, glow cyan/fuchsia, partikel CSS ringan (bukan canvas berat).
3. **Kreatif** — warna-warni, kartu miring dan membesar saat hover.
4. **Profesional** — dua kolom, sidebar gelap berisi kontak/skill/pendidikan, isi seperti CV formal.
5. **Visual** — hero foto besar (gradasi kalau tidak ada foto), galeri proyek dengan lightbox (klik kartu, tutup dengan tombol atau Esc).

Setiap template punya: Hero, Tentang, Pengalaman, Proyek, Skill, Sertifikasi, Kontak, plus Publikasi kalau ada datanya. Bagian yang kosong tidak dirender sama sekali.

## Performa & aset

- Tidak ada gambar eksternal dan tidak ada aset berlisensi. Foto profil memakai `photo_url` klien; kalau tidak ada, tampil inisial nama. Hero Visual memakai gradasi CSS.
- Font memakai tumpukan sistem (gratis, tanpa unduhan) — tidak ada Google Fonts yang harus diunduh saat load.
- Animasi: Framer Motion `whileInView`, sekali saja, geser 16px + opacity, durasi 0,5 detik. Gambar memakai `loading="lazy"` kecuali hero.
- Partikel Gelap Futuristik hanya beberapa titik CSS, bukan animasi berat.

## Database

- Migrasi `0003_templates.sql`: ganti 5 template lama dengan 5 template final (harga contoh Rp49.000). Template lama dinonaktifkan, bukan dihapus, supaya order lama tetap bisa dibaca.
- `seed.sql` diperbarui agar konsisten (order contoh memakai `minimalis`).

## Cara membandingkan

Jalankan `npm run dev`, buka:
- `/demo/minimalis`
- `/demo/gelap-futuristik`
- `/demo/kreatif`
- `/demo/profesional`
- `/demo/visual`

Pindah template lewat nav di atas halaman demo. Template yang tidak dikenal → 404.
