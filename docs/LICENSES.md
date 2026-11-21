# Lisensi — Font dan Library

Kelima template buatan sendiri **tidak memakai aset atau font berlisensi** (tidak ada font unduhan, tidak ada gambar stok, tidak ada ikon berbayar).

## Template MIT (Tahap 9)

Tiga template baru — Developer, Desainer, Resume & CV — adalah
konversi dari template HTML oleh **mmrahmanbappi**
([100 Free HTML Templates](https://mmrahmanbappi.github.io/100-free-html-templates/portfolio/)),
lisensi **MIT** (tertera di halaman sumber: "MIT license, no sign up",
dan di JSON-LD tiap template: `"license": "https://opensource.org/licenses/MIT"`).

Lisensi MIT mengizinkan pemakaian komersial, modifikasi, dan penjualan
situs yang dibangun dari template ini, dengan syarat pemberitahuan
hak cipta dan lisensi tetap disertakan. Atribusi dicatat di sini
dan di komentar kepala tiap file komponen:

- Developer Portfolio — https://mmrahmanbappi.github.io/100-free-html-templates/portfolio/developer-portfolio/
- Designer Portfolio — https://mmrahmanbappi.github.io/100-free-html-templates/portfolio/designer-portfolio/
- Resume and CV — https://mmrahmanbappi.github.io/100-free-html-templates/portfolio/resume-cv/

Foto contoh (Unsplash) dari template asli **tidak ikut dipakai** —
foto di portofolio klien hanya dari upload klien sendiri (atau
inisial nama kalau tidak ada foto). Font Google yang dipakai
ketiga template ini (Gloock, Manrope, Source Serif 4, Public Sans)
berlisensi OFL (bebas dipakai).

## Font

- **Tumpukan font sistem** (system font stack) di semua template: `font-sans` Tailwind default (`ui-sans-serif, system-ui, ...`). Tidak ada font eksternal yang diunduh — jadi tidak ada lisensi font yang perlu dicatat dan tidak ada render-blocking font.

## Library animasi

- **Framer Motion** (`framer-motion`) — dipakai untuk animasi `Reveal` di template (`src/components/templates/shared.tsx`). Lisensi **MIT** (open source, bebas dipakai komersial). Repository: https://github.com/framer/motion

## Library lain yang relevan

- **Next.js** — MIT.
- **React** — MIT.
- **Tailwind CSS** — MIT.
- **Supabase JS client** (`@supabase/supabase-js`, `@supabase/ssr`) — MIT.
- **Zod** — MIT.
- **React Hook Form** — MIT.
- **Vitest** — MIT (dev only).
- **Playwright** (`@playwright/test`) — Apache-2.0 (dev only, untuk tes E2E).
- **Lighthouse** — Apache-2.0 (dev only, untuk audit performa).

Daftar lengkap dengan versi ada di `package.json`. Tidak ada dependensi yang memakai lisensi copyleft (GPL/AGPL) di proyek ini.

## Aset gambar

- Foto profil dan gambar proyek berasal dari **upload klien sendiri** (atau data contoh dari CV pemilik platform). Tidak ada gambar stok di template.
- Avatar tanpa foto memakai **inisial nama** (huruf), bukan gambar.
