import CreateOrderForm from "@/components/order/CreateOrderForm";
import DotGrid from "@/components/DotGrid";
import { Reveal } from "@/components/templates/shared";
import { createPublicClient } from "@/lib/supabase/server";

// Jangan di-prerender saat build: daftar template dibaca
// dari Supabase saat request, supaya build tidak gagal
// kalau env belum diisi di mesin build.
export const dynamic = "force-dynamic";
// PENTING: force-dynamic SAJA tidak cukup — fetch Supabase
// tetap bisa masuk Data Cache Next.js, dan cache itu di
// Vercel bertahan antar-deploy. Akibatnya template baru
// yang ditambah lewat SQL tidak muncul di landing sampai
// cache kedaluwarsa. revalidate = 0 mematikan cache fetch
// untuk halaman ini, jadi daftar template selalu segar.

// Landing aplikasi utama (group.portofolio.my.id).
// Desain Genesis (docs/GENESIS.md): General Sans untuk judul,
// DM Sans untuk isi, indigo hanya untuk elemen interaktif.
// Supaya tidak monoton: dot grid interaktif di hero (satu-
// satunya dekorasi yang diizinkan Genesis), animasi masuk
// bertahap, aksen hijau untuk highlight, dan galeri template
// di atas band gelap.
const STEPS = [
  { n: "01", title: "Isi biodata", text: "Email, subdomain, dan pilih template. Tanpa daftar, tanpa login." },
  { n: "02", title: "Lihat pratinjau", text: "Lengkapi data, lihat hasilnya langsung berwatermark sebelum bayar." },
  { n: "03", title: "Bayar & aktif", text: "Setelah lunas, admin mengaktifkan situsmu di subdomain sendiri." },
];

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
      {/* Hero dengan dot grid interaktif */}
      <section className="relative overflow-hidden rounded-xl">
        <DotGrid />
        <div className="relative px-2 py-6 sm:px-4 sm:py-10">
          {/* Hero memakai .fade-up (CSS), bukan Reveal: teks harus
              terlihat begitu halaman dicat, tanpa menunggu JS. */}
          <div className="fade-up">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">Group.portofolio.my.id</p>
          </div>
          <div className="fade-up" style={{ animationDelay: "80ms" }}>
            <h1 className="mt-4 max-w-2xl text-5xl leading-[1.05] tracking-[-0.04em] sm:text-6xl">Website Portofolio Murah</h1>
          </div>
          <div className="fade-up" style={{ animationDelay: "160ms" }}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Isi biodata, pilih 1 dari 8 template, lihat pratinjau, bayar, lalu
              portofoliomu aktif di subdomain sendiri: namamu.portofolio.my.id
            </p>
          </div>
          <div className="fade-up" style={{ animationDelay: "240ms" }}>
            <p className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              {/* Aksen hijau: highlight merek di homepage, sesuai Genesis. */}
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-medium ring-1 ring-line">
                <span className="h-2 w-2 rounded-full bg-[#20970B]" aria-hidden />
                8 template siap pakai — Rp49.000
              </span>
              <a className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600" href="/cek-pesanan">
                Sudah pesan tapi kehilangan link? Cek pesanan saya
              </a>
            </p>
          </div>
        </div>
      </section>

      {templates.length > 0 ? (
        <>
          <div className="fade-up" style={{ animationDelay: "100ms" }}>
            <CreateOrderForm templates={templates} />
          </div>

          {/* Cara kerja — tiga langkah singkat */}
          <section className="mt-16">
            <Reveal>
              <h2 className="text-3xl tracking-[-0.03em]">Cara kerja</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 0.08}>
                  <div className="card h-full p-5">
                    <p className="font-mono text-sm font-medium text-brand-500">{s.n}</p>
                    <h3 className="mt-2 text-xl">{s.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* Galeri template di atas band gelap supaya
              halaman tidak putih semua. */}
          <section className="mt-16 rounded-xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-12">
            <Reveal>
              <h2 className="text-3xl tracking-[-0.03em] text-white">Delapan template, satu harga</h2>
              <p className="mt-2 text-[15px] text-white/70">Klik untuk melihat demo langsung dengan data contoh.</p>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.06}>
                  {/* text-ink wajib: section ini text-white,
                      tanpa ini nama template ikut putih dan
                      hilang di atas kartu putih. Thumbnail
                      adalah tangkapan hero demo (800x500,
                      public/templates/thumbs/) — render ulang
                      dengan skrip /tmp/gen-thumbs.cjs kalau
                      tampilan demo berubah. */}
                  <a href={`/demo/${t.id}`} className="card card-hover block h-full overflow-hidden text-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail statis 800x500 yang sudah dioptimasi (13-28 KB), lazy-loaded; next/image tidak menambah nilai di sini. */}
                    <img src={`/templates/thumbs/${t.id}.jpg`} alt={`Pratinjau template ${t.name}`} width={800} height={500} loading="lazy" className="aspect-[8/5] w-full object-cover object-top" />
                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-faint">Template</p>
                      <h3 className="mt-2 text-2xl">{t.name}</h3>
                      <p className="mt-3 flex items-baseline justify-between text-sm">
                        <span className="font-medium text-ink">Rp{t.price.toLocaleString("id-ID")}</span>
                        <span className="font-medium text-brand-500">Lihat demo →</span>
                      </p>
                    </div>
                  </a>
                </Reveal>
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
