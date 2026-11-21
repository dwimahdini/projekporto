# Checklist Uji End-to-End (manual)

Jalankan dengan alur simulasi (mock). Siapkan dulu:
- `.env.local` terisi (Supabase, Resend, Turnstile — lihat `docs/DEPLOY.md`).
- `PAYMENT_PROVIDER=mock` dan `ALLOW_MOCK_PAYMENT=true` di `.env.local` (lokal, BUKAN production).
- Migrasi 0001–0006 sudah dijalankan di Supabase.
- Jalankan `npm run dev`, buka `http://localhost:3000`.

## Alur utama (tandai ✓ tiap langkah)

### 1. Isi form sebagai tamu
- [ ] Buka halaman utama, klik "Buat Portofolio" / isi form.
- [ ] Isi email (email asli yang bisa kamu buka), subdomain unik (mis. `tes-e2e-1`), pilih template.
- [ ] Centang persetujuan Kebijakan Privasi + Syarat Layanan, kirim.
- [ ] Cek: link pesanan `/pesanan/[token]` terkirim ke email (atau, kalau Resend belum dikonfigurasi, cek log terminal `[email:dev]`).

### 2. Verifikasi email
- [ ] Buka halaman pesanan, minta kode OTP, cek email, masukkan kode.
- [ ] Cek: status berubah jadi terverifikasi; lengkapi biodata (nama, headline, bio, pendidikan, pengalaman, proyek).

### 3. Pilih template + pratinjau berwatermark
- [ ] Pilih template, tekan "Lihat pratinjau".
- [ ] Cek: pratinjau menampilkan data kamu, ada watermark diagonal "PRATINJAU", klik kanan/salin diblokir.
- [ ] Cek: tombol bayar baru aktif setelah render selesai.

### 4. Bayar simulasi
- [ ] Tekan "Lanjut ke pembayaran" → diarahkan ke `/pesanan/[token]/bayar-simulasi`.
- [ ] Cek: banner kuning "MODE SIMULASI, BUKAN PEMBAYARAN ASLI" terlihat, ringkasan (template, paket, harga, subdomain) benar.
- [ ] **Berhasil**: tekan "Simulasikan berhasil" → status jadi `domain_pending`, halaman status menampilkan "Pembayaran berhasil".
- [ ] **Gagal**: buat order kedua (atau bayar ulang dari halaman status), tekan "Simulasikan gagal" → status kembali ke `preview`, bisa bayar ulang.
- [ ] **Kedaluwarsa**: tekan "Simulasikan kedaluwarsa" → status kembali ke `preview`.
- [ ] **Bayar ulang**: dari halaman status, tekan bayar ulang → payment baru dibuat, payment lama dibatalkan (hanya satu pending).

### 5. Admin tandai domain aktif
- [ ] Login `/admin` dengan akun admin.
- [ ] Cek: order muncul di "Menunggu domain" dengan nama klien + tanggal bayar.
- [ ] Centang 3 langkah manual (Vercel, Cloudflare, tunggu Valid) — lakukan langkah manualnya di Vercel/Cloudflare (lihat `docs/CHECKLIST_DOMAIN_KLIEN.md`).
- [ ] Tekan "Tandai domain aktif" → status jadi `published`, email pemberitahuan terkirim ke klien (sekali saja; tekan lagi → "sudah aktif", tanpa email kedua).

### 6. Situs published di subdomain
- [ ] Buka `{subdomain}.portofolio.my.id` (atau `{subdomain}.localhost:3000` di lokal).
- [ ] Cek: situs tampil tanpa watermark, data sesuai, field privat yang tidak dicentang tidak tampil.

### 7. Edit data (dengan OTP)
- [ ] Di halaman pesanan, ubah tanggal lahir / alamat / nomor HP → diminta OTP email.
- [ ] Masukkan OTP → perubahan tersimpan dan tampil di situs published.

### 8. Ganti template
- [ ] Dari halaman pesanan, buka pratinjau, ganti template → data tetap, harga ikut template baru (kalau belum bayar).

### 9. Ekspor data
- [ ] Verifikasi OTP dulu, tekan "Unduh data saya (JSON)" → file JSON terunduh berisi seluruh data.

### 10. Hapus data
- [ ] Tekan "Hapus data saya" → link konfirmasi terkirim ke email → buka link → konfirmasi.
- [ ] Cek: data pribadi hilang; untuk order yang sudah dibayar, hanya catatan transaksi minimal (ID, nominal, tanggal, status) yang tersisa.

## Skenario negatif

- [ ] **Token salah**: buka `/pesanan/token-salah` → 404 / pesan "Link tidak valid".
- [ ] **Token pesanan lain**: pakai token order A untuk membuka/mengubah order B (ubah URL / panggil API dengan token A dan ID order B) → ditolak (401/403).
- [ ] **Subdomain terlarang**: coba buat order dengan subdomain `admin`, `www`, `api`, `pesanan` → ditolak dengan pesan jelas.
- [ ] **Upload file berbahaya**: upload file `.exe` yang diganti ekstensi `.png`, dan file teks berisi `<script>` dengan ekstensi `.jpg` → ditolak (validasi magic bytes).
- [ ] **Form dikirim berulang (rate limit)**: kirim form buat order 6x cepat dari IP yang sama → percobaan ke-6 ditolak 429.
- [ ] **Turnstile gagal**: (butuh Turnstile aktif) kirim form tanpa menyelesaikan captcha → ditolak.
- [ ] **Email tidak terkonfigurasi**: kosongkan `RESEND_API_KEY`, buat order → order tetap dibuat, link hanya muncul di log server (bukan error mentah), dan tidak ada data yang bocor ke halaman.
- [ ] **Mock di production**: (jangan di production sungguhan) cek panel admin menampilkan peringatan merah kalau `PAYMENT_PROVIDER=mock` + `ALLOW_MOCK_PAYMENT=true` di environment production.
- [ ] **Cron tanpa secret**: `curl /api/cron/cleanup-drafts` tanpa header → 401.
