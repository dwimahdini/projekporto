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

// Landing aplikasi utama (group.portofolio.my.id), kini
// menjadi dashboard alur baru: isi biodata, konfirmasi,
// pilih template, lalu buat portofolio — pratinjau +
// tautan berbagi. Gratis sampai pratinjau, tanpa daftar,
// tanpa login. Desain Genesis (docs/GENESIS.md): General
// Sans untuk judul, DM Sans untuk isi, indigo hanya untuk
// elemen interaktif. Supaya tidak monoton: dot grid
// interaktif di hero (satu-satunya dekorasi yang
// diizinkan Genesis), animasi masuk bertahap, aksen hijau
// untuk highlight, dan galeri template di atas band gelap.
const STEPS = [
  { n: "01", title: "Isi biodata", text: "Nama, pendidikan, pengalaman, proyek, keahlian, dan lainnya. Tanpa daftar, tanpa login." },
  { n: "02", title: "Konfirmasi data", text: "Periksa semua data yang kamu isi sebelum lanjut. Masih bisa diubah kapan saja." },
  { n: "03", title: "Pilih template", text: "Pilih 1 template yang paling cocok, lalu lihat tampilannya dengan datamu sendiri." },
  { n: "04", title: "Buat portofolio", text: "Lihat pratinjau portofoliomu dan bagikan tautannya ke siapa saja." },
];

export default async function HomePage() {
  let templates: { id: string; name: string }[] = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase.from("templates").select("id, name").eq("is_active", true).order("id");
    templates = (data ?? []).map((t) => ({ id: t.id as string, name: t.name as string }));
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
            <h1 className="mt-4 max-w-2xl text-5xl leading-[1.05] tracking-[-0.04em] sm:text-6xl">Website Portofolio dari Biodata Kamu</h1>
          </div>
          <div className="fade-up" style={{ animationDelay: "160ms" }}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Isi biodata, periksa datanya, pilih template, lalu lihat pratinjau
              portofoliomu dan bagikan tautannya. Gratis sampai pratinjau —
              tanpa daftar, tanpa login.
            </p>
          </div>
          <div className="fade-up" style={{ animationDelay: "240ms" }}>
            <a href="/buat" className="btn-primary mt-6 inline-flex min-h-[52px] items-center px-6 py-3 text-base">
              Buat website portofolio mu sendiri
            </a>
          </div>
          <div className="fade-up" style={{ animationDelay: "320ms" }}>
            <p className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              {/* Aksen hijau: highlight merek di homepage, sesuai Genesis. */}
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-medium ring-1 ring-line">
                <span className="h-2 w-2 rounded-full bg-[#20970B]" aria-hidden />
                {templates.length > 0 ? `${templates.length} template siap pakai` : "Template siap pakai"}
              </span>
              <a className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600" href="/cek-pesanan">
                Cek pesanan saya
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Penjelasan singkat tentang layanan */}
      <section className="mt-16">
        <Reveal>
          <h2 className="text-3xl tracking-[-0.03em]">Tentang layanan ini</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Website ini membantumu membuat website portofolio sendiri dari
            biodata yang kamu isi: pendidikan, pengalaman kerja, proyek,
            keahlian, sertifikasi, pencapaian, dan bahasa. Data yang kamu isi
            tersimpan di browser kamu sendiri sampai portofolio dibuat — tidak
            ada akun, tidak ada email yang perlu dikirim.
          </p>
        </Reveal>
      </section>

      {/* Cara kerja — empat langkah alur baru */}
      <section className="mt-16">
        <Reveal>
          <h2 className="text-3xl tracking-[-0.03em]">Cara kerja</h2>
        </Reveal>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      {templates.length > 0 ? (
        <section className="mt-16 rounded-xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-12">
          <Reveal>
            <h2 className="text-3xl tracking-[-0.03em] text-white">{templates.length} template siap pakai</h2>
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
                    <p className="mt-3 text-sm">
                      <span className="font-medium text-brand-500">Lihat demo →</span>
                    </p>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </section>
      ) : (
        <p className="mt-8 rounded-xl bg-yellow-50 p-4 text-sm">
          Daftar template belum bisa dimuat (cek koneksi Supabase / jalankan migrasi + seed Tahap 1 dulu).
        </p>
      )}

      {/* Ajakan akhir — satu tombol primary di seksi ini */}
      <section className="mt-16 text-center">
        <Reveal>
          <h2 className="text-3xl tracking-[-0.03em]">Siap punya portofolio sendiri?</h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted">
            Mulai dari biodata — sisanya tinggal ikuti langkahnya sampai
            portofoliomu bisa dibagikan.
          </p>
          <a href="/buat" className="btn-primary mt-6 inline-flex min-h-[52px] items-center px-6 py-3 text-base">
            Buat website portofolio mu sendiri
          </a>
        </Reveal>
      </section>

      <p className="mt-16 text-sm text-muted">
        Data yang kamu isi tersimpan di browser kamu sendiri sampai portofolio dibuat. Data pribadi hanya tampil di portofolio kalau kamu mengisinya.
      </p>
    </main>
  );
}
