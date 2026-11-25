import DotGrid from "@/components/DotGrid";
import { Reveal } from "@/components/templates/shared";
import { createPublicClient } from "@/lib/supabase/server";
import { BUAT_TEMPLATE_IDS } from "@/lib/templates/registry";

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
// diizinkan Genesis), aksen hijau untuk highlight, dan
// galeri template di atas band gelap.
//
// ATURAN FIRST PAINT (pelajaran lama proyek ini): konten
// hero TIDAK memakai animasi .fade-up — judul, subteks,
// dan tombol harus terlihat penuh begitu halaman dicat,
// tanpa menunggu CSS/JS. Animasi hanya untuk seksi di
// bawah lipatan (Reveal).

// Ikon SVG inline per langkah cara kerja — tanpa
// dependensi baru, tanpa emoji.
function StepIcon({ kind }: { kind: "form" | "check" | "layout" | "share" }) {
  const props = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6 text-brand-500",
    "aria-hidden": true,
  };
  if (kind === "form") {
    return (
      <svg {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }
  if (kind === "check") {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" />
      </svg>
    );
  }
  if (kind === "layout") {
    return (
      <svg {...props}>
        <rect x="4" y="4" width="7" height="7" rx="1" />
        <rect x="13" y="4" width="7" height="7" rx="1" />
        <rect x="4" y="13" width="7" height="7" rx="1" />
        <rect x="13" y="13" width="7" height="7" rx="1" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.6l6.8-4.2" />
      <path d="M8.6 13.4l6.8 4.2" />
    </svg>
  );
}

const STEPS = [
  { n: "01", icon: "form" as const, title: "Isi biodata", text: "Nama, pendidikan, pengalaman, proyek, keahlian, dan lainnya. Tanpa daftar, tanpa login." },
  { n: "02", icon: "check" as const, title: "Konfirmasi data", text: "Periksa semua data yang kamu isi sebelum lanjut. Masih bisa diubah kapan saja." },
  { n: "03", icon: "layout" as const, title: "Pilih template", text: "Pilih 1 template yang paling cocok, lalu lihat tampilannya dengan datamu sendiri." },
  { n: "04", icon: "share" as const, title: "Buat portofolio", text: "Lihat pratinjau portofoliomu dan bagikan tautannya ke siapa saja." },
];

const STATS = [
  { value: "3 template", label: "siap pakai" },
  { value: "Gratis", label: "sampai pratinjau" },
  { value: "Tanpa login", label: "tanpa email, tanpa akun" },
];

export default async function HomePage() {
  // Galeri HANYA 3 template alur baru (Logsfolio, Picto,
  // Astrowind) — sama dengan pemilih di /buat. Delapan
  // template lama tetap ada di tabel untuk alur lama
  // (/demo, /s), tapi tidak ditampilkan di sini supaya
  // tidak menyesatkan.
  let templates: { id: string; name: string }[] = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("templates")
      .select("id, name")
      .eq("is_active", true)
      .in("id", BUAT_TEMPLATE_IDS)
      .order("id");
    templates = (data ?? []).map((t) => ({ id: t.id as string, name: t.name as string }));
  } catch {
    templates = [];
  }
  // Jumlah untuk badge hero: pakai hasil DB kalau ada,
  // kalau DB gagal dimuat pakai jumlah daftar (3).
  const templateCount = templates.length > 0 ? templates.length : BUAT_TEMPLATE_IDS.length;

  return (
    <>
      {/* Header sticky: logo kiri, tautan tengah (desktop),
          tombol CTA kanan. Mobile: logo + CTA saja. */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-500 font-mono text-sm font-bold text-white" aria-hidden>
              P
            </span>
            <span className="font-display text-lg font-bold tracking-[-0.03em]">Portofolio Murah</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex" aria-label="Navigasi utama">
            <a href="#cara-kerja" className="text-muted hover:text-ink">
              Cara kerja
            </a>
            <a href="#template" className="text-muted hover:text-ink">
              Template
            </a>
            <a href="/cek-pesanan" className="text-muted hover:text-ink">
              Cek pesanan
            </a>
          </nav>
          <a href="/buat" className="btn-primary inline-flex min-h-[38px] shrink-0 items-center px-4 py-2 text-sm">
            <span className="hidden sm:inline">Buat website portofolio mu sendiri</span>
            <span className="sm:hidden">Buat portofolio</span>
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        {/* Hero dua kolom. Tanpa .fade-up di sini: konten
            hero harus terlihat penuh saat halaman dicat. */}
        <section className="relative overflow-hidden rounded-xl border border-line bg-white">
          {/* DotGrid menutupi SELURUH area hero (absolute
              inset-0). Mask radial melembutkan tepinya
              supaya pola tidak berhenti mendadak. */}
          <DotGrid className="[mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]" />
          <div className="relative grid gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-2 lg:items-center">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">Group.portofolio.my.id</p>
              <h1 className="mt-4 text-5xl leading-[1.05] tracking-[-0.04em] sm:text-6xl">Website Portofolio dari Biodata Kamu</h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                Isi biodata, periksa datanya, pilih template, lalu lihat pratinjau
                portofoliomu dan bagikan tautannya. Gratis sampai pratinjau —
                tanpa daftar, tanpa login.
              </p>
              <div className="mt-6">
                <a href="/buat" className="btn-primary inline-flex min-h-[52px] items-center px-6 py-3 text-base">
                  Buat website portofolio mu sendiri
                </a>
              </div>
              <p className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                {/* SATU-SATUNYA badge jumlah template di halaman
                    ini (aksen hijau = highlight merek Genesis). */}
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 font-medium ring-1 ring-line">
                  <span className="h-2 w-2 rounded-full bg-[#20970B]" aria-hidden />
                  {templateCount} template siap pakai
                </span>
                <a className="font-medium text-brand-500 underline underline-offset-4 hover:text-brand-600" href="/cek-pesanan">
                  Cek pesanan saya
                </a>
              </p>
            </div>

            {/* Visual produk: mockup bingkai browser berisi
                tangkapan template demo + kartu kecil melayang.
                Flat, border 1px — tanpa shadow (Genesis). */}
            <div className="relative min-w-0">
              <div className="card overflow-hidden">
                <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" aria-hidden />
                  <span className="ml-1 min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 font-mono text-xs text-muted ring-1 ring-line">
                    group-portofolio.vercel.app/demo/picto
                  </span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- tangkapan hero demo Picto (800x500), di atas lipatan jadi tidak lazy; next/image tidak menambah nilai di sini. */}
                <img src="/templates/thumbs/picto.jpg" alt="Contoh tampilan template Picto" width={800} height={500} className="aspect-[8/5] w-full object-cover object-top" />
                <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
                  <p className="text-sm font-medium">Picto — contoh tampilan</p>
                  <a href="/demo/picto" className="shrink-0 text-sm font-medium text-brand-500">
                    Lihat demo →
                  </a>
                </div>
              </div>
              {/* Kartu kecil melayang: tanpa shadow, hanya
                  border + latar putih (Genesis melarang shadow
                  pada elemen statis). Posisi -bottom-5 masih
                  di dalam padding section, tidak terpotong. */}
              <div className="card absolute -bottom-5 left-4 px-4 py-3 sm:-left-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className="h-2 w-2 rounded-full bg-[#20970B]" aria-hidden />
                  Gratis sampai pratinjau
                </p>
                <p className="mt-1 text-xs text-muted">Tanpa login, tanpa email</p>
              </div>
            </div>
          </div>
        </section>

        {/* Strip statistik/fitur di bawah hero */}
        <section className="mt-12 grid gap-5 sm:grid-cols-3" aria-label="Keunggulan singkat">
          {STATS.map((s) => (
            <div key={s.value} className="card p-5">
              <p className="text-2xl tracking-[-0.03em]">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
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
        <section id="cara-kerja" className="mt-16">
          <Reveal>
            <h2 className="text-3xl tracking-[-0.03em]">Cara kerja</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="card h-full p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white ring-1 ring-line">
                      <StepIcon kind={s.icon} />
                    </span>
                    <p className="font-mono text-sm font-medium text-brand-500">{s.n}</p>
                  </div>
                  <h3 className="mt-4 text-xl">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Galeri template di atas band gelap supaya
            halaman tidak putih semua. Hanya 3 template
            alur baru — judulnya memuat jumlah yang sama
            dengan badge hero, bukan 11. */}
        {templates.length > 0 ? (
          <section id="template" className="mt-16 rounded-xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-12">
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
    </>
  );
}
