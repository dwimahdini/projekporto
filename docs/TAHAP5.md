# Tahap 5 — Pembayaran: Mock + antarmuka provider

## Ringkasan

Tombol "Lanjut ke pembayaran" sekarang masuk ke sistem pembayaran yang bisa diganti providernya. Mock berfungsi penuh untuk simulasi; Midtrans hanya kerangka kosong (TODO + checklist), tanpa logika dan tanpa dependensi.

## File yang dibuat / diubah

**Dibuat:**
- `supabase/migrations/0004_payments.sql` — kolom baru di `payments` (provider, provider_ref, amount, raw_payload, internal_status, paid_email_sent_at) + fungsi RPC `apply_payment_result()` yang atomik dan idempoten. Migrasi lama tidak diubah.
- `src/lib/payments/mock-guard.ts` — `isMockPaymentEnabled()` (SATU fungsi bersama, cek di server).
- `src/lib/payments/transition.ts` — `decidePaymentTransition()` (logika murni, dites) + `canAccessPayment()`.
- `src/lib/payments/types.ts` — antarmuka `PaymentProvider` (createPayment, getStatus, handleNotification).
- `src/lib/payments/mock-provider.ts` — MockProvider (penuh).
- `src/lib/payments/midtrans-provider.ts` — MidtransProvider (kerangka kosong, hanya TODO + checklist).
- `src/lib/payments/factory.ts` — `getPaymentProvider()`; env kosong/tidak dikenal = "midtrans" (mock TIDAK aktif secara default).
- `src/lib/payments/apply-payment-result.ts` — SATU jalur transisi untuk Mock dan Midtrans nanti + email paid sekali.
- `src/app/api/orders/[token]/bayar-simulasi/route.ts` — POST simulasi (guard mock, token, payment milik order).
- `src/app/pesanan/[token]/bayar-simulasi/page.tsx` + `BayarSimulasiClient.tsx` — halaman simulasi (banner kuning, ringkasan, 3 tombol, noindex + no-referrer).
- `src/app/pesanan/[token]/status/page.tsx` + `OrderStatusClient.tsx` — halaman status (polling 5 detik, berhenti saat final/tab disembunyikan).
- `src/lib/payments/__tests__/payments.test.ts` + `vitest.config.ts` — 22 tes.
- `docs/TAHAP5.md` (file ini).

**Diubah:**
- `src/app/api/orders/[token]/proceed-to-payment/route.ts` — sekarang membuat payment lewat provider aktif; mock -> `/bayar-simulasi`, midtrans belum diimplementasi -> pesan rapi "Pembayaran belum tersedia" (503). Harga dari `price_snapshot` server; body request tidak dibaca.
- `src/app/api/orders/[token]/route.ts` (GET) — kini mengembalikan `payments` (riwayat) untuk halaman status.
- `src/app/pesanan/[token]/bayar/page.tsx` — jadi halaman fallback "Pembayaran belum tersedia" yang rapi.
- `src/lib/email.ts` — `sendPaidEmail()` (kalau Resend belum dikonfigurasi, catat log, jangan error).
- `.env.example` — `PAYMENT_PROVIDER` + `ALLOW_MOCK_PAYMENT` dengan peringatan "JANGAN diaktifkan di environment Production".
- `package.json` — `midtrans-client` DIHAPUS (tidak dipakai di mana pun, hanya di package.json), `vitest` ditambah, script `test` + `typecheck`. `.eslintrc.json` ditambah supaya `npm run lint` tidak interaktif.

## Penjaga mode mock (dua lapis)

Mock aktif hanya kalau SEMUA terpenuhi: `PAYMENT_PROVIDER=mock` DAN `ALLOW_MOCK_PAYMENT=true` DAN `VERCEL_ENV !== production`. Kalau satu saja tidak terpenuhi, halaman dan route simulasi 404. Pengecekan di satu fungsi `isMockPaymentEnabled()` dan dilakukan di server.

## Cara menjalankan migrasi baru

Di Supabase SQL Editor, jalankan **setelah 0003**:
1. `supabase/migrations/0004_payments.sql`

(Seed hanya untuk dev.) Tanpa migrasi ini, RPC `apply_payment_result()` tidak ada dan pembayaran gagal.

## Cara menguji alur simulasi (lokal)

