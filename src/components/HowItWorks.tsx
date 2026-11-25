"use client";
// "Cara kerja" sebagai stepper interaktif: langkah yang aktif
// menonjol (ring indigo + ikon terisi), garis progres di atas
// terisi mengikuti langkah aktif, dan panel detail di bawah
// menampilkan langkah yang dipilih lengkap dengan tombol
// Sebelumnya/Berikutnya. Kartu berupa <button> asli supaya
// bisa dipakai keyboard dan pembaca layar (aria-pressed).
import { useState } from "react";

// Ikon SVG inline per langkah — tanpa dependensi baru,
// tanpa emoji.
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
    className: "h-6 w-6",
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

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  const progress = ((active + 1) / STEPS.length) * 100;

  return (
    <div>
      {/* Garis progres: terisi sesuai langkah aktif. */}
      <div className="h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={active + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="Progres langkah cara kerja">
        <div className="h-full rounded-full bg-brand-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.n}
              type="button"
              onClick={() => setActive(i)}
              aria-pressed={isActive}
              className={`card group p-5 text-left transition duration-200 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.10)] ${
                isActive ? "-translate-y-1 shadow-[0_12px_28px_rgba(0,0,0,0.10)] ring-2 ring-brand-500" : ""
              }`}
            >
              <span className="flex items-center justify-between">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-lg ring-1 transition duration-200 ${
                    isActive ? "bg-brand-500 text-white ring-brand-500" : "bg-white text-brand-500 ring-line group-hover:bg-brand-500 group-hover:text-white group-hover:ring-brand-500"
                  }`}
                >
                  <StepIcon kind={s.icon} />
                </span>
                <span className={`font-mono text-sm font-medium ${isActive ? "text-brand-500" : "text-faint"}`}>{s.n}</span>
              </span>
              <span className="mt-4 block text-xl font-bold tracking-[-0.03em]">{s.title}</span>
              <span className="mt-2 block text-[15px] leading-relaxed text-muted">{s.text}</span>
            </button>
          );
        })}
      </div>

      {/* Panel detail langkah aktif + navigasi. */}
      <div className="card mt-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
        <p className="text-[15px] leading-relaxed">
          <span className="font-medium text-brand-500">Langkah {step.n} dari 04 — {step.title}:</span>{" "}
          <span className="text-muted">{step.text}</span>
        </p>
        <span className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setActive((a) => Math.max(0, a - 1))}
            disabled={active === 0}
            className="rounded-md px-4 py-2 text-sm font-medium ring-1 ring-line transition hover:bg-paper disabled:opacity-40"
          >
            ← Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => setActive((a) => Math.min(STEPS.length - 1, a + 1))}
            disabled={active === STEPS.length - 1}
            className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-40"
          >
            Berikutnya →
          </button>
        </span>
      </div>
    </div>
  );
}
