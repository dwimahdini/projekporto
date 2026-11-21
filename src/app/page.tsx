import CreateOrderForm from "@/components/order/CreateOrderForm";
import { createPublicClient } from "@/lib/supabase/server";

// Jangan di-prerender saat build: daftar template dibaca
// dari Supabase saat request, supaya build tidak gagal
// kalau env belum diisi di mesin build.
export const dynamic = "force-dynamic";

// Landing aplikasi utama (group.portofolio.my.id).
// Form Langkah 1 ada di sini. Demo 5 template menyusul Tahap 3.
export default async function HomePage() {
  let templates: { id: string; name: string; price: number }[] = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("templates").select("id, name, price").eq("is_active", true).order("id");
    templates = (data ?? []).map((t) => ({ id: t.id as string, name: t.name as string, price: t.price as number }));
  } catch {
    templates = [];
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-bold">Website Portofolio Murah</h1>
      <p className="mt-4 text-gray-600">
        Isi biodata, pilih 1 dari 5 template, lihat pratinjau, bayar, lalu
        portofoliomu aktif di subdomain sendiri: namamu.portofolio.my.id
      </p>
      <p className="mt-4 text-sm">
        Sudah pesan tapi kehilangan link? <a className="text-blue-600 underline" href="/cek-pesanan">Cek pesanan saya</a>
      </p>
      {templates.length > 0 ? (
        <CreateOrderForm templates={templates} />
      ) : (
        <p className="mt-8 rounded-xl bg-yellow-50 p-4 text-sm">
          Daftar template belum bisa dimuat (cek koneksi Supabase / jalankan migrasi + seed Tahap 1 dulu).
        </p>
      )}
      <p className="mt-8 text-sm text-gray-500">
        Draft yang tidak dibayar akan dihapus otomatis setelah 14 hari. Data pribadi hanya tampil di portofolio kalau kamu mengaktifkannya.
      </p>
    </main>
  );
}
