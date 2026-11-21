// Kebijakan Privasi — DRAF (UU PDP No. 27 Tahun 2022).
// Draf ini perlu ditinjau penasihat hukum sebelum dipakai
// sungguhan. Kontak diambil dari env, bukan hardcode.
export default function KebijakanPrivasiPage() {
  const contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? process.env.EMAIL_FROM ?? "admin@group.portofolio.my.id";
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <p className="rounded-xl border-2 border-yellow-500 bg-yellow-50 p-3 text-sm font-bold">
        Draf, perlu ditinjau ulang sebelum dipakai sungguhan.
      </p>
      <h1 className="mt-6 text-2xl font-bold">Kebijakan Privasi</h1>
      <p className="mt-2 text-sm text-gray-500">Terakhir diperbarui: 21 November 2026. Draf sesuai Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).</p>

      <h2 className="mt-8 text-lg font-bold">1. Data apa yang dikumpulkan</h2>
      <p className="mt-2 text-gray-700">Data yang kamu isi di form pesanan: nama lengkap, email, nomor HP, WhatsApp, tanggal lahir, jenis kelamin, kewarganegaraan, alamat lengkap, pendidikan, pengalaman kerja, proyek, skill, sertifikasi, publikasi, tautan, foto, dan preferensi tampil. Kami juga mencatat data teknis yang diperlukan untuk layanan: alamat IP, status pesanan, dan riwayat pembayaran (ID pesanan, nominal, tanggal, status).</p>

      <h2 className="mt-8 text-lg font-bold">2. Tujuan dan dasar persetujuan</h2>
      <p className="mt-2 text-gray-700">Data dipakai hanya untuk membuat, mengaktifkan, dan memelihara portofolio kamu, memproses pembayaran, dan menghubungimu soal pesanan. Dasar pemrosesan adalah persetujuanmu lewat checkbox persetujuan di form (wajib dicentang sebelum order dibuat) dan pelaksanaan kontrak jasa pembuatan portofolio. Kamu bisa menarik persetujuan dengan meminta penghapusan data (lihat bagian 6).</p>

      <h2 className="mt-8 text-lg font-bold">3. Siapa yang dapat mengakses</h2>
      <p className="mt-2 text-gray-700">Hanya kamu (lewat link pesanan rahasia) dan admin (login Supabase Auth, role admin). Data pribadi di panel admin disembunyikan secara default dan hanya tampil setelah admin menekan &quot;Tampilkan&quot; — setiap penayangan dicatat di audit log. Data yang tampil di portofolio publik hanya field yang kamu aktifkan toggle &quot;Tampilkan di portofolio&quot;-nya; email, nomor HP, dan WhatsApp defaultnya sembunyi, dan alamat tidak pernah tampil di situs publik.</p>

      <h2 className="mt-8 text-lg font-bold">4. Pihak ketiga yang dipakai</h2>
      <p className="mt-2 text-gray-700">Supabase (database dan penyimpanan file), Vercel (hosting aplikasi), Cloudflare (DNS dan Turnstile anti-bot), layanan email transaksional (Resend), dan penyedia pembayaran (Midtrans, saat sudah diintegrasikan). Pihak ketiga ini hanya menerima data yang diperlukan untuk fungsinya masing-masing.</p>

      <h2 className="mt-8 text-lg font-bold">5. Lama penyimpanan</h2>
      <p className="mt-2 text-gray-700">Draft yang tidak dibayar dihapus otomatis setelah 14 hari, beserta file upload-nya. Pesanan yang sudah dibayar disimpan selama situs aktif dan 1 tahun setelahnya untuk keperluan layanan. Setelah kamu meminta penghapusan, data pribadi dan konten dihapus; catatan transaksi minimal (ID pesanan, nominal, tanggal, status) boleh disimpan untuk pembukuan.</p>

      <h2 className="mt-8 text-lg font-bold">6. Hak klien</h2>
      <p className="mt-2 text-gray-700">Kamu berhak mengakses (unduh data sebagai JSON dari halaman pesanan, setelah verifikasi OTP email), mengoreksi (edit dari halaman pesanan; perubahan data pribadi meminta OTP), menghapus (tombol &quot;Hapus data saya&quot;, dikonfirmasi lewat link email), dan menarik persetujuan. Permintaan akan diproses paling lambat 3x24 jam setelah konfirmasi.</p>

      <h2 className="mt-8 text-lg font-bold">7. Kontak</h2>
      <p className="mt-2 text-gray-700">Pertanyaan soal data pribadi: {contact}.</p>
    </main>
  );
}
