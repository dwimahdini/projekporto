import DotGrid from "@/components/DotGrid";
import HeroPreview from "@/components/HeroPreview";
import HowItWorks from "@/components/HowItWorks";
import { Reveal, CountUp } from "@/components/templates/shared";
import { createPublicClient } from "@/lib/supabase/server";
import { BUAT_TEMPLATE_IDS, BUAT_TEMPLATE_LIST } from "@/lib/templates/registry";

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

// ATURAN FIRST PAINT (pelajaran lama proyek ini): konten
// hero TIDAK memakai animasi .fade-up maupun .reveal — judul,
// subteks, dan tombol harus terlihat penuh begitu halaman
// dicat, tanpa menunggu CSS/JS. Animasi hero hanya keyframes
// CSS murni (.animate-float) yang mulai dari keadaan terlihat.
// Reveal (scroll) hanya untuk seksi di bawah lipatan.

const STATS: ({ num: number; suffix: string; label: string } | { text: string; label: string })[] = [
  { num: 3, suffix: " template", label: "siap pakai" },
  { text: "Gratis", label: "sampai pratinjau" },
  { text: "Tanpa login", label: "tanpa email, tanpa akun" },
];

export default async function HomePage() {
  // Galeri HANYA 3 template alur baru (Logsfolio, Picto,
  // Astrowind) — sama dengan pemilih di /buat. Delapan
  // template lama tetap ada di tabel untuk alur lama
  // (/demo, /s), tapi tidak ditampilkan di sini supaya
  // tidak menyesatkan.
  let templates: { id: string; name: string; description: string }[] = [];
  try {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("templates")
      .select("id, name")
      .eq("is_active", true)
      .in("id", BUAT_TEMPLATE_IDS)
      .order("id");
    templates = (data ?? []).map((t) => {
      const id = t.id as string;
      const meta = BUAT_TEMPLATE_LIST.find((m) => m.id === id);
      return { id, name: t.name as string, description: meta?.description ?? "" };
    });
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

            {/* Visual produk: mockup bingkai browser yang
                BEROTASI otomatis di antara 3 template, dengan
                animasi mengambang lembut (HeroPreview). */}
            <HeroPreview />
          </div>
        </section>

        {/* Strip statistik/fitur di bawah hero — angka
            pertama menghitung naik (CountUp) saat terlihat. */}
        <section className="mt-12 grid gap-5 sm:grid-cols-3" aria-label="Keunggulan singkat">
          {STATS.map((s) => (
            <Reveal key={s.label}>
              <div className="card anim-lift h-full p-5">
                <p className="text-2xl tracking-[-0.03em]">
                  {"num" in s ? <CountUp value={s.num} suffix={s.suffix} /> : s.text}
                </p>
                <p className="mt-1 text-sm text-muted">{s.label}</p>
              </div>
            </Reveal>
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

        {/* Cara kerja — stepper interaktif: klik langkah
            untuk melihat detailnya, garis progres terisi
            mengikuti langkah aktif (HowItWorks). */}
        <section id="cara-kerja" className="mt-16 scroll-mt-20">
          <Reveal>
            <h2 className="text-3xl tracking-[-0.03em]">Cara kerja</h2>
            <p className="mt-2 text-[15px] text-muted">Klik tiap langkah untuk melihat detailnya.</p>
          </Reveal>
          <div className="mt-8">
            <HowItWorks />
          </div>
        </section>

        {/* Galeri template di atas band gelap supaya
            halaman tidak putih semua. Hanya 3 template
            alur baru — judulnya memuat jumlah yang sama
            dengan badge hero, bukan 11. */}
        {templates.length > 0 ? (
          <section id="template" className="mt-16 scroll-mt-20 rounded-xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-12">
            <Reveal>
              <h2 className="text-3xl tracking-[-0.03em] text-white">{templates.length} template siap pakai</h2>
              <p className="mt-2 text-[15px] text-white/70">Klik untuk melihat demo langsung dengan data contoh.</p>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.06}>
                  {/* Kartu galeri interaktif: thumbnail membesar
                      saat hover + overlay gelap dengan tombol
                      "Lihat demo" yang muncul. Deskripsi karakter
                      tiap template ditampilkan supaya galeri tidak
                      terasa seperti 3 kartu yang sama. */}
                  <a href={`/demo/${t.id}`} className="card card-hover group block h-full overflow-hidden text-ink">
                    <span className="relative block overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail statis 800x500 yang sudah dioptimasi (13-28 KB), lazy-loaded; next/image tidak menambah nilai di sini. */}
                      <img src={`/templates/thumbs/${t.id}.jpg`} alt={`Pratinjau template ${t.name}`} width={800} height={500} loading="lazy" className="aspect-[8/5] w-full object-cover object-top transition duration-500 group-hover:scale-105" />
                      <span className="absolute inset-0 flex items-end justify-center bg-ink/0 pb-5 opacity-0 transition duration-300 group-hover:bg-ink/45 group-hover:opacity-100">
                        <span className="rounded-md bg-white px-4 py-2 text-sm font-medium text-ink shadow-lg">Lihat demo →</span>
                      </span>
                    </span>
                    <div className="p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-faint">Template</p>
                      <h3 className="mt-2 text-2xl">{t.name}</h3>
                      {t.description ? <p className="mt-2 text-[15px] leading-relaxed text-muted">{t.description}</p> : null}
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

        {/* Ajakan akhir — panel indigo solid (bukan teks
            polos di atas putih) supaya halaman punya penutup
            yang tegas; tombolnya putih di atas indigo. */}
        <section className="mt-16 rounded-xl bg-brand-500 px-6 py-12 text-center text-white sm:px-10">
          <Reveal>
            <h2 className="text-3xl tracking-[-0.03em] text-white">Siap punya portofolio sendiri?</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">
              Mulai dari biodata — sisanya tinggal ikuti langkahnya sampai
              portofoliomu bisa dibagikan.
            </p>
            <a href="/buat" className="mt-6 inline-flex min-h-[52px] items-center rounded-md bg-white px-6 py-3 text-base font-medium text-brand-600 transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
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
