# Tahap 6 — Publikasi, domain, dan halaman pesanan klien

## Ringkasan

Middleware subdomain, panel admin "Menunggu domain", dashboard klien tanpa akun, hapus data lewat email, dan SEO per situs klien. Tidak ada jalur status baru: `paid -> domain_pending` tetap lewat `applyPaymentResult()` Tahap 5.

## File yang dibuat / diubah

**Dibuat:**
- `supabase/migrations/0005_tahap6.sql` — tabel `deletion_requests` (token hash, 24 jam, sekali pakai) + kolom `orders.published_at`, `published_email_sent_at`, `domain_status` (`inactive`/`pending`/`active`), `domain_status_updated_at`. Migrasi lama tidak diubah.
- `src/lib/subdomain.ts` — `isForbiddenSubdomain()`, `canRenderPublicPortfolio()`, `isSubdomainLocked()`, `hasSubdomainConflict()` (fungsi murni, dites).
- `src/lib/public-portfolio.ts` — `applyVisibilityToPortfolio()` (cerminan view SQL, untuk tes).
- `src/app/api/orders/[token]/delete-request/route.ts` + `delete-confirm/route.ts` — "Hapus data saya" dua langkah lewat email.
- `src/app/pesanan/[token]/hapus/page.tsx` — halaman konfirmasi hapus (permanen, hard delete order + cascade).
- `src/app/api/admin/orders/[id]/activate/route.ts` — "Tandai domain aktif" (admin saja, hanya domain_pending, idempoten).
- `src/app/admin/AdminClient.tsx` — login admin + tombol aktivasi dengan checklist manual (3 langkah, tombol baru aktif kalau semua dicentang) + `decideActivation()` untuk tes.
- `src/lib/__tests__/tahap6.test.ts` — 40 tes.
- `docs/TAHAP6.md` (file ini).

**Diubah:**
- `middleware.ts` — `wirza.localhost:3000` sekarang rewrite ke `/s/wirza` (sebelumnya hanya `?__subdomain=`).
- `src/app/s/[subdomain]/page.tsx` — `generateMetadata()` (judul, deskripsi, Open Graph dari data klien); halaman ini hanya merender order published dari view `public_portfolio`, tanpa watermark; selain published -> 404.
- `src/app/admin/page.tsx` — daftar "Menunggu domain" asli: subdomain, nama klien, tanggal bayar, template, harga, status domain + checklist + tombol aktivasi; plus 20 situs aktif terakhir. Noindex.
- `src/app/pesanan/[token]/page.tsx` — noindex + no-referrer; halaman ini adalah dashboard klien.
- `src/components/order/OrderForm.tsx` — kartu dashboard di atas form: status (label bahasa Indonesia), domain, template, harga, link situs kalau published, link "Lihat status" dan "Pratinjau & ganti template", tombol "Hapus data saya".
- `src/app/api/orders/[token]/proceed-to-payment/route.ts` — cek ulang keunikan subdomain saat masuk `pending_payment` (409 kalau ada order lain yang masih hidup dengan subdomain sama).
- `src/app/api/orders/[token]/route.ts` (PATCH) — field `subdomain` di body ditolak 403 ("Subdomain sudah dikunci").
- `src/lib/payments/apply-payment-result.ts` — saat paid, `domain_status` ikut jadi `pending`.
- `vitest.config.ts` — `esbuild.jsx: "automatic"` supaya template JSX bisa dirender di tes.

## Middleware subdomain

- `group.portofolio.my.id` -> aplikasi utama; `{subdomain}.portofolio.my.id` -> rewrite `/s/[subdomain]`; `wirza.localhost:3000` -> `/s/wirza` (dev).
- Keputusan published/tidak ada di halaman `/s/[subdomain]`, bukan di middleware: view `public_portfolio` hanya mengembalikan order published, kalau tidak ada baris -> 404 rapi. Jadi `domain_pending` juga 404, tanpa membocorkan alasan.

## Alur status & domain_status

- `paid -> domain_pending`: `applyPaymentResult()` (Tahap 5), tidak ada jalur baru. Di sini hanya: order `domain_pending` muncul di daftar admin, dan `domain_status` ikut jadi `pending`.
- `domain_pending -> published`: tombol admin "Tandai domain aktif" (update bersyarat `WHERE status='domain_pending'`, `domain_status='active'`, email sekali via `published_email_sent_at`).
- `orders.status` tetap satu-satunya sumber kebenaran status. `domain_status` hanya label operasional untuk admin.

## Panel admin "Menunggu domain"

- Hanya admin login (Supabase Auth + `profiles.role='admin'`, dicek di server lewat `isAdminRequest()`).
- Per order: subdomain, nama klien, tanggal bayar (dari payment paid), template, harga, status domain.
- Checklist manual per order: (a) tambah domain di Vercel (Project > Domains), (b) tambah CNAME di Cloudflare ke cname.vercel-dns.com, DNS only (proxy mati), (c) tunggu Vercel menandai Valid. Tombol aktivasi baru aktif kalau ketiganya dicentang.
- `addDomain()` masih hanya mencatat log (manual). TODO API Vercel + Cloudflare ada di `src/lib/domains/add-domain.ts`.

## Dashboard klien (tanpa akun)

`/pesanan/[token]` adalah dashboardnya: status pesanan + domain, link situs (hanya kalau published), edit data (form di bawah kartu), ganti template (lewat pratinjau). Edit data pribadi (tanggal lahir, alamat, nomor HP) tetap meminta OTP email seperti Tahap 2 (sudah ada di PATCH route, tidak diubah). Tombol "Hapus data saya": tekan -> link konfirmasi dikirim ke email (berlaku 24 jam, sekali pakai) -> buka link -> tekan konfirmasi -> semua data dihapus permanen (hard delete order, cascade ke profile/tabel anak/payments), subdomain bebas dipakai lagi.

## SEO

- Situs klien (`/s/[subdomain]`): metadata + Open Graph per klien (nama, headline, bio, foto).
- Noindex: halaman pesanan, pratinjau, simulasi, status, dan admin.

## Cara menjalankan migrasi baru

Di Supabase SQL Editor, jalankan setelah 0004: `supabase/migrations/0005_tahap6.sql`.

## Yang dites otomatis (`npm test`, 62 tes: 22 Tahap 5 + 40 Tahap 6)

- Subdomain terlarang ditolak (semua 20 kata), format ditolak, valid diterima; konflik keunikan saat pending_payment; subdomain dikunci setelah paid.
- Hanya published yang tampil; domain_pending (dan semua status lain) 404.
- Render template publik tidak mengandung "PRATINJAU".
- Data privat yang tidak dicentang tidak muncul di HTML (render template asli dengan `renderToString`); yang dicentang boleh muncul.
- Aktivasi: non-admin ditolak, admin + domain_pending boleh, status lain ditolak, sudah published = idempoten.
- Token A tidak bisa pakai payment order B.

Tes yang tidak bisa jalan tanpa database: alur end-to-end dengan Supabase asli (aktivasi admin, hapus data lewat email, middleware di domain asli). Dites manual setelah migrasi dijalankan.

## Verifikasi Tahap 6 (2026-11-21)

`npm test` 62/62 lolos, `npm run lint` bersih, `npx tsc --noEmit` lolos, `npm run build` berhasil.
