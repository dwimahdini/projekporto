"use client";
// Template Visual — hero foto besar, galeri proyek
// dengan lightbox. Kalau tidak ada foto, hero memakai
// gradasi + inisial (tanpa aset berlisensi).
import { useEffect, useState } from "react";
import type { PortfolioData, PortfolioProject } from "@/lib/types";
import { Reveal, Avatar, ContactLinks, formatDate, formatRange } from "./shared";

function Lightbox({ project, onClose }: { project: PortfolioProject; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 text-gray-900" onClick={(e) => e.stopPropagation()}>
        {project.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.image_url} alt={project.title} className="h-64 w-full rounded-xl object-cover" />
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 text-5xl font-black text-white">
            {project.title.slice(0, 1)}
          </div>
        )}
        <h3 className="mt-4 text-2xl font-bold">{project.title}</h3>
        {project.description ? <p className="mt-2 text-gray-700">{project.description}</p> : null}
        {project.tech_stack.length > 0 ? <p className="mt-3 text-sm text-gray-500">{project.tech_stack.join(" · ")}</p> : null}
        <div className="mt-5 flex gap-2">
          {project.url ? (
            <a href={project.url} target="_blank" rel="noreferrer" className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
              Buka proyek →
            </a>
          ) : null}
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2 text-sm font-semibold">
            Tutup (Esc)
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VisualTemplate({ data }: { data: PortfolioData }) {
  const [lightbox, setLightbox] = useState<PortfolioProject | null>(null);

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Hero foto besar */}
      <header className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-pink-500 to-orange-400 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-6 py-20 sm:flex-row sm:items-end sm:py-28">
          <Reveal>
            <Avatar data={data} className="h-36 w-36 rounded-3xl bg-white/20 text-5xl ring-4 ring-white/60 backdrop-blur" />
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-5xl font-black leading-none sm:text-7xl">{data.full_name}</h1>
            {data.headline ? <p className="mt-3 text-xl font-semibold text-white/90">{data.headline}</p> : null}
            {data.location ? <p className="mt-1 text-white/80">{data.location}</p> : null}
          </Reveal>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-6 py-14">
        {data.bio ? (
          <Reveal>
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">Tentang</h2>
              <p className="mt-4 max-w-3xl text-xl leading-relaxed">{data.bio}</p>
              {data.education.length > 0 ? (
                <div className="mt-6 space-y-2">
                  {data.education.map((e, i) => (
                    <p key={i} className="text-gray-700"><strong>{e.institution}</strong> — {[e.degree, e.field_of_study].filter(Boolean).join(" ")} {e.gpa ? `(IPK ${e.gpa})` : ""} · {formatRange(e.start_date, e.end_date)}</p>
                  ))}
                </div>
              ) : null}
            </section>
          </Reveal>
        ) : null}

        {data.experiences.length > 0 ? (
          <Reveal>
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">Pengalaman</h2>
              <div className="mt-6 space-y-6">
                {data.experiences.map((x, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-gradient-to-b from-violet-500 to-pink-500" />
                    <div>
                      <h3 className="text-lg font-bold">{x.position} <span className="font-normal text-gray-500">— {x.company}</span></h3>
                      <p className="text-sm text-gray-500">{formatRange(x.start_date, x.end_date, x.is_current)}</p>
                      {x.description ? <p className="mt-1 text-gray-700">{x.description}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        {data.projects.length > 0 ? (
          <Reveal>
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">Proyek — klik untuk melihat</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {data.projects.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightbox(p)}
                    className="group overflow-hidden rounded-2xl text-left shadow-sm transition hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.title} loading="lazy" className="h-48 w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-violet-500 via-pink-500 to-orange-400 text-4xl font-black text-white transition duration-300 group-hover:scale-105">
                        {p.title.slice(0, 1)}
                      </div>
                    )}
                    <div className="bg-white p-5">
                      <h3 className="font-bold">{p.title}</h3>
                      {p.description ? <p className="mt-1 line-clamp-2 text-sm text-gray-600">{p.description}</p> : null}
                      {p.tech_stack.length > 0 ? <p className="mt-2 text-xs font-semibold text-pink-600">{p.tech_stack.join(" · ")}</p> : null}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        {data.skills.length > 0 ? (
          <Reveal>
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">Skill</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.skills.map((s, i) => (
                  <div key={i} className="rounded-2xl border p-4">
                    <div className="flex justify-between text-sm font-semibold"><span>{s.name}</span><span className="text-gray-500">{s.level ? `${s.level}/5` : ""}</span></div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-pink-500" style={{ width: `${((s.level ?? 3) / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        {data.certifications.length > 0 ? (
          <Reveal>
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">Sertifikasi</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {data.certifications.map((c, i) => (
                  <div key={i} className="rounded-2xl border p-4">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-gray-500">{[c.issuer, formatDate(c.issue_date)].filter(Boolean).join(" · ")}</p>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        ) : null}

        {data.publications.length > 0 ? (
          <Reveal>
            <section>
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-pink-600">Publikasi</h2>
              <ul className="mt-6 space-y-3">
                {data.publications.map((p, i) => (
                  <li key={i} className="rounded-2xl border p-4">
                    <p className="font-semibold">{p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-pink-600 underline">{p.title}</a> : p.title}</p>
                    <p className="text-sm text-gray-500">{p.publisher ?? ""}</p>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ) : null}
      </main>

      <footer className="bg-gray-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400">Kontak</h2>
            <p className="mt-4 text-2xl font-bold">Mari bekerja sama.</p>
            <ContactLinks data={data} className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-medium text-pink-300" />
          </Reveal>
        </div>
      </footer>

      {lightbox ? <Lightbox project={lightbox} onClose={() => setLightbox(null)} /> : null}
    </div>
  );
}
