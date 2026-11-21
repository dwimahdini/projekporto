# Lisensi — Font dan Library

Kelima template **tidak memakai aset atau font berlisensi** (tidak ada font unduhan, tidak ada gambar stok, tidak ada ikon berbayar).

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
