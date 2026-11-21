# Tahap 4 — Pratinjau

## Perubahan dari spesifikasi awal (penting)

Spesifikasi awal menaruh pratinjau di `/pesanan/[token]/preview`. Tahap 4 ini memintanya di `/preview/[orderId]`. Yang dibuat: **keduanya**.

- **Utama (Tahap 4): `/preview/[orderId]?token=...`** — halaman pratinjau baru.
- **Lama (Tahap 2): `/pesanan/[token]/preview`** — sekarang redirect ke rute baru, supaya link lama tidak rusak.

Alasan `orderId` saja tidak cukup: UUID bisa ditebak/dicoba satu per satu. Jadi `/preview/[orderId]` tetap wajib membawa `token` di query, atau dibuka oleh admin yang login. Tanpa keduanya, halaman 404 (tidak membocorkan order itu ada atau tidak).

## Alur status

1. Klien selesai isi form → tombol "Lihat pratinjau" di Langkah 7 memanggil `POST /api/orders/[token]/preview` → status `draft -> preview`.
2. Halaman preview merender template pilihan dengan data klien (fungsi `buildPreviewPortfolio()` di `src/lib/portfolio-preview.ts`). Fungsi ini meniru logika view `public_portfolio` — hanya field yang flag visibility-nya true, email/telepon/WhatsApp default sembunyi, alamat tidak pernah disertakan — karena view aslinya hanya mengembalikan order `published`.
3. Tombol "Lanjut ke pembayaran" **hanya aktif setelah render selesai** (lihat bawah). Ditekan → `POST /api/orders/[token]/proceed-to-payment` → status `preview -> pending_payment`, lalu buka `/pesanan/[token]/bayar` (halaman bayar Midtrans dipasang Tahap 5). Syarat: email sudah terverifikasi, kalau belum, route menolak dengan 403.
4. Tombol "Ganti template" → `POST /api/orders/[token]/change-template` → hanya `template_id` (dan `price_snapshot` kalau belum bayar) yang berubah, data klien tetap. Status tetap `preview`.

## Kapan tombol bayar muncul

`PreviewClient` menganggap render selesai kalau template sudah mount + semua `<img>` di dalamnya sudah load (atau tidak ada gambar) + satu frame berikutnya. Ada batas aman 3 detik supaya tombol tidak hilang selamanya kalau ada gambar yang gagal load. Sebelum itu tombolnya ada tapi nonaktif dan berwarna abu-abu, dengan teks "Menunggu pratinjau selesai dirender…".

## Watermark & blokir salin

- Watermark diagonal "PRATINJAU" berulang, `pointer-events: none`, plus banner kuning "PRATINJAU — BELUM AKTIF" di atas dan tombol bayar di bawah.
- Area pratinjau: `onContextMenu` dicegah (klik kanan), `onCopy`/`onCut` dicegah, dan `select-none`.
- **Jujur soal batasnya:** ini hanya pencegah ringan. Orang yang paham DevTools tetap bisa menyalin lewat inspect element atau screenshot. Yang benar-benar melindungi adalah: preview tidak diindeks, hanya pemilik token/admin yang bisa buka, dan situs asli baru aktif setelah lunas + admin.

## Noindex

- `metadata.robots = { index: false, follow: false, nocache: true }` di `/preview/[orderId]` dan di rute lama `/pesanan/[token]/preview`.
- Halaman publik `{subdomain}` tetap boleh diindeks (itu situs asli yang sudah published).

## Akses

- Pemilik: token di query cocok dengan `orderId` itu (`getOrderByToken`).
- Admin: sesi Supabase Auth + `profiles.role='admin'` (`src/lib/admin-auth.ts`).
- Selain itu: 404.
- Ganti template & lanjut bayar hanya untuk pemilik (butuh token); admin yang membuka preview tidak bisa menekan tombol bayar dari situ.
