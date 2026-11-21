# Tahap 2 — Form pesanan tanpa login

## Alur

1. **Landing (`/`)** — Langkah 1: email + subdomain + template + checkbox privasi wajib + Turnstile. Server (`POST /api/orders`) membuat order `draft`, token 32 byte acak (disimpan hash SHA-256), masa berlaku 14 hari, lalu kirim link `/pesanan/[token]` via Resend. Di dev tanpa `RESEND_API_KEY`, link ditampilkan di layar (jangan lakukan ini di production).
2. **Order (`/pesanan/[token]`)** — 7 langkah: verifikasi email, identitas, pendidikan, pengalaman, proyek, skill/sertifikasi/publikasi, tampil & review. Tiap langkah tersimpan otomatis lewat `PATCH /api/orders/[token]` yang memvalidasi token dulu, lalu data langkah itu dengan Zod.
3. **Verifikasi email** — tombol di Langkah 1 order memanggil `POST /api/orders/[token]/verify`. Tanpa `email_verified_at`, order tidak boleh lanjut ke pembayaran (dicek lagi di Tahap 5).
4. **Cek pesanan saya (`/cek-pesanan`)** — input email, server mengirim ulang link. Respons SELALU sama, baik email terdaftar maupun tidak, supaya orang tidak bisa menebak email siapa yang pernah pesan.
5. **OTP edit data pribadi** — mengubah email/HP/WA/alamat/tanggal lahir setelah data pertama terisi wajib OTP 6 digit (10 menit, maks 5 coba, hash SHA-256 di tabel `otps`). Minta di Langkah 1 order: `POST /api/orders/[token]/otp` dengan `action: request` lalu `verify`.
6. **Upload** — `POST /api/upload` lewat server ke bucket privat `portfolio-uploads` (Supabase Storage). Batas 2 MB, hanya jpg/png/webp, nama file acak. Mengembalikan signed URL 1 jam untuk preview.
7. **Hapus draft 14 hari** — fungsi SQL `cleanup_expired_drafts()` menghapus order `draft/preview/pending_payment` yang `draft_expires_at`-nya lewat dan belum ada pembayaran settlement. Dijalankan Vercel Cron harian 03:00 WIB (`vercel.json` → `GET /api/cron/cleanup-drafts`, header `Bearer CRON_SECRET`).

## Keamanan yang diterapkan

- Token & OTP disimpan sebagai hash, bukan nilai asli.
- Rate limiting in-memory per IP/email (buat order 5/jam, OTP 3/jam per email, lookup 10/jam per IP, upload 20/jam per token). Catatan jujur: di serverless, batas ini per instance, bukan global — kalau traffic naik, ganti ke Redis.
- Turnstile di Langkah 1 dan Cek pesanan. Kalau secret belum diisi, verifikasi dilewati di dev dengan peringatan di log — di production secret WAJIB diisi.
- RLS: tabel `otps` tanpa policy untuk anon (hanya service_role + admin baca). Bucket Storage privat, upload hanya lewat server.
- Checkbox privasi wajib sebelum order dibuat; alamat tidak pernah masuk view publik.

## Nyaman di HP

- Input minimal 48px, tombol 52px, navigasi bawah yang menempel (Kembali / Lanjut), progress bar, grid 1 kolom di HP dan 2 kolom di layar besar, teks ukuran dasar 16px supaya iOS tidak auto-zoom saat mengetik.

## Yang belum (Tahap 3-5)

- Template final (Tahap 3) — saat ini masih template Tahap 1 (minimal/modern/dll).
- Preview berwatermark + tombol bayar yang baru muncul setelah render (Tahap 4).
- Pembayaran Midtrans + webhook (Tahap 5).
- Halaman `/privasi` dan `/syarat` saat ini masih draf singkat; versi lengkap UU PDP di Tahap 7.
