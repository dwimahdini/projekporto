# Tahap 7 — Panel admin, kepatuhan privasi, dan audit keamanan

## Ringkasan

Panel admin lengkap (filter/cari/paginasi, detail, aksi nonaktifkan/aktifkan/batalkan, audit log), login admin lewat server dengan rate limit, hak data klien (ekspor JSON + hapus data dengan retensi transaksi minimal), halaman legal draf, dan pengerasan keamanan (header, rate limit, sanitasi). Hasil audit lengkap: `docs/SECURITY_AUDIT.md`.

## File yang dibuat / diubah

**Dibuat:**
- `supabase/migrations/0006_tahap7.sql` — tabel `audit_log`, status enum `disabled`, kolom `orders.deleted_at`, `cleanup_expired_drafts()` versi 2 (hapus juga file Storage, idempoten).
- `src/lib/audit.ts` — `logAudit()` + `decideAdminAction()` (murni, dites).
- `src/lib/sanitize.ts` — `safeHttpUrl()`, `validateImageMagicBytes()`, `isCronAuthorized()`.
- `src/lib/storage-cleanup.ts` — `deleteOrderFiles()` (hapus file upload milik order).
- `src/app/api/admin/login/route.ts` — login admin lewat server (rate limit 5x/15 menit per IP+email, penundaan 1 detik saat gagal, cek role di server, pesan error generik).
- `src/app/api/admin/orders/[id]/disable/route.ts`, `enable/route.ts`, `cancel/route.ts` — aksi admin, semua dicatat di `audit_log`.
- `src/app/api/admin/orders/[id]/reveal/route.ts` — tampilkan data pribadi (dicatat di `audit_log`, rate limit 20x/jam).
- `src/app/admin/orders/[id]/page.tsx` + `AdminOrderDetailClient.tsx` — detail pesanan (data klien, template, riwayat pembayaran, pratinjau, aksi, audit log).
- `src/app/api/orders/[token]/export/route.ts` — ekspor JSON (wajib OTP email, rate limit 5x/jam).
- `src/app/kebijakan-privasi/page.tsx`, `src/app/syarat-layanan/page.tsx` — halaman legal DRAF (banner jelas di atas).
- `src/lib/__tests__/tahap7.test.ts` — 14 tes.
- `docs/SECURITY_AUDIT.md`, `docs/TAHAP7.md` (file ini).

**Diubah:**
- `src/app/admin/page.tsx` — daftar semua pesanan (filter status, cari subdomain/email, paginasi 20/halaman), daftar "Menunggu domain" tetap di atas, peringatan MERAH kalau mock diminta di production, tombol keluar, nama provider aktif.
- `src/app/admin/AdminClient.tsx` — login lewat `/api/admin/login` + penundaan bertingkat di client (2s, 4s, … maks 30s), tombol `LogoutButton`.
- `src/app/api/orders/[token]/delete-confirm/route.ts` — dua jalur: belum dibayar = hard delete total; sudah dibayar = anonimisasi + simpan catatan transaksi minimal (lihat "Keputusan retensi" di bawah).
- `src/app/api/orders/[token]/delete-request/route.ts` — rate limit 3x/jam.
- `src/components/order/OrderForm.tsx` — tombol "Unduh data saya (JSON)" di dashboard (butuh OTP, kalau belum ada diarahkan ke Langkah 1).
- `src/app/api/cron/cleanup-drafts/route.ts` — fail-closed: kalau `CRON_SECRET` belum diisi, hanya diizinkan di development.
- `src/app/api/upload/route.ts` — validasi magic bytes file (bukan hanya MIME/ekstensi).
- `src/components/templates/shared.tsx` — `ContactLinks` hanya memakai URL http/https (`safeHttpUrl`), email/telepon divalidasi polanya.
- `next.config.mjs` — header keamanan (CSP, X-Content-Type-Options, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HSTS). `/pesanan/*` = `no-referrer`.
- `src/lib/rate-limit.ts` — batas baru: adminLogin, exportPerToken, deleteRequestPerToken, revealPerAdmin.
- `src/lib/admin-auth.ts` — `getAdminEmail()` (dipakai audit log), `isAdminRequest()` memakainya.
- `src/app/privasi/page.tsx`, `src/app/syarat/page.tsx` — redirect ke rute baru.
- `src/app/layout.tsx` — footer dengan link Kebijakan Privasi + Syarat Layanan.
- `src/components/order/CreateOrderForm.tsx` — checkbox persetujuan menautkan rute legal baru.
- `.env.example` — `NEXT_PUBLIC_CONTACT_EMAIL` untuk kontak di Kebijakan Privasi.
- `vercel.json` — tidak diubah (cron harian 03:00 WIB sudah sesuai batas paket Hobby).

