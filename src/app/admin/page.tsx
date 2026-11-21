// Halaman admin — TIDAK ditautkan dari situs publik.
// Diproteksi Supabase Auth + cek role='admin' (lihat RLS).
// Tombol "Tandai domain aktif" (domain_pending -> published)
// dan pemicu email ke klien dikerjakan di Tahap 4.
export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-2 text-gray-600">Login admin + daftar order menyusul di Tahap 4.</p>
    </main>
  );
}
