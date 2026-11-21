# Panduan Deploy Vercel — group.portofolio.my.id

## 1. Sambungkan repo GitHub ke Vercel

1. Buka [vercel.com](https://vercel.com) → Add New → Project → Import `dwimahdini/projekporto` (branch `main`).
2. Framework Preset: **Next.js** (terdeteksi otomatis).
3. Build Command: `npm run build` (default). Output Directory: default Next.js (jangan diubah).
4. Install Command: `npm install` (default).
5. Deploy sekali dulu untuk memastikan build hijau, baru isi environment variable di bawah.

## 2. Environment variable

Isi di Vercel → Project → Settings → Environment Variables. **Production TIDAK boleh berisi `PAYMENT_PROVIDER=mock` maupun `ALLOW_MOCK_PAYMENT=true`.** Kedua variabel itu hanya untuk Preview dan lokal.

| Nama | Fungsi | Contoh / placeholder | Environment |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase | `https://xxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Kunci anon Supabase (publik, aman di client) | `eyJhbGciOi...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci service_role (HANYA server, jangan pernah di client) | `eyJhbGciOi...` | Production, Preview, Development |
| `PAYMENT_PROVIDER` | `mock` atau `midtrans`. Kosong = `midtrans` | `midtrans` | Production: **wajib `midtrans`** |
| `ALLOW_MOCK_PAYMENT` | `true` mengaktifkan simulasi (bersama `PAYMENT_PROVIDER=mock`) | `false` | **HANYA Preview/Development. JANGAN di Production.** |
| `MIDTRANS_SERVER_KEY` | Kunci server Midtrans (nanti, Tahap Midtrans) | `SB-Mid-server-xxxx` | Production (produksi), Preview (sandbox) |
| `MIDTRANS_CLIENT_KEY` | Kunci client Midtrans | `SB-Mid-client-xxxx` | Production, Preview |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | Kunci client Midtrans untuk Snap (publik) | `SB-Mid-client-xxxx` | Production, Preview |
| `MIDTRANS_IS_PRODUCTION` | `false` = sandbox, `true` = produksi | `false` | Production: `true` (nanti), Preview: `false` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Site key Cloudflare Turnstile | `0x4AAAAAA...` | Production, Preview, Development |
| `TURNSTILE_SECRET_KEY` | Secret key Turnstile (HANYA server) | `0x4AAAAAA...` | Production, Preview, Development |
| `RESEND_API_KEY` | API key Resend (email) | `re_xxxx` | Production, Preview, Development |
| `EMAIL_FROM` | Alamat pengirim | `Portofolio <noreply@group.portofolio.my.id>` | Production, Preview, Development |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Kontak di Kebijakan Privasi | `admin@group.portofolio.my.id` | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | URL aplikasi utama | `https://group.portofolio.my.id` | Production, Preview, Development |
| `NEXT_PUBLIC_ROOT_DOMAIN` | Domain root portofolio klien | `portofolio.my.id` | Production, Preview, Development |
| `ORDER_TOKEN_TTL_DAYS` | Masa berlaku token order | `14` | Production, Preview, Development |
| `CRON_SECRET` | Secret cron cleanup (header `Authorization: Bearer ...`) | string acak panjang | Production, Preview |

## 3. Urutan migrasi SQL di Supabase

Di Supabase Dashboard → SQL Editor, jalankan **berurutan** (jangan diubah isinya):

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_tahap2.sql`
3. `supabase/migrations/0003_templates.sql`
4. `supabase/migrations/0004_payments.sql`
5. `supabase/migrations/0005_tahap6.sql`
6. `supabase/migrations/0006_tahap7.sql` — **perhatian:** baris `ALTER TYPE ... ADD VALUE 'disabled'` tidak bisa jalan di dalam blok transaksi. SQL Editor mengeksekusi pernyataan satu per satu, jadi file ini bisa dijalankan langsung di sana.

Lalu jalankan `supabase/seed.sql` (data contoh Dwi Mahdini, opsional).

### Cara membuat admin pertama

Lihat `docs/TAHAP7.md` — buat user lewat Supabase Dashboard → Authentication → Users, lalu satu query SQL untuk mengubah `profiles.role` jadi `'admin'`. Tidak ada password di kode atau repo.

## 4. Pengaturan domain

- **Domain utama proyek di Vercel:** `group.portofolio.my.id` — Vercel → Project → Settings → Domains → tambah domain ini.
- **DNS di Cloudflare:** domain `portofolio.my.id` memakai nameserver Cloudflare. Tambah record untuk domain utama sesuai instruksi Vercel (A/CNAME yang ditampilkan Vercel saat menambah domain).
- **Subdomain klien** (`{subdomain}.portofolio.my.id`): ditambahkan **manual per klien** setelah lunas — langkahnya di `docs/CHECKLIST_DOMAIN_KLIEN.md`.

## 5. Konfigurasi layanan

- **Cloudflare Turnstile:** buat widget di Cloudflare Dashboard → Turnstile → Add Site (mode Managed). Salin Site Key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, Secret Key → `TURNSTILE_SECRET_KEY`.
- **Layanan email (Resend):** verifikasi domain pengirim di Resend (tambah record DNS yang diminta Resend untuk `group.portofolio.my.id`), lalu isi `RESEND_API_KEY` + `EMAIL_FROM`. Tanpa verifikasi domain, email masuk spam atau ditolak.
- **Supabase Storage:** bucket `portfolio-uploads` dibuat oleh migrasi 0002 (privat, batas 2 MB, hanya jpg/png/webp). Pastikan bucket-nya **privat** (bukan public) di Supabase Dashboard → Storage.
- **Cron job:** sudah didefinisikan di `vercel.json` — `GET /api/cron/cleanup-drafts` harian 03:00 WIB (`0 20 * * *` UTC). Vercel mengirim header `Authorization: Bearer <CRON_SECRET>` secara otomatis kalau secret diisi di project settings (Vercel Cron memakai secret dari environment variable `CRON_SECRET` — pastikan namanya sama).

## 6. Peringatan — cek sendiri sebelum rilis

- **Paket gratis Vercel Hobby:** periksa syarat penggunaan komersial yang berlaku saat ini di [vercel.com/pricing](https://vercel.com/pricing) — paket Hobby ditujukan untuk proyek non-komersial/pribadi; kalau platform ini menghasilkan uang, kemungkinan butuh paket Pro. Batas domain per proyek dan batas bandwidth juga berbeda per paket — cek angka terbarunya di halaman pricing sebelum rilis.
- **Batas frekuensi cron:** paket Hobby mengizinkan cron **maksimal 1x per hari** (dan maksimal 2 job). Jadwal harian 03:00 WIB sudah sesuai. Kalau butuh lebih sering, upgrade ke Pro atau pakai Supabase `pg_cron`.
- **Production TIDAK boleh mock:** periksa sekali lagi di Vercel → Settings → Environment Variables (Production): tidak ada `PAYMENT_PROVIDER=mock` dan tidak ada `ALLOW_MOCK_PAYMENT=true`. Panel admin menampilkan peringatan merah kalau keduanya terisi di production.
- **Halaman legal masih DRAF:** `/kebijakan-privasi` dan `/syarat-layanan` perlu ditinjau penasihat hukum sebelum dipakai komersial.
