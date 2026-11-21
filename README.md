# group.portofolio.my.id — Tahap 1 + 2 + 3 + 4 + 5 + 6 selesai

Status verifikasi Tahap 6 (2026-11-21): `npm test` 62/62 lolos, `npm run lint` bersih, `npx tsc --noEmit` lolos, `npm run build` berhasil. Status Tahap 5: `npm test` 22/22 lolos, `npm run lint` bersih, `npx tsc --noEmit` lolos, `npm run build` berhasil. Halaman simulasi dites langsung saat mock mati: page 404, API 404, halaman status 200. Status Tahap 4: `npx tsc --noEmit` lolos, `npm run build` berhasil, preview tanpa token dites langsung → 404 (tanpa token, token palsu, dan rute lama dengan token palsu). Status Tahap 3: `npx tsc --noEmit` lolos, `npm run build` berhasil, 5 halaman demo dites langsung (`/demo/minimalis`, `/demo/gelap-futuristik`, `/demo/kreatif`, `/demo/profesional`, `/demo/visual` — semua 200 dan menampilkan "Dwi Mahdini", template tidak dikenal 404). Status Tahap 2: `npx tsc --noEmit` lolos, `npm run build` berhasil (13 route). Perbaikan dari Tahap 1: `next.config.ts` diganti `next.config.mjs` karena Next 14.2.5 tidak mendukung config TypeScript, dan landing dijadikan `force-dynamic` supaya build tidak gagal saat env Supabase belum diisi.

Platform jasa pembuatan website portofolio murah.
Satu aplikasi Next.js melayani aplikasi utama (`group`) dan
portofolio klien (`{subdomain}.portofolio.my.id`).

## Yang sudah ada di Tahap 1

- Struktur Next.js 14 (App Router, TypeScript, Tailwind)
- `supabase/migrations/0001_init.sql` — semua tabel, RLS, view `public_portfolio`
- `supabase/seed.sql` — contoh Dwi Mahdini (development saja)
- `middleware.ts` — routing berdasarkan host + localhost
- `src/lib/domains/add-domain.ts` — stub log untuk penambahan domain manual
- `src/lib/midtrans.ts` + `src/app/api/webhooks/midtrans/route.ts` — kerangka verifikasi signature

## Cara menjalankan (lokal)

```bash
cp .env.example .env.local   # isi Supabase + Midtrans sandbox + Turnstile + Resend
npm install
npm run dev                  # http://localhost:3000
```

Tes subdomain di lokal: `http://localhost:3000/?__subdomain=dwimahdini`

## Cara pasang database (Supabase)

1. Buat project Supabase baru.
2. SQL Editor > paste `supabase/migrations/0001_init.sql` > Run.
3. (Development saja) paste `supabase/seed.sql` > Run.
4. Cek: `select * from public.public_portfolio_by_subdomain('dwimahdini');`
   Harusnya 1 baris, email dan telepon `null` (disembunyikan).

## Admin pertama

1. Buat user di Supabase Auth (Dashboard > Authentication > Add user).
2. Jalankan di SQL Editor (ganti UUID dengan id user itu):
```sql
insert into public.profiles (order_id, auth_user_id, role, full_name)
values (null, 'UUID-USER-ADMIN', 'admin', 'Admin');
```
3. Login lewat halaman `/admin` (logikanya di Tahap 4).

## Yang sudah ada di Tahap 2

- Form multi-langkah 7 langkah di `/pesanan/[token]` (RHF + Zod, autosave per langkah, toggle tampil per field, upload foto/gambar, OTP edit data pribadi)
- Langkah 1 di landing: email + subdomain + template + checkbox privasi wajib + Turnstile, order draft + token hash, link dikirim via Resend (dev: link ditampilkan)
- Verifikasi email sebelum boleh lanjut ke pembayaran; halaman `/cek-pesanan` dengan respons selalu sama (tidak membocorkan email terdaftar)
- Rate limiting, upload server ke Storage (2 MB, jpg/png/webp), hapus draft 14 hari (`cleanup_expired_drafts()` + Vercel Cron `vercel.json`)
- Migrasi `supabase/migrations/0002_tahap2.sql` — kolom identitas baru, tabel `otps`, bucket `portfolio-uploads`
- Detail: `docs/TAHAP2.md`

