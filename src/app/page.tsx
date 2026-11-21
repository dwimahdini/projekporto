import CreateOrderForm from "@/components/order/CreateOrderForm";
import { createPublicClient } from "@/lib/supabase/server";

// Jangan di-prerender saat build: daftar template dibaca
// dari Supabase saat request, supaya build tidak gagal
// kalau env belum diisi di mesin build.
export const dynamic = "force-dynamic";

// Landing aplikasi utama (group.portofolio.my.id).
// Desain Genesis (docs/GENESIS.md): General Sans untuk judul,
// DM Sans untuk isi, indigo hanya untuk elemen interaktif.
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
    <main className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">Group.portofolio.my.id</p>
      <h1 className="mt-4 max-w-2xl text-5xl leading-[1.05] tracking-[-0.04em] sm:text-6xl">Website Portofolio Murah</h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
        Isi biodata, pilih 1 dari 5 template, lihat pratinjau, bayar, lalu
        portofoliomu aktif di subdomain sendiri: namamu.portofolio.my.id
      </p>
      <p className="mt-4 text-sm text-muted">
        Sudah pesan tapi kehilangan link? <a className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600" href="/cek-pesanan">Cek pesanan saya</a>
      </p>

      {templates.length > 0 ? (
        <>
          <CreateOrderForm templates={templates} />
          <section className="mt-16">
            <h2 className="text-3xl tracking-[-0.03em]">Lima template, satu harga</h2>
            <p className="mt-2 text-[15px] text-muted">Klik untuk melihat demo langsung dengan data contoh.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <a key={t.id} href={`/demo/${t.id}`} className="card card-hover block p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-faint">Template</p>
                  <h3 className="mt-2 text-2xl">{t.name}</h3>
                  <p className="mt-3 flex items-baseline justify-between text-sm">
                    <span className="font-medium text-ink">Rp{t.price.toLocaleString("id-ID")}</span>
                    <span className="font-medium text-brand-500">Lihat demo →</span>
                  </p>
                </a>
              ))}
            </div>
          </section>
        </>
      ) : (
        <p className="mt-8 rounded-xl bg-yellow-50 p-4 text-sm">
          Daftar template belum bisa dimuat (cek koneksi Supabase / jalankan migrasi + seed Tahap 1 dulu).
        </p>
      )}
      <p className="mt-16 text-sm text-muted">
        Draft yang tidak dibayar akan dihapus otomatis setelah 14 hari. Data pribadi hanya tampil di portofolio kalau kamu mengaktifkannya.
      </p>
    </main>
  );
}
