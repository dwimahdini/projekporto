# Tahap 8 — Pengujian menyeluruh dan panduan deploy

Tahap ini tidak menambah fitur baru, hanya menguji, merapikan, dan menyiapkan rilis.

## File yang dibuat / diubah

**Dibuat:**
- `docs/E2E_CHECKLIST.md` — checklist uji manual (alur utama + skenario negatif).
- `docs/PERFORMANCE.md` — hasil Lighthouse sebelum/sesudah + uji mobile.
- `docs/DEPLOY.md` — panduan deploy Vercel (env lengkap, migrasi, domain, layanan).
- `docs/CHECKLIST_DOMAIN_KLIEN.md` — langkah manual tiap klien lunas + troubleshooting.
- `docs/CHECKLIST_MIDTRANS.md` — langkah pindah mock → Midtrans.
- `docs/LICENSES.md` — lisensi font (sistem, tanpa unduhan) dan library.
- `src/lib/__tests__/tahap8.test.ts` — 17 tes (mock guard 404, transisi pembayaran, hash token, batas subdomain, filter publik, rate limit).
- `playwright.config.ts` + `e2e/main.spec.ts` — tes E2E Playwright (statis + lebar layar + reduced motion + alur penuh yang di-skip tanpa Supabase).
- `docs/TAHAP8.md` (file ini).

**Diubah (perbaikan kecil dari temuan uji):**
- `src/components/templates/shared.tsx` — `Reveal` memakai `useReducedMotion()` (prefers-reduced-motion).
- `src/app/globals.css` — fallback CSS reduced-motion.
- `src/components/templates/MinimalisTemplate.tsx` — `text-gray-400` → `text-gray-500`, root `<div>` → `<main>`.
- `src/components/templates/GelapFuturistikTemplate.tsx` — `text-slate-500` → `text-slate-400`.
- `src/components/templates/KreatifTemplate.tsx` — avatar `bg-pink-400` → `bg-pink-600`.
- `README.md` — dirapikan (deskripsi, stack, cara jalan, env, struktur, daftar tahap, tabel dokumen).
- `package.json` — devDependency baru: `@playwright/test`, `lighthouse` (hanya untuk tes/audit lokal).

## Bug yang ditemukan dan diperbaiki

| Bug | Temuan | Perbaikan |
|---|---|---|
| Kontras warna gagal di 3 template | Lighthouse aksesibilitas 93–95 | gray-400→500, slate-500→400, pink-400→600 (lihat `docs/PERFORMANCE.md`) |
| Template Minimalis tanpa landmark utama | Audit `landmark-one-main` gagal | Root jadi `<main>` |
| Animasi tidak menghormati prefers-reduced-motion | Cek kode `Reveal` | `useReducedMotion()` + fallback CSS |

## Hasil tes

- **Vitest:** 93/93 lolos (22 Tahap 5 + 40 Tahap 6 + 14 Tahap 7 + 17 Tahap 8).
- **Playwright:** 13/13 lolos, 1 di-skip (alur penuh form → published — butuh Supabase + Resend terkonfigurasi, jalankan dengan `E2E_FULL=1 npx playwright test -g "alur penuh"`).
- **Lighthouse:** performa 91–99, aksesibilitas 100 di semua halaman yang diukur; best-practices dan SEO 100.
- **Mobile:** tidak ada scroll horizontal di 360/390/768/1280px (landing + demo minimalis).
- **npm audit:** TIDAK bisa dijalankan di mesin ini — registry npm di lingkungan ini menolak endpoint audit (`403 policy_denied` pada `POST /-/npm/v1/security/audits/quick`). Jalankan `npm audit` di mesin sendiri atau di CI Vercel sebelum rilis. Tidak ada kerentanan yang dilaporkan dari sumber lain; dependensi utama (Next.js 14, React, Supabase) memakai versi yang tercantum di `package.json`.

## Cakupan tes dan bagian yang belum teruji

**Teruji otomatis:** transisi pembayaran (idempoten, paid final), penjaga mock, akses token, validasi subdomain, filter `public_portfolio`, akses admin, mode hapus, cron, sanitasi, rate limit, render template (watermark, data privat), halaman statis + lebar layar + reduced motion (Playwright).

**Belum teruji otomatis (butuh Supabase asli):**
- RPC `apply_payment_result()` di database (logika murninya teruji lewat `decidePaymentTransition`, tapi eksekusi SQL-nya belum).
- Alur penuh form → published (tes Playwright-nya ada, di-skip tanpa env).
- RLS dengan kunci anon sungguhan (audit Tahap 7 memeriksa policy di file, bukan dengan query live).
- Webhook Midtrans (belum ada implementasi).
- Satu situs klien published di Lighthouse (template sama dengan `/demo`, lihat `docs/PERFORMANCE.md`).

## Urutan langkah rilis pertama

1. Jalankan migrasi 0001–0006 di Supabase (lihat `docs/DEPLOY.md` bagian 3).
2. Buat akun admin pertama (`docs/TAHAP7.md`).
3. Isi environment variable di Vercel — periksa Production tidak berisi mock (`docs/DEPLOY.md` bagian 2).
4. Sambungkan repo ke Vercel, deploy, tambah domain `group.portofolio.my.id`.
5. Konfigurasi Turnstile, Resend (verifikasi domain), Storage privat, cron.
6. Jalankan `docs/E2E_CHECKLIST.md` sekali penuh di production dengan satu order tes (mock TIDAK aktif di production — pakai alur sampai pembayaran, lalu selesaikan manual; atau uji penuh di Preview dengan mock).
7. Minta penasihat hukum meninjau halaman legal draf.
8. Kalau sudah siap menerima pembayaran asli, ikuti `docs/CHECKLIST_MIDTRANS.md`.
