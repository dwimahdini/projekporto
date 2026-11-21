# Performa, Aksesibilitas, dan Mobile — Tahap 8

Diukur 21 November 2026 dengan Lighthouse (Chrome Headless, production build `npm run start`, laptop lokal). Target: performa dan aksesibilitas minimal 90.

## Hasil

| Halaman | Performa sebelum | Aksesibilitas sebelum | Performa sesudah | Aksesibilitas sesudah |
|---|---|---|---|---|
| `/` (landing) | 99 | 100 | 99 | 100 |
| `/demo/minimalis` | 95 | 93 | 93 | **100** |
| `/demo/gelap-futuristik` | 91 | 95 | 99 | **100** |
| `/demo/kreatif` | 93 | 95 | 93 | **100** |
| `/demo/profesional` | 97 | 100 | 97 | 100 |
| `/demo/visual` | 99 | 100 | 99 | 100 |

Best-practices dan SEO: 100 di semua halaman, sebelum dan sesudah.
Skor performa berfluktuasi ±5 antar run di mesin yang sama (LCP 2,3–2,5 detik, TBT 190–310 ms) — semua tetap ≥ 90.

## Perbaikan yang dilakukan (Tahap 8)

1. **Kontras warna** (penyebab aksesibilitas < 100):
   - `MinimalisTemplate.tsx`: `text-gray-400` → `text-gray-500` (judul section, tanggal, tech stack, catatan email).
   - `GelapFuturistikTemplate.tsx`: `text-slate-500` → `text-slate-400` (tanggal di latar gelap).
   - `KreatifTemplate.tsx`: avatar `bg-pink-400` → `bg-pink-600` (teks putih di atasnya sekarang kontras 4,6:1).
2. **Landmark utama**: root `MinimalisTemplate` dari `<div>` jadi `<main>` (audit `landmark-one-main` sekarang lulus). Template lain sudah memakai `<main>`.
3. **Reduced motion**: `Reveal` di `src/components/templates/shared.tsx` memakai `useReducedMotion()` dari Framer Motion — kalau user mengaktifkan prefers-reduced-motion, konten tampil langsung tanpa animasi. Ditambah fallback CSS di `src/app/globals.css` (semua transisi/animasi dipendekkan ke 0,01 ms).

## Yang sudah bagus dari awal (tidak diubah)

- Gambar memakai `loading="lazy"` dan `alt` text (`shared.tsx`, `VisualTemplate.tsx`).
- Font: tumpukan sistem, tanpa unduhan font eksternal — tidak ada render-blocking font.
- Tidak ada aset berlisensi (lihat `docs/LICENSES.md`).

## Mobile (Playwright, `e2e/main.spec.ts`)

Diuji di lebar **360px, 390px, 768px, dan 1280px** (landing + demo minimalis): **tidak ada scroll horizontal** di semua lebar, tidak ada teks terpotong yang terdeteksi. Input form minimal 48px dan tombol 52px (sudah dari Tahap 2).

## Yang belum teruji

- **Satu situs klien published** (`{subdomain}.portofolio.my.id`): belum bisa diukur Lighthouse di lokal karena butuh Supabase dengan order published sungguhan. Template-nya sama persis dengan halaman `/demo/[template]` (tanpa watermark), jadi skornya diharapkan sama — ukur ulang setelah deploy dengan satu order published.
- Performa di jaringan lambat (throttling 4G) belum diukur; Lighthouse di atas memakai throttling default.