1. Salin `.env.example` ke `.env.local`, isi Supabase + Resend (boleh kosong untuk tes dev), lalu tambah:
   ```
   PAYMENT_PROVIDER=mock
   ALLOW_MOCK_PAYMENT=true
   ```
   Jangan pernah isi dua baris itu di production.
2. `npm run dev` (atau `npm run build && npm run start`).
3. Buat order lewat landing, verifikasi email (cek log server kalau Resend kosong), lengkapi form, pilih template, tekan "Lihat pratinjau", lalu "Lanjut ke pembayaran".
4. Harusnya masuk ke `/pesanan/[token]/bayar-simulasi` dengan banner kuning "MODE SIMULASI, BUKAN PEMBAYARAN ASLI".
5. Tekan "Simulasikan berhasil" -> masuk `/pesanan/[token]/status`, tampil "Lunas — situs sedang diaktifkan", order jadi `domain_pending`.
6. Ulangi dengan order baru untuk "Simulasikan gagal" dan "Simulasikan kedaluwarsa" -> order kembali ke `preview` dengan tombol "Bayar ulang" / "Buat pembayaran baru".
7. Matikan mock (`PAYMENT_PROVIDER=midtrans` atau hapus `ALLOW_MOCK_PAYMENT`), restart, buka `/bayar-simulasi` -> harus 404.

## Yang dites otomatis (`npm test`, 22 tes lolos)

- Guard mock: aktif di lokal/preview, mati di production, mati kalau provider bukan mock, mati kalau ALLOW bukan true, mati kalau env kosong.
- Factory default ke midtrans kalau env kosong/tidak dikenal.
- Transisi: pending->paid jadi domain_pending, pending->failed/expired kembali ke preview, paid+paid idempoten, paid tidak boleh turun ke failed/expired, failed tidak bisa jadi paid, tidak boleh paid dari order draft/preview.
- Token A tidak bisa pakai payment order B (`canAccessPayment`).
- Harga frontend diabaikan: `createPayment` hanya menerima `OrderForPayment` (tidak ada parameter harga); route tidak membaca body.
- Email paid: hanya kirim kalau `changed=true` dan result=paid.

Tes yang TIDAK bisa jalan tanpa database (dan kenapa): alur end-to-end dengan Supabase asli (RPC, email ganda di DB). Itu dites manual lewat langkah di atas setelah migrasi dijalankan.

## Verifikasi Tahap 5 (2026-11-21)

`npm test` 22/22 lolos, `npm run lint` bersih, `npx tsc --noEmit` lolos, `npm run build` berhasil. Halaman simulasi dites langsung saat mock mati: page 404, API 404, halaman status 200.

## Checklist mengganti ke Midtrans (nanti)

1. Pasang dependensi Midtrans (pilih satu): `npm install midtrans-client`, atau panggil REST Midtrans langsung dengan fetch + Basic Auth server key.
2. Isi `src/lib/payments/midtrans-provider.ts` mengikuti checklist di file itu:
   - `createPayment()`: buat Snap transaction (order_id unik dari provider_ref, gross_amount dari `price_snapshot`), simpan Snap token di `raw_payload`, kembalikan URL/token Snap untuk popup.
   - `getStatus()`: panggil Midtrans Status API, petakan transaction_status ke paid/failed/expired.
   - `handleNotification()`: verifikasi `signature_key` SHA-512 (`src/lib/midtrans.ts`), tolak 401 kalau tidak cocok, petakan status, lalu panggil `applyPaymentResult()` — jangan ubah status order langsung.
3. Perbarui webhook `src/app/api/webhooks/midtrans/route.ts` supaya memanggil `MidtransProvider.handleNotification()` (sekarang masih kerangka verifikasi signature saja).
4. Set env: `PAYMENT_PROVIDER=midtrans`, HAPUS `ALLOW_MOCK_PAYMENT` (atau set `false`). Pastikan di Vercel production tidak ada `ALLOW_MOCK_PAYMENT=true`.
5. Jalankan migrasi 0004 (kalau belum) — kolom `provider`/`internal_status` sudah disiapkan untuk Midtrans.
6. Tes di sandbox Midtrans: bayar berhasil, gagal, kedaluwarsa, notifikasi ganda (harus idempoten), dan bayar ulang setelah gagal.
7. Setelah lolos, baru pertimbangkan production (`MIDTRANS_IS_PRODUCTION=true` + server key production).
