# Keputusan Desain — Tahap 1

Bahasa sederhana, alasan singkat per keputusan.

## 1. Satu aplikasi, routing lewat middleware
Satu proyek Next.js di Vercel lebih murah dan mudah dirawat
daripada satu proyek per klien. Middleware membaca header
`host`: `group` = aplikasi utama, subdomain lain = portofolio
klien. Localhost diperlakukan sebagai aplikasi utama, dan
`?__subdomain=xxx` dipakai untuk mengetes tampilan subdomain
tanpa edit file hosts.

## 2. Order dipisah dari profile (1:1)
`orders` menyimpan hal komersial: template, status, subdomain,
harga saat order, token. `profiles` menyimpan isi portofolio:
nama, bio, pendidikan, pengalaman, dll. Kalau harga atau status
berubah, isi portofolio tidak ikut berubah. Kalau klien hapus
order, profile ikut terhapus (`on delete cascade`).

## 3. Token disimpan sebagai hash, bukan token asli
Token dibuat dari 32 byte acak. Yang disimpan hanya SHA-256-nya.
Alasan: kalau database bocor, penyerang tetap tidak bisa
membuat link `/pesanan/[token]` dari isi database. Token asli
hanya ada di email klien, dan ada masa berlakunya.

## 4. Status `domain_pending` dipertahankan
Di Tahap 1 ini kamu menulis status orders tanpa `domain_pending`,
tapi spesifikasi awalmu memilikinya — dan itu penting. `paid`
berarti uang masuk, `domain_pending` berarti menunggu admin
menambahkan domain secara manual, `published` berarti situs
sudah bisa dibuka. Kalau `paid` langsung jadi `published`,
klien akan membuka subdomain yang belum didaftarkan ke Vercel
dan hanya mendapat error.

## 5. RLS: default tolak, tamu lewat server
Tamu tidak punya login, jadi tidak ada policy yang mengizinkan
anon membaca `orders`/`profiles` langsung. Semua akses tamu
lewat server (service_role) setelah token diverifikasi. Ini
sengaja, bukan kekurangan. Kalau anon boleh SELECT orders,
semua email dan hash token klien bisa dibaca siapa saja.
Admin dibedakan lewat kolom `role` di `profiles`, dicek lewat
fungsi `is_admin()` (SECURITY DEFINER) supaya tidak rekursi.

Catatan jujur: spesifikasi awal bilang "tanpa login klien",
tapi Tahap 1 ini bilang "klien hanya bisa CRUD datanya sendiri".
Dua hal itu bertabrakan. Yang kubuat: tamu CRUD lewat server
+ token (sesuai spesifikasi awal), dan policy `owner` di RLS
disiapkan untuk nanti kalau klien diberi login. Jadi tidak ada
yang perlu diubah di database kalau nanti ada login.

## 6. `profile_visibility` terpisah, bukan kolom di profiles
Satu baris per field. Alasan: menambah field baru tidak perlu
mengubah skema tabel profiles, cukup tambah nama field di
CHECK. Alamat (`address`) sengaja tidak masuk daftar ini —
alamat tidak pernah tampil di publik, apa pun flag-nya.

## 7. Tabel anak punya `is_visible` sendiri
Klien bisa menyembunyikan satu proyek atau satu pengalaman
tanpa menghapus datanya. Data tetap ada, tinggal ubah flag
kalau mau ditampilkan lagi.

## 8. View `public_portfolio` satu-satunya sumber publik
View ini hanya mengembalikan order `published`, hanya field
yang diizinkan, dan tabel anak sebagai JSON. Email/telepon/
WhatsApp default sembunyi. Halaman publik dilarang query
`profiles`/`orders` langsung — kalau ada yang lupa, RLS
tetap menolaknya, dan view tetap menjadi pengaman kedua.
Fungsi `public_portfolio_by_subdomain()` adalah cara
middleware/halaman mencari satu subdomain.

## 9. `price_snapshot` di orders
Harga template bisa berubah. Order mengunci harga saat dibuat,
jadi klien membayar harga yang dia lihat, bukan harga baru.

## 10. `raw_notification` di payments disimpan utuh
Webhook Midtrans disimpan apa adanya (jsonb) untuk audit.
Kalau ada sengketa ("saya sudah bayar"), ada bukti mentahnya.
Status order hanya diubah webhook setelah signature SHA-512
diverifikasi — bukan dari frontend.