## Yang sudah ada di Tahap 3

- 5 template di `src/components/templates/` dengan props sama (`PortfolioData`): Minimalis, Gelap Futuristik, Kreatif, Profesional, Visual — masing-masing punya Hero, Tentang, Pengalaman, Proyek, Skill, Sertifikasi, Kontak, dan tidak menampilkan field kosong
- Registry `src/lib/templates/registry.ts` (template_id → komponen), data contoh CV Dwi di `src/lib/templates/demo-data.ts`
- Halaman `/demo/[template]` untuk membandingkan kelima template; halaman publik `/s/[subdomain]` sekarang memakai registry
- Migrasi `supabase/migrations/0003_templates.sql` (template final, harga contoh Rp49.000); `seed.sql` diperbarui
- Detail: `docs/TAHAP3.md`

## Yang sudah ada di Tahap 4

- Halaman `/preview/[orderId]?token=...` — hanya pemilik token atau admin, tanpa keduanya 404; rute lama `/pesanan/[token]/preview` redirect ke rute baru
- Submit pratinjau: `draft -> preview`; tombol "Ganti template" (data tetap, hanya template + harga berubah kalau belum bayar); tombol "Lanjut ke pembayaran" hanya aktif setelah render selesai, ditekan → `preview -> pending_payment` (syarat email terverifikasi)
- Watermark diagonal "PRATINJAU", blokir klik kanan/salin di area pratinjau (pencegah ringan saja, lihat `docs/TAHAP4.md`), `noindex` di halaman preview
- Detail: `docs/TAHAP4.md`

## Yang sudah ada di Tahap 5

- Antarmuka `PaymentProvider` + MockProvider penuh + MidtransProvider kerangka kosong (tanpa logika, tanpa dependensi Midtrans — `midtrans-client` dihapus dari package.json)
- Penjaga mock dua lapis (`PAYMENT_PROVIDER=mock` + `ALLOW_MOCK_PAYMENT=true` + bukan production), satu fungsi `isMockPaymentEnabled()` di server
- Migrasi `0004_payments.sql`: kolom provider/amount/internal_status + RPC `apply_payment_result()` atomik & idempoten (satu jalur untuk Mock dan Midtrans nanti)
- Halaman `/pesanan/[token]/bayar-simulasi` (banner MODE SIMULASI, 3 tombol) + `/pesanan/[token]/status` (polling 5 detik, bayar ulang)
- Email paid sekali (kalau Resend belum dikonfigurasi, catat log saja)
- Tes: `npm test` (22 tes)
- Detail + checklist Midtrans: `docs/TAHAP5.md`

## Yang sudah ada di Tahap 6

- Middleware subdomain (group = aplikasi utama, `{subdomain}` = portofolio published, `wirza.localhost:3000` untuk dev) — hanya published yang tampil, lainnya 404
- Panel admin "Menunggu domain": nama klien, tanggal bayar, checklist manual Vercel/Cloudflare, tombol "Tandai domain aktif" (admin saja, hanya domain_pending, idempoten, email sekali)
- Dashboard klien `/pesanan/[token]`: status + domain, link situs kalau published, edit data (OTP untuk data pribadi), ganti template, "Hapus data saya" (konfirmasi lewat link email 24 jam)
- `domain_status` + timestamp (migrasi `0005_tahap6.sql`); subdomain dikunci setelah paid + cek unik ulang saat pending_payment
- SEO per situs klien (metadata + Open Graph); noindex untuk pesanan, pratinjau, simulasi, status, admin
- Tes: `npm test` (62 tes)
- Detail: `docs/TAHAP6.md`

## Yang BELUM ada (Tahap 7-8)

- Integrasi Midtrans asli (Snap + webhook lengkap — checklist di `docs/TAHAP5.md`)
- Admin: tombol "Tandai domain aktif" + email ke klien (Tahap 6)
- Panel admin lengkap + privasi/syarat UU PDP (Tahap 7)
- Tes otomatis + panduan deploy (Tahap 8)
- Penambahan domain otomatis via API Vercel/Cloudflare (nanti, ganti isi `addDomain()`)
