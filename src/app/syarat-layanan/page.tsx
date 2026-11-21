// Syarat Layanan — DRAF.
// Draf ini perlu ditinjau penasihat hukum sebelum dipakai
// sungguhan.
export default function SyaratLayananPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <p className="rounded-md border-2 border-yellow-500 bg-yellow-50 p-3 text-sm font-bold">
        Draf, perlu ditinjau ulang sebelum dipakai sungguhan.
      </p>
      <h1 className="mt-6 text-2xl font-bold">Syarat Layanan</h1>
      <p className="mt-2 text-sm text-muted">Terakhir diperbarui: 21 November 2026.</p>

      <h2 className="mt-8 text-lg font-bold">1. Ruang lingkup paket</h2>
      <p className="mt-2 text-gray-700">Paket mencakup pembuatan satu website portofolio di subdomain pilihanmu ({`{subdomain}`}.portofolio.my.id) dengan 1 dari 5 template yang tersedia, berdasarkan data yang kamu isi di form. Harga yang berlaku adalah harga yang tercatat di server saat order dibuat.</p>

      <h2 className="mt-8 text-lg font-bold">2. Revisi</h2>
      <p className="mt-2 text-gray-700">Kamu bisa mengubah data dan mengganti template sendiri dari halaman pesanan dan pratinjau sebelum dan sesudah pembayaran, selama situs masih aktif. Perubahan data tampil di situs published setelah disimpan.</p>

      <h2 className="mt-8 text-lg font-bold">3. Durasi aktif situs dan domain</h2>
      <p className="mt-2 text-gray-700">Situs aktif selama 1 tahun sejak tanggal aktivasi oleh admin. Perpanjangan dilakukan sebelum masa aktif berakhir; kami mengingatkan lewat email. Kalau tidak diperpanjang, situs dinonaktifkan dan data dihapus sesuai Kebijakan Privasi.</p>

      <h2 className="mt-8 text-lg font-bold">4. Kebijakan refund</h2>
      <p className="mt-2 text-gray-700">Refund penuh diberikan kalau situs tidak pernah aktif karena kesalahan kami. Setelah situs aktif dan bisa dibuka, pembayaran tidak dapat dikembalikan, kecuali ada cacat layanan yang tidak bisa kami perbaiki dalam 7 hari kerja setelah dilaporkan. Permintaan refund diajukan lewat kontak di Kebijakan Privasi.</p>

      <h2 className="mt-8 text-lg font-bold">5. Tanggung jawab klien atas konten</h2>
      <p className="mt-2 text-gray-700">Kamu bertanggung jawab penuh atas konten yang kamu unggah (teks, foto, dan tautan): konten harus milikmu atau kamu punya izin menggunakannya, tidak melanggar hukum, dan tidak merugikan pihak lain. Kami tidak memeriksa isi setiap portofolio sebelum aktif, tapi berhak menonaktifkan situs yang terbukti melanggar.</p>

      <h2 className="mt-8 text-lg font-bold">6. Hak menonaktifkan situs</h2>
      <p className="mt-2 text-gray-700">Kami berhak menonaktifkan situs yang melanggar hukum, mengandung konten yang dilarang (misalnya penipuan, pornografi anak, atau ujaran kebencian), atau dipakai untuk aktivitas yang merugikan layanan. Penonaktifan diberitahukan lewat email, kecuali dilarang oleh hukum yang berlaku.</p>
    </main>
  );
}
