// Halaman bayar — fallback kalau provider aktif belum
// tersedia (misalnya PAYMENT_PROVIDER=midtrans tapi
// Midtrans belum diintegrasikan). Pesan rapi, bukan error
// mentah. Alur normal: mock -> /bayar-simulasi,
// Midtrans (nanti) -> popup Snap.
export default function BayarPage({ params }: { params: { token: string } }) {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-2xl font-bold">Pembayaran belum tersedia</h1>
      <p className="mt-4 text-gray-700">
        Maaf, pembayaran untuk pesanan ini belum bisa dilanjutkan saat ini. Provider pembayaran yang dipilih belum diaktifkan. Silakan kembali ke halaman status pesanan dan coba lagi nanti, atau hubungi admin.
      </p>
      <div className="mt-6 flex flex-col gap-2">
        <a href={`/pesanan/${params.token}/status`} className="min-h-[52px] btn-primary px-4 py-3 text-center font-semibold text-white">
          Lihat status pesanan
        </a>
        <a href={`/pesanan/${params.token}`} className="min-h-[52px] rounded-md border px-4 py-3 text-center font-medium">
          ← Kembali ke pesanan
        </a>
      </div>
    </main>
  );
}
