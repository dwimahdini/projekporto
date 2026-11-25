"use client";
// Pratinjau template di hero yang BEROTASI otomatis di antara
// 3 template alur baru — supaya pengunjung langsung melihat
// ketiganya tanpa scroll. Tanpa library baru: rotasi pakai
// setInterval + crossfade opacity CSS, jeda saat kursor di
// atas mockup, dan titik-titik kecil untuk memilih manual
// (klik titik mengatur ulang timer). Gambar pertama tetap
// ter-render di server (tanpa JS pun mockup menampilkan
// Picto), rotasi hanya jalan kalau JS aktif.
//
// Kartu "Gratis sampai pratinjau" sengaja ditaruh DI BAWAH
// mockup (bukan menumpuk di atasnya) supaya tidak menutupi
// bar nama template / tautan "Lihat demo" — di layar kecil
// kartu yang menumpuk menutupi teks bar bawah mockup.
import { useEffect, useRef, useState } from "react";

const SLIDES = [
  { id: "picto", name: "Picto" },
  { id: "logsfolio", name: "Logsfolio" },
  { id: "astrowind", name: "Astrowind" },
];

export default function HeroPreview() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => {
      setActive((a) => (a + 1) % SLIDES.length);
    }, 4500);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, active]);

  const current = SLIDES[active];

  return (
    <div
      className="relative min-w-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Mockup mengambang lembut (keyframes CSS murni). */}
      <div className="card animate-float overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line bg-paper px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" aria-hidden />
          <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" aria-hidden />
          <span className="ml-1 min-w-0 flex-1 truncate rounded-md bg-white px-3 py-1 font-mono text-xs text-muted ring-1 ring-line">
            group-portofolio.vercel.app/demo/{current.id}
          </span>
        </div>
        {/* Tiga thumbnail ditumpuk; yang aktif opacity 1,
            sisanya 0 — crossfade 700ms. Gambar pertama juga
            dirender tanpa JS (Picto). */}
        <div className="relative aspect-[8/5] w-full overflow-hidden bg-white">
          {SLIDES.map((s, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- thumbnail statis 800x500 yang sudah dioptimasi; next/image tidak menambah nilai di sini.
            <img
              key={s.id}
              src={`/templates/thumbs/${s.id}.jpg`}
              alt={`Contoh tampilan template ${s.name}`}
              width={800}
              height={500}
              className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-700 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== active}
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-sm font-medium">{current.name} — contoh tampilan</p>
          <a href={`/demo/${current.id}`} className="shrink-0 text-sm font-medium text-brand-500 hover:text-brand-600">
            Lihat demo →
          </a>
        </div>
      </div>

      {/* Baris bawah mockup: kartu kecil (mengambang dengan
          jeda berbeda supaya tidak serempak dengan mockup)
          di kiri, titik pemilih template di kanan. */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="card animate-float px-4 py-3" style={{ animationDelay: "1.2s", animationDuration: "7s" }}>
          <p className="flex items-center gap-2 text-sm font-medium">
            <span className="h-2 w-2 rounded-full bg-[#20970B]" aria-hidden />
            Gratis sampai pratinjau
          </p>
          <p className="mt-1 text-xs text-muted">Tanpa login, tanpa email</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pb-2" role="tablist" aria-label="Pilih contoh template">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Tampilkan contoh template ${s.name}`}
              onClick={() => setActive(i)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === active ? "w-8 bg-brand-500" : "w-2.5 bg-line hover:bg-faint"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