## Cara menjalankan migrasi baru

Di Supabase SQL Editor, jalankan setelah 0005: `supabase/migrations/0006_tahap7.sql`.
**Perhatian:** baris `ALTER TYPE ... ADD VALUE 'disabled'` tidak bisa jalan di dalam blok transaksi. SQL Editor mengeksekusi pernyataan satu per satu, jadi file ini bisa dijalankan langsung di sana. Kalau memakai tool migrasi yang membungkus semuanya dalam satu transaksi, jalankan baris `ALTER TYPE` itu sendiri dulu.

## Cara membuat akun admin pertama

Tidak ada password di kode atau repo. Langkahnya (sekali saja, lewat dashboard Supabase):
1. Di Supabase Dashboard → Authentication → Users → Add user: isi email + password admin (password dibuat di sana, jangan dikirim lewat chat).
2. Jalankan di SQL Editor (ganti emailnya):
   ```sql
   -- Kalau belum ada baris admin untuk user ini, buat satu.
   -- (auth_user_id tidak punya unique constraint, jadi
   -- jangan pakai ON CONFLICT — cek dulu dengan select.)
   insert into public.profiles (auth_user_id, email, role, full_name)
   select id, email, 'admin', 'Admin'
   from auth.users where email = 'admin@contoh.id'
   and not exists (
     select 1 from public.profiles p where p.auth_user_id = auth.users.id
   );
   ```
   Kolom `auth_user_id` dan `role` sudah ada di `0001_init.sql` (role default `'client'`, admin butuh `order_id` NULL + `auth_user_id` terisi — insert di atas sudah memenuhi itu).
3. Login di `/admin` dengan email + password itu.

## Keputusan retensi saat hapus data (UU PDP + pembukuan)

- **Belum dibayar** (draft/preview/pending_payment/expired/cancelled): hapus TOTAL — order, semua tabel anak, dan file Storage (hard delete, cascade).
- **Sudah dibayar** (paid/domain_pending/published/disabled): hapus data pribadi dan konten (profile dianonimkan jadi "Klien terhapus", tabel anak dihapus, file Storage dihapus, subdomain dibebaskan), tapi SIMPAN catatan transaksi minimal untuk pembukuan: ID pesanan, nominal, tanggal, status (baris `orders` + `payments` tetap ada, tanpa data pribadi). Alasan: pembukuan dan bukti transaksi adalah kewajiban yang diakui UU PDP; menyimpan nama/alamat/email untuk itu tidak diperlukan.
- Keputusan ini dijelaskan juga di Kebijakan Privasi (bagian 5–6).

## Cron dan batas paket Vercel

- Job cleanup: `GET /api/cron/cleanup-drafts`, harian 03:00 WIB (`vercel.json`, `0 20 * * *` UTC), dilindungi `Authorization: Bearer <CRON_SECRET>`.
- **Paket Hobby Vercel: cron maksimal 1x per hari, 2 job.** Jadwal harian ini sudah sesuai batas itu. Kalau butuh lebih sering (misalnya per jam), upgrade ke Pro. Alternatif tanpa upgrade: Supabase `pg_cron` (lihat komentar di `0002_tahap2.sql`).

## Hasil audit

Lihat `docs/SECURITY_AUDIT.md`. Ringkasnya, 9 poin (a–i) **LULUS** dengan bukti: mock guard dipakai di halaman + API + provider; tidak ada harga dari frontend; token SHA-256; RLS anon hanya untuk template aktif dan view publik; tidak ada secret di bundle `.next`; data privat tidak bocor ke HTML publik (tes render); semua route admin menolak non-admin (live 403); cron menolak tanpa secret (live 401); tidak ada secret di `git log -p`.
Celah yang masih ada (detail + cara memperbaiki di audit): CSP `unsafe-inline`, rate limit in-memory per instance, log email dev berisi link/OTP, brute force login sebagian mengandalkan Supabase, halaman legal masih draf.

## Verifikasi Tahap 7 (2026-11-21)

`npm test` 76/76 lolos (22 Tahap 5 + 40 Tahap 6 + 14 Tahap 7), `npm run lint` bersih, `npx tsc --noEmit` lolos, `npm run build` berhasil.
Cek live (production build): header CSP/X-Content-Type-Options/X-Frame-Options/Permissions-Policy/HSTS hadir di halaman utama; `/pesanan/*` memakai `Referrer-Policy: no-referrer`; cron tanpa secret → 401; admin tanpa login → halaman login; aktivasi tanpa login → 403; `/kebijakan-privasi` dan `/syarat-layanan` → 200.
