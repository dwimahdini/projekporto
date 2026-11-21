# Audit Keamanan — Tahap 7

Tanggal: 21 November 2026. Dilakukan setelah Tahap 7 selesai, sebelum push.
Metode: baca kode + migrasi, jalankan tes otomatis, cek build output (`.next`), dan cek live server production build (`npm run start`).
**Jangan menyatakan "aman" tanpa bukti** — setiap poin di bawah punya bukti file/baris atau output tes.

## Hasil per poin

### a. isMockPaymentEnabled dipakai semua route simulasi — LULUS
- Halaman simulasi: `src/app/pesanan/[token]/bayar-simulasi/page.tsx:23` — `if (!isMockPaymentEnabled()) notFound();`
- API simulasi: `src/app/api/orders/[token]/bayar-simulasi/route.ts:16` — `assertMockPaymentEnabled()` dilempar jadi 404.
- Provider: `src/lib/payments/mock-provider.ts:15,55,69` — `createPayment`, `getStatus`, `handleNotification` masing-masing memanggil `assertMockPaymentEnabled()` sebelum logika apa pun.
- Penjaga: `src/lib/payments/mock-guard.ts:21-34` — aktif hanya jika `PAYMENT_PROVIDER=mock` DAN `ALLOW_MOCK_PAYMENT=true` DAN `VERCEL_ENV !== "production"`, dicek di server.
- Bukti live (Tahap 5, mock mati): halaman simulasi 404, API simulasi 404.

### b. Tidak ada route yang menerima harga dari frontend — LULUS
- `grep -rn "price" src/app/api/` hanya menemukan harga yang DIBACA dari tabel server: `src/app/api/orders/route.ts:40` (`.select("id, price, is_active")` dari `templates`) dan `src/app/api/orders/[token]/change-template/route.ts:25` (harga template baru dari server).
- Tidak ada route yang membaca `body.price` / `body.amount` dari frontend. Harga order berasal dari `price_snapshot` (server, saat order dibuat) dan `applyPaymentResult` memakai `price_snapshot` yang sama.

### c. Token pesanan A tidak bisa membuka/mengubah pesanan B; token disimpan sebagai hash — LULUS
- `src/lib/order.ts:27-36` — `getOrderByToken()` menghitung `hashToken(token)` (SHA-256) dan membandingkan `token_hash` di database; token polos tidak pernah disimpan. Token < 32 karakter langsung ditolak.
- Semua route order (`GET/PATCH /api/orders/[token]`, preview, upload, export, delete, simulasi) memakai `getOrderByToken()` yang sama, jadi token A tidak pernah mengembalikan order B.
- Tes: `src/lib/__tests__/tahap6.test.ts` — `canAccessPayment("order-A", "order-B")` = false; `src/lib/__tests__/tahap7.test.ts` — mode penghapusan dan ekspor hanya dengan token benar.

### d. Semua tabel tidak bisa dibaca/ditulis dengan kunci anon — LULUS (dengan satu pengecualian yang disengaja)
- `supabase/migrations/0001_init.sql:307-382` — RLS aktif di semua tabel. Tidak ada policy `to anon` untuk orders, profiles, profile_visibility, education, experiences, projects, skills, certifications, publications, payments, otps, deletion_requests, audit_log.
- Pengecualian yang disengaja dan aman:
  - `templates_read_public` (0001:307-308): anon boleh SELECT template yang `is_active = true` — data katalog publik (nama + harga), bukan data klien.
  - `public_portfolio` view + fungsi `public_portfolio_by_subdomain` (0001:511-512): `grant select/execute to anon` — view ini HANYA mengembalikan order `published` dan menghormati `profile_visibility` (email/phone/whatsapp default sembunyi, address tidak pernah ada).
- `audit_log` (0006): RLS aktif, tanpa policy anon sama sekali — baca/tulis hanya lewat server (service_role).

