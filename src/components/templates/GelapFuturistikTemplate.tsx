"use client";
// Template Gelap Futuristik — tema gelap, efek glow,
// background partikel ringan (CSS saja, tanpa canvas
// berat, tanpa gambar eksternal).
import type { PortfolioData } from "@/lib/types";
import { Reveal, Avatar, ContactLinks, formatDate, formatRange } from "./shared";

function GlowCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-white/[0.04] p-6 shadow-[0_0_40px_rgba(34,211,238,0.08)] backdrop-blur transition hover:border-cyan-400/50 hover:shadow-[0_0_50px_rgba(34,211,238,0.18)]">
      {children}
    </div>
  );
}

export default function GelapFuturistikTemplate({ data }: { data: PortfolioData }) {
  return (
    <div className="min-h-screen bg-[#05070f] text-slate-100 antialiased">
      {/* Partikel ringan: titik-titik CSS, animasi lambat, non-interaktif */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.15),transparent_40%)]" />
        <div className="absolute left-[10%] top-[20%] h-1 w-1 rounded-full bg-cyan-300/70" />
        <div className="absolute left-[70%] top-[15%] h-1.5 w-1.5 rounded-full bg-fuchsia-300/60" />
        <div className="absolute left-[40%] top-[60%] h-1 w-1 rounded-full bg-cyan-200/50" />
        <div className="absolute left-[85%] top-[45%] h-1 w-1 rounded-full bg-white/50" />
      </div>

      <div className="relative">
        {/* Hero */}
        <header className="mx-auto max-w-4xl px-6 pb-16 pt-24 text-center sm:pt-32">
          <Reveal>
            <Avatar data={data} className="mx-auto h-24 w-24 rounded-full bg-cyan-400/20 text-3xl text-cyan-200 ring-2 ring-cyan-400/40" />
            <h1 className="mt-8 bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
              {data.full_name}
            </h1>
            {data.headline ? <p className="mt-4 text-xl text-cyan-200/90">{data.headline}</p> : null}
            {data.location ? <p className="mt-2 text-slate-400">{data.location}</p> : null}
            <ContactLinks data={data} className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-cyan-200" />
          </Reveal>
        </header>

        <main className="mx-auto max-w-4xl space-y-16 px-6 pb-20">
          {data.bio ? (
            <Reveal>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Tentang</h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-300">{data.bio}</p>
              {data.education.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {data.education.map((e, i) => (
                    <GlowCard key={i}>
                      <p className="font-semibold">{e.institution}</p>
                      <p className="text-sm text-slate-400">{[e.degree, e.field_of_study].filter(Boolean).join(" · ")}{e.gpa ? ` · IPK ${e.gpa}` : ""}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatRange(e.start_date, e.end_date)}</p>
                    </GlowCard>
                  ))}
                </div>
              ) : null}
            </Reveal>
          ) : null}

          {data.experiences.length > 0 ? (
            <Reveal>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Pengalaman</h2>
              <div className="mt-6 space-y-4">
                {data.experiences.map((x, i) => (
                  <GlowCard key={i}>
                    <div className="flex flex-wrap justify-between gap-2">
                      <h3 className="font-semibold">{x.position} <span className="text-slate-400">— {x.company}</span></h3>
                      <span className="text-xs text-slate-500">{formatRange(x.start_date, x.end_date, x.is_current)}</span>
                    </div>
                    {x.description ? <p className="mt-2 text-slate-300">{x.description}</p> : null}
                  </GlowCard>
                ))}
              </div>
            </Reveal>
          ) : null}

          {data.projects.length > 0 ? (
            <Reveal>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Proyek</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {data.projects.map((p, i) => (
                  <GlowCard key={i}>
                    <h3 className="font-semibold">{p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-cyan-200 underline underline-offset-4">{p.title}</a> : p.title}</h3>
                    {p.description ? <p className="mt-2 text-sm text-slate-300">{p.description}</p> : null}
                    {p.tech_stack.length > 0 ? <p className="mt-3 text-xs text-fuchsia-300/90">{p.tech_stack.join(" · ")}</p> : null}
                  </GlowCard>
                ))}
              </div>
            </Reveal>
          ) : null}

          {data.skills.length > 0 ? (
            <Reveal>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Skill</h2>
              <div className="mt-6 space-y-3">
                {data.skills.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm"><span>{s.name}</span><span className="text-slate-400">{s.level ? `${s.level}/5` : ""}</span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" style={{ width: `${((s.level ?? 3) / 5) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          ) : null}

          {data.certifications.length > 0 ? (
            <Reveal>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Sertifikasi</h2>
              <ul className="mt-6 space-y-3">
                {data.certifications.map((c, i) => (
                  <li key={i} className="rounded-xl border border-white/10 p-4">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-slate-400">{[c.issuer, formatDate(c.issue_date)].filter(Boolean).join(" · ")}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}

          {data.publications.length > 0 ? (
            <Reveal>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Publikasi</h2>
              <ul className="mt-6 space-y-3">
                {data.publications.map((p, i) => (
                  <li key={i} className="rounded-xl border border-white/10 p-4">
                    <p className="font-medium">{p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-cyan-200 underline">{p.title}</a> : p.title}</p>
                    <p className="text-sm text-slate-400">{p.publisher ?? ""}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          ) : null}
        </main>

        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-4xl px-6 py-14 text-center">
            <Reveal>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Kontak</h2>
              <ContactLinks data={data} className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-cyan-200" />
            </Reveal>
          </div>
        </footer>
      </div>
    </div>
  );
}
