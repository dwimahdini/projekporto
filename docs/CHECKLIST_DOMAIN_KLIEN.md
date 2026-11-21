# Checklist Domain Klien (manual, per klien yang sudah lunas)

Jalankan setiap kali ada order berstatus `domain_pending` di panel admin ("Menunggu domain").

## Langkah

1. **Tambah domain di Vercel** — Vercel → Project `projekporto` (atau nama proyekmu) → Settings → Domains → tambah `{subdomain}.portofolio.my.id` (ganti `{subdomain}` dengan subdomain klien). Tunggu sampai Vercel menampilkan domain itu di daftar.
2. **Tambah CNAME di Cloudflare** — Cloudflare → domain `portofolio.my.id` → DNS → tambah record: Type `CNAME`, Name `{subdomain}`, Target `cname.vercel-dns.com`, **Proxy status: DNS only (proxy mati, awan abu-abu)**. Jangan nyalakan proxy Cloudflare — Vercel tidak bisa memvalidasi domain kalau proxy nyala.
3. **Tunggu Vercel menandai Valid** — kembali ke Vercel → Domains. Status awalnya "Pending" / "Invalid Configuration". Tunggu sampai jadi **Valid**. Biasanya 1–10 menit setelah CNAME benar; kadang sampai 1 jam kalau DNS lambat.
4. **Buka situsnya dan cek tampilan** — buka `https://{subdomain}.portofolio.my.id`. Cek: nama dan data klien tampil, tanpa watermark "PRATINJAU", gambar/foto tampil, tidak ada error.
5. **Tekan "Tandai domain aktif" di panel admin** — `/admin` → daftar "Menunggu domain" → centang 3 langkah checklist → tekan tombol. Status order jadi `published`, email pemberitahuan terkirim ke klien (sekali saja).

## Troubleshooting

| Gejala | Penyebab umum | Perbaikan |
|---|---|---|
| Vercel: "Invalid Configuration" / domain tidak Valid | CNAME salah target, atau proxy Cloudflare masih nyala | Cek record CNAME di Cloudflare: target harus `cname.vercel-dns.com`, proxy **DNS only**. Tunggu 5–10 menit lalu refresh. |
| SSL belum aktif (browser: "Not Secure" / sertifikat error) | Sertifikat Vercel belum terbit | Tunggu — Vercel menerbitkan sertifikat otomatis setelah domain Valid, biasanya beberapa menit. Jangan tekan apa-apa; cek lagi 15 menit kemudian. |
| Situs 404 | Order belum `published`, atau subdomain salah ketik | Cek status order di `/admin` (harus `published` setelah langkah 5). Cek ejaan subdomain di URL vs di panel. Kalau order masih `domain_pending`, situs memang 404 — itu benar, selesaikan langkah 5. |
| Situs tampil tapi data lama / kosong | Cache DNS atau browser | Coba tab incognito / `Ctrl+Shift+R`. Cek dari HP (jaringan lain) untuk memastikan bukan cache lokal. DNS baru bisa butuh sampai 24 jam di beberapa ISP, biasanya < 1 jam. |
| Email pemberitahuan tidak sampai ke klien | Resend belum terverifikasi / email masuk spam | Cek log Resend dan `EMAIL_FROM`. Minta klien cek folder spam. Kalau `RESEND_API_KEY` belum diisi, email hanya tercatat di log server. |
