# group.portofolio.my.id — Platform Jasa Pembuatan Website Portofolio

Platform komersial: klien isi biodata, pilih 1 dari 5 template, lihat pratinjau berwatermark, bayar, lalu portofolio aktif di subdomain sendiri (`{subdomain}.portofolio.my.id`). Satu aplikasi Next.js melayani aplikasi utama (`group.portofolio.my.id`) dan semua portofolio klien.

**Status: Tahap 1–8 selesai (21 November 2026).** Pembayaran masih memakai MockProvider (simulasi); Midtrans belum diintegrasikan — lihat `docs/CHECKLIST_MIDTRANS.md`.

Verifikasi terakhir (Tahap 8): `npm test` 93/93 lolos, Playwright 13/13 lolos (1 alur penuh di-skip, butuh Supabase), `npm run lint` bersih, `npx tsc --noEmit` lolos, `npm run build` berhasil. Lighthouse: performa 91–99, aksesibilitas 100 di semua halaman yang diukur (lihat `docs/PERFORMANCE.md`).

## Stack

- Next.js 14 (App Router, TypeScript), Tailwind CSS, Framer Motion
- Supabase (PostgreSQL, Auth, Storage) — RLS, view `public_portfolio`
- Midtrans Snap (sandbox, belum diintegrasikan — kerangka kosong di Tahap 5)
- Cloudflare Turnstile, Resend (email), Vercel (hosting + Cron)

## Cara menjalankan (lokal)

```bash
cp .env.example .env.local   # isi Supabase + Turnstile + Resend (lihat .env.example)
npm install
npm run dev                  # http://localhost:3000
```

Tes subdomain di lokal: `http://wirza.localhost:3000` atau `http://localhost:3000/?__subdomain=wirza`.

## Cara pasang database (Supabase)

Jalankan di SQL Editor **berurutan** (jangan diubah isinya):

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_tahap2.sql`
3. `supabase/migrations/0003_templates.sql`
4. `supabase/migrations/0004_payments.sql`
5. `supabase/migrations/0005_tahap6.sql`
6. `supabase/migrations/0006_tahap7.sql` — baris `ALTER TYPE ... ADD VALUE 'disabled'` tidak bisa jalan di dalam blok transaksi; SQL Editor mengeksekusi pernyataan satu per satu, jadi aman di sana.

(Development saja) `supabase/seed.sql` untuk data contoh Dwi Mahdini.

## Environment variable

Daftar lengkap ada di `.env.example` (hanya placeholder, tanpa nilai asli) dan di `docs/DEPLOY.md` (termasuk environment mana yang boleh memakai tiap variabel).

**Aturan terpenting:** Production **TIDAK boleh** berisi `PAYMENT_PROVIDER=mock` maupun `ALLOW_MOCK_PAYMENT=true`. Keduanya hanya untuk Preview dan lokal.

## Struktur folder

```
src/
  app/            # Halaman + API routes (pesanan, preview, admin, s/[subdomain], demo)
  components/     # Template portofolio + komponen form
  lib/            # Supabase, order, otp, email, payments, subdomain, audit, sanitize
supabase/
  migrations/     # 0001–0006 (jangan ubah migrasi lama)
  seed.sql
e2e/              # Tes Playwright (main.spec.ts)
docs/             # Semua dokumentasi (lihat bawah)
```

## Daftar tahap

- **Tahap 1** — Scaffold, database + RLS + view `public_portfolio`, middleware subdomain. Detail: `docs/DESIGN.md`
- **Tahap 2** — Form tamu 7 langkah, OTP, upload, rate limit, cleanup draft 14 hari. Detail: `docs/TAHAP2.md`
- **Tahap 3** — 5 template + registry + demo. Detail: `docs/TAHAP3.md`
- **Tahap 4** — Pratinjau berwatermark, ganti template, lanjut ke pembayaran. Detail: `docs/TAHAP4.md`
- **Tahap 5** — PaymentProvider (Mock penuh, Midtrans kerangka kosong), penjaga mock, RPC idempoten. Detail: `docs/TAHAP5.md`
- **Tahap 6** — Middleware published-only, admin "Menunggu domain", dashboard klien, SEO. Detail: `docs/TAHAP6.md`
- **Tahap 7** — Panel admin lengkap, hak data klien (UU PDP), halaman legal draf, audit keamanan. Detail: `docs/TAHAP7.md`, `docs/SECURITY_AUDIT.md`
- **Tahap 8** — Pengujian menyeluruh + panduan deploy (tahap ini). Detail: `docs/TAHAP8.md`

## Dokumentasi

| Dokumen | Isi |
|---|---|
| `docs/DESIGN.md` | Desain awal (Tahap 1) |
| `docs/TAHAP2.md` – `docs/TAHAP8.md` | Catatan per tahap |
| `docs/E2E_CHECKLIST.md` | Checklist uji manual end-to-end + skenario negatif |
| `docs/PERFORMANCE.md` | Hasil Lighthouse + perbaikan + uji mobile |
| `docs/DEPLOY.md` | Panduan deploy Vercel (env, migrasi, domain, layanan) |
| `docs/CHECKLIST_DOMAIN_KLIEN.md` | Langkah manual tiap klien baru yang sudah lunas |
| `docs/CHECKLIST_MIDTRANS.md` | Langkah pindah dari mock ke Midtrans |
| `docs/SECURITY_AUDIT.md` | Audit keamanan (9 poin lulus + celah tersisa) |
| `docs/LICENSES.md` | Lisensi font dan library |

## Alur status order

`draft -> preview -> pending_payment -> paid -> domain_pending -> published`, plus `disabled`, `expired`, `cancelled`, `deleted`. Lunas **tidak sama** dengan situs aktif — hanya admin yang mengubah `domain_pending -> published` (Tahap 6).

## Yang BELUM ada

- Integrasi Midtrans asli (Snap + webhook lengkap) — checklist di `docs/CHECKLIST_MIDTRANS.md`
- Penambahan domain otomatis via API Vercel/Cloudflare (nanti, ganti isi `addDomain()` di `src/lib/domains/add-domain.ts`)
