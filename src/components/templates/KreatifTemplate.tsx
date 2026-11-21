"use client";
// Template Kreatif — warna-warni, kartu miring saat hover,
// animasi playful (tapi tetap ringan dan sopan).
import type { PortfolioData } from "@/lib/types";
import { Reveal, Avatar, ContactLinks, formatDate, formatRange } from "./shared";

const COLORS = ["bg-yellow-300", "bg-pink-300", "bg-cyan-300", "bg-lime-300", "bg-orange-300"];

export default function KreatifTemplate({ data }: { data: PortfolioData }) {
  return (
    <div className="min-h-screen bg-[#fff7e6] text-gray-900 antialiased">
      {/* Hero */}
      <header className="mx-auto max-w-5xl px-6 pb-14 pt-16 sm:pt-24">
        <Reveal>
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Avatar data={data} className="h-28 w-28 -rotate-3 rounded-[2rem] bg-pink-600 text-4xl text-white shadow-lg ring-4 ring-white" />
            <div>
              <span className="inline-block -rotate-2 rounded-full bg-yellow-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">Halo, saya</span>
              <h1 className="mt-3 text-5xl font-black leading-none sm:text-7xl">{data.full_name}</h1>
              {data.headline ? <p className="mt-3 text-xl font-bold text-pink-600">{data.headline}</p> : null}
              {data.location ? <p className="mt-1 text-gray-600">{data.location}</p> : null}
            </div>
          </div>
          <ContactLinks data={data} className="mt-8 flex flex-wrap gap-2 text-sm font-bold" />
        </Reveal>
      </header>

      <main className="mx-auto max-w-5xl space-y-14 px-6 pb-20">
        {data.bio ? (
          <Reveal>
            <section className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-2xl font-black">Tentang 🎨</h2>
              <p className="mt-3 text-lg leading-relaxed">{data.bio}</p>
              {data.education.length > 0 ? (
                <div className="mt-5 space-y-2">
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
            <h2 className="text-2xl font-black">Pengalaman 🚀</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {data.experiences.map((x, i) => (
                <article key={i} className={`rounded-[1.5rem] p-6 shadow-sm transition duration-300 hover:-rotate-1 hover:scale-[1.02] hover:shadow-lg ${COLORS[i % COLORS.length]}`}>
                  <h3 className="font-black">{x.position}</h3>
                  <p className="text-sm font-semibold">{x.company} · {formatRange(x.start_date, x.end_date, x.is_current)}</p>
                  {x.description ? <p className="mt-2">{x.description}</p> : null}
                </article>
              ))}
            </div>
          </Reveal>
        ) : null}

        {data.projects.length > 0 ? (
          <Reveal>
            <h2 className="text-2xl font-black">Proyek ✨</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {data.projects.map((p, i) => (
                <article key={i} className="rounded-[1.5rem] bg-white p-6 shadow-sm transition duration-300 hover:rotate-1 hover:scale-[1.02] hover:shadow-lg">
                  <h3 className="font-black">{p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-pink-600 underline">{p.title}</a> : p.title}</h3>
                  {p.description ? <p className="mt-2 text-gray-700">{p.description}</p> : null}
                  {p.tech_stack.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {p.tech_stack.map((t) => <span key={t} className="rounded-full bg-yellow-200 px-2 py-1 text-xs font-bold">{t}</span>)}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </Reveal>
        ) : null}

        {data.skills.length > 0 ? (
          <Reveal>
            <h2 className="text-2xl font-black">Skill 💡</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {data.skills.map((s, i) => (
                <span key={i} className={`rounded-full px-4 py-2 text-sm font-bold shadow-sm transition hover:-rotate-3 hover:scale-110 ${COLORS[i % COLORS.length]}`}>{s.name}</span>
              ))}
            </div>
          </Reveal>
        ) : null}

        {data.certifications.length > 0 ? (
          <Reveal>
            <h2 className="text-2xl font-black">Sertifikasi 🏅</h2>
            <ul className="mt-5 space-y-3">
              {data.certifications.map((c, i) => (
                <li key={i} className="rounded-2xl bg-white p-4 shadow-sm">
                  <strong>{c.name}</strong>
                  <span className="block text-sm text-gray-600">{[c.issuer, formatDate(c.issue_date)].filter(Boolean).join(" · ")}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}

        {data.publications.length > 0 ? (
          <Reveal>
            <h2 className="text-2xl font-black">Publikasi 📚</h2>
            <ul className="mt-5 space-y-3">
              {data.publications.map((p, i) => (
                <li key={i} className="rounded-2xl bg-white p-4 shadow-sm">
                  <strong>{p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-pink-600 underline">{p.title}</a> : p.title}</strong>
                  <span className="block text-sm text-gray-600">{p.publisher ?? ""}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}
      </main>

      <footer className="bg-gray-900 px-6 py-14 text-white">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <h2 className="text-2xl font-black">Kontak 👋</h2>
            <ContactLinks data={data} className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-bold text-yellow-300" />
          </Reveal>
        </div>
      </footer>
    </div>
  );
}