### e. service_role dan secret lain tidak muncul di bundle frontend — LULUS
- Setelah `npm run build`, `grep -rIl "SUPABASE_SERVICE_ROLE_KEY|CRON_SECRET|RESEND_API_KEY|MIDTRANS_SERVER_KEY|service_role" .next/static` — tidak ada hasil.
- `grep -rIo "NEXT_PUBLIC_[A-Z_]*" .next/static/chunks/*.js` — tidak ada hasil (hanya `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang dipakai di client, keduanya memang dirancang publik; anon key tanpa RLS yang benar tidak bisa membaca apa pun — lihat poin d).
- `src/lib/supabase/server.ts` memakai `SUPABASE_SERVICE_ROLE_KEY` hanya di server (tidak pernah diimpor komponen client).

### f. Data privat tidak keluar lewat API atau HTML publik — LULUS
- Tes: `src/lib/__tests__/tahap6.test.ts` — render template asli dengan `renderToString`: email/telepon yang toggle-nya mati TIDAK ada di HTML; yang dicentang boleh muncul.
- View SQL `public_portfolio` (0001) adalah satu-satunya sumber data `/s/[subdomain]`; API order mengembalikan profile lengkap hanya setelah `getOrderByToken()` lolos.
- Sanitasi Tahap 7: `src/lib/sanitize.ts` (`safeHttpUrl`, `validateImageMagicBytes`) + `src/components/templates/shared.tsx` (ContactLinks hanya memakai URL http/https, email/telepon divalidasi polanya).

### g. Semua route admin menolak non-admin — LULUS
- Semua route API admin memanggil `isAdminRequest()` / `getAdminEmail()` di server sebelum apa pun: `src/app/api/admin/orders/[id]/activate/route.ts`, `.../disable/route.ts`, `.../enable/route.ts`, `.../cancel/route.ts`, `.../reveal/route.ts`, dan halaman `/admin` + `/admin/orders/[id]` (server component).
- Login admin lewat server: `src/app/api/admin/login/route.ts` — rate limit 5x/15 menit per IP+email, penundaan 1 detik saat gagal, cek `profiles.role='admin'` di server.
- Bukti live: `POST /api/admin/orders/abc/activate` tanpa login → **403**; `GET /admin` tanpa login → halaman login, bukan data.
- Tes: `src/lib/__tests__/tahap7.test.ts` — `decideAdminAction` dan `decideActivation` menolak non-admin untuk semua aksi.

### h. Cron job menolak permintaan tanpa secret yang benar — LULUS
- `src/app/api/cron/cleanup-drafts/route.ts` + `src/lib/sanitize.ts` (`isCronAuthorized`): kalau `CRON_SECRET` diisi, header harus `Bearer <secret>` persis; kalau belum diisi, hanya diizinkan di development (fail-closed di production, diperbaiki di Tahap 7).
- Bukti live (production build, `CRON_SECRET` belum diisi): `GET /api/cron/cleanup-drafts` tanpa header → **401**.
- Tes: `src/lib/__tests__/tahap7.test.ts` — header benar diterima, tanpa/salah ditolak, secret kosong ditolak di production.
- Idempoten: `cleanup_expired_drafts()` (0006) menghapus dengan WHERE — panggilan kedua tidak menemukan baris lagi, mengembalikan 0.

### i. Tidak ada secret di riwayat git — LULUS
- `git log -p --all | grep -E "SB-Mid-server-[A-Za-z0-9]{8,}|re_[A-Za-z0-9]{20,}|eyJhbGciOi[A-Za-z0-9_-]{20,}"` — tidak ada hasil (21 Nov 2026).
- Pemeriksaan secret sebelum push Tahap 7: `grep` pola kunci di `src/`, `supabase/`, `docs/`, `.env.example`, `package.json` — hanya placeholder di `.env.example`. Tidak ada `.env.local` di repo.

## Celah yang masih ada

| # | Celah | Risiko | Cara memperbaiki |
|---|-------|--------|------------------|
| 1 | CSP memakai `script-src 'unsafe-inline'` dan `style-src 'unsafe-inline'` (`next.config.mjs`) | Sedang — mengurangi daya tahan CSP terhadap XSS inline | Terima untuk sekarang (Next.js butuh inline script untuk hydration). Mitigasi aktif: React meng-escape semua teks, tidak ada `dangerouslySetInnerHTML` di proyek ini, URL tautan disanitasi (`safeHttpUrl`). Nanti: nonce per-request via middleware. |
| 2 | Rate limiting in-memory per instance (`src/lib/rate-limit.ts`) | Sedang — di serverless, batas berlaku per instance, bukan global; penyerang bisa menyebar request ke banyak instance | Ganti penyimpanan dengan Upstash Redis / tabel database (antarmuka `checkRateLimit` sudah siap diganti). |
| 3 | Log email dev berisi link pesanan / OTP (`src/lib/email.ts:24,40,61,83`) | Rendah — hanya jalan kalau `RESEND_API_KEY` belum diisi | Pastikan `RESEND_API_KEY` terisi di production; jangan pernah buka log server ke publik. Nanti: hapus log link sepenuhnya, kirim lewat Resend saja. |
| 4 | Brute force login admin sebagian mengandalkan batas Supabase Auth sendiri | Rendah | Batas server 5x/15 menit + penundaan sudah ada (`src/app/api/admin/login/route.ts`). Tambahan: aktifkan CAPTCHA di Supabase Auth dan alert login gagal. |
| 5 | `templates_read_public` (anon SELECT template aktif) | Rendah — disengaja, data katalog publik | Tidak perlu diperbaiki; harga template memang ditampilkan di landing. |
| 6 | Migrasi 0006: `ALTER TYPE ... ADD VALUE` tidak bisa jalan di dalam blok transaksi | Operasional — migrasi gagal kalau dijalankan lewat tool yang membungkus semua pernyataan dalam satu transaksi | Jalankan lewat Supabase SQL Editor (pernyataan dieksekusi satu per satu) atau jalankan baris `ALTER TYPE` itu sendiri dulu. |
| 7 | Cron Vercel paket Hobby: maksimal 1x/hari, 2 job | Operasional — jadwal harian 03:00 WIB (`vercel.json`) sudah sesuai batas ini | Kalau butuh lebih sering dari harian, upgrade ke Pro. |
| 8 | Halaman legal masih DRAF | Hukum — jangan dipakai komersial sebelum ditinjau | Minta penasihat hukum meninjau `/kebijakan-privasi` dan `/syarat-layanan` sebelum go-live. |

## Yang TIDAK diaudit di sini
- Keamanan infrastruktur Supabase/Vercel/Cloudflare sendiri (tanggung jawab penyedia).
- Integrasi Midtrans asli — belum diimplementasikan (masih kerangka kosong, lihat `docs/TAHAP5.md`).
- Pengujian penetrasi end-to-end dengan Supabase asli — butuh migrasi 0001–0006 dijalankan dan `.env.local` diisi (belum dilakukan).
