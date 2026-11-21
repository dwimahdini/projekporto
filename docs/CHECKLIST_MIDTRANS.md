# Checklist Pindah dari Mock ke Midtrans

Ikuti berurutan. Jangan ubah `PAYMENT_PROVIDER` di production sebelum semua langkah sandbox lolos.

## 1. Daftar akun dan verifikasi usaha

- [ ] Daftar di [midtrans.com](https://midtrans.com) (akun merchant).
- [ ] Lengkapi data usaha dan verifikasi (KTP, rekening, dokumen usaha sesuai permintaan Midtrans).
- [ ] Catat: akun sandbox (otomatis aktif setelah daftar) vs akun produksi (aktif setelah verifikasi usaha disetujui).

## 2. Isi MidtransProvider (Snap token)

- [ ] Buka `src/lib/payments/midtrans-provider.ts` — ikuti TODO dan checklist di dalam file itu.
- [ ] Implementasi `createPayment(order)`: panggil Midtrans Snap API untuk membuat Snap token (pakai `MIDTRANS_SERVER_KEY`, kirim `order_id` unik + `gross_amount` dari `price_snapshot` server — JANGAN dari frontend).
- [ ] Implementasi `getStatus(paymentId)`: panggil API status transaksi Midtrans.
- [ ] Jangan menambah dependensi baru kalau tidak perlu; kalau memakai `midtrans-client`, pasang dan catat di `package.json`.

## 3. Verifikasi signature_key

- [ ] Implementasi `handleNotification(request)`: hitung signature dari `order_id + status_code + gross_amount + server_key` (SHA-512) dan bandingkan dengan `signature_key` dari Midtrans. Tolak notifikasi yang signature-nya tidak cocok (401).
- [ ] Pastikan `order_id` notifikasi dipetakan ke `provider_ref` payment kita (bukan ke ID order langsung).

## 4. Webhook idempoten lewat applyPaymentResult

- [ ] Webhook (`src/app/api/webhooks/midtrans/route.ts`) HANYA memanggil `applyPaymentResult()` (Tahap 5) — jangan menulis logika transisi sendiri di webhook.
- [ ] `applyPaymentResult` sudah atomik + idempoten (RPC `apply_payment_result()` di migrasi 0004): notifikasi yang sama dua kali tidak mengubah apa-apa di kali kedua; paid tidak bisa turun status.

## 5. Uji di sandbox

Set di `.env.local`: `PAYMENT_PROVIDER=midtrans`, `MIDTRANS_SERVER_KEY` + `MIDTRANS_CLIENT_KEY` **sandbox**, `MIDTRANS_IS_PRODUCTION=false`.

- [ ] Pembayaran berhasil (kartu tes Midtrans) → order jadi `domain_pending`.
- [ ] Pembayaran gagal → order kembali ke `preview`, bisa bayar ulang.
- [ ] Pembayaran kedaluwarsa → order kembali ke `preview`.
- [ ] Notifikasi ganda: kirim notifikasi yang sama dua kali (atau tekan "kirim ulang" di dashboard Midtrans) → hasil akhir sama, tidak ada payment ganda, email paid terkirim sekali.

## 6. Ganti kunci ke produksi

- [ ] Di Vercel (Production): ganti `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` ke kunci **produksi**, set `MIDTRANS_IS_PRODUCTION=true`.
- [ ] Daftarkan URL webhook produksi di dashboard Midtrans: `https://group.portofolio.my.id/api/webhooks/midtrans`.

## 7. Ganti provider dan hapus mock

- [ ] Set `PAYMENT_PROVIDER=midtrans` di Production.
- [ ] **Hapus `ALLOW_MOCK_PAYMENT`** dari environment Production (jangan hanya di-set `false` — hapus variabelnya supaya tidak ada yang menyalakannya lagi tanpa sengaja).
- [ ] Deploy, lalu cek panel admin: tidak ada peringatan merah mock, provider aktif tertulis "midtrans".

## 8. Tes satu transaksi nyata nominal kecil

- [ ] Buat satu order tes dengan paket termurah, bayar dengan metode pembayaran nyata nominal kecil.
- [ ] Cek: order jadi `domain_pending`, email paid terkirim, admin bisa menandai domain aktif, situs published.
- [ ] Kalau transaksi tes ini memakai data klien sungguhan, hapus datanya setelah tes selesai (tombol "Hapus data saya").
