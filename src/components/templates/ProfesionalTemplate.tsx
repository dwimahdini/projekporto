"use client";
// Template Profesional — rapi dan formal, cocok untuk
// melamar kerja kantoran. Dua kolom di desktop:
// kiri = identitas + kontak + skill, kanan = isi CV.
import type { PortfolioData } from "@/lib/types";
import { Reveal, Avatar, ContactLinks, formatDate, formatRange } from "./shared";

export default function ProfesionalTemplate({ data }: { data: PortfolioData }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Kolom kiri */}
          <aside className="h-fit rounded-2xl bg-[#12324f] p-6 text-white lg:sticky lg:top-6">
            <Reveal>
              <Avatar data={data} className="h-24 w-24 rounded-full bg-white/15 text-3xl" />
              <h1 className="mt-5 text-2xl font-bold leading-tight">{data.full_name}</h1>
              {data.headline ? <p className="mt-1 text-sm text-sky-200">{data.headline}</p> : null}
              {data.location ? <p className="mt-2 text-sm text-slate-300">{data.location}</p> : null}

              <h2 className="mt-8 border-b border-white/20 pb-2 text-xs font-bold uppercase tracking-widest text-sky-200">Kontak</h2>
              <ContactLinks data={data} className="mt-3 flex flex-col gap-2 text-sm" />

              {data.skills.length > 0 ? (
                <>
                  <h2 className="mt-8 border-b border-white/20 pb-2 text-xs font-bold uppercase tracking-widest text-sky-200">Keahlian</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {data.skills.map((s, i) => (
                      <li key={i} className="flex justify-between gap-2"><span>{s.name}</span><span className="text-slate-300">{s.level ? `${s.level}/5` : ""}</span></li>
                    ))}
                  </ul>
                </>
              ) : null}

              {data.education.length > 0 ? (
                <>
                  <h2 className="mt-8 border-b border-white/20 pb-2 text-xs font-bold uppercase tracking-widest text-sky-200">Pendidikan</h2>
                  <ul className="mt-3 space-y-3 text-sm">
                    {data.education.map((e, i) => (
                      <li key={i}>
                        <p className="font-semibold">{e.institution}</p>
                        <p className="text-slate-300">{[e.degree, e.field_of_study].filter(Boolean).join(" · ")}{e.gpa ? ` · IPK ${e.gpa}` : ""}</p>
                        <p className="text-xs text-slate-400">{formatRange(e.start_date, e.end_date)}</p>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </Reveal>
          </aside>

          {/* Kolom kanan */}
          <main className="space-y-6">
            {data.bio ? (
              <Reveal>
                <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-lg font-bold text-[#12324f]">Tentang Saya</h2>
                  <p className="mt-3 leading-relaxed text-gray-700">{data.bio}</p>
                </section>
              </Reveal>
            ) : null}

            {data.experiences.length > 0 ? (
              <Reveal>
                <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-lg font-bold text-[#12324f]">Pengalaman Kerja</h2>
                  <div className="mt-5 space-y-6">
                    {data.experiences.map((x, i) => (
                      <div key={i} className="border-l-2 border-[#12324f] pl-4">
                        <div className="flex flex-wrap justify-between gap-2">
                          <h3 className="font-semibold">{x.position}</h3>
                          <span className="text-sm text-gray-500">{formatRange(x.start_date, x.end_date, x.is_current)}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-600">{x.company}</p>
                        {x.description ? <p className="mt-1 text-gray-700">{x.description}</p> : null}
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            ) : null}

            {data.projects.length > 0 ? (
              <Reveal>
                <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-lg font-bold text-[#12324f]">Proyek</h2>
                  <div className="mt-5 space-y-5">
                    {data.projects.map((p, i) => (
                      <div key={i}>
                        <h3 className="font-semibold">{p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-sky-700 underline">{p.title}</a> : p.title}</h3>
                        {p.description ? <p className="mt-1 text-gray-700">{p.description}</p> : null}
                        {p.tech_stack.length > 0 ? <p className="mt-1 text-sm text-gray-500">{p.tech_stack.join(", ")}</p> : null}
                      </div>
                    ))}
                  </div>
                </section>
              </Reveal>
            ) : null}

            {data.certifications.length > 0 ? (
              <Reveal>
                <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-lg font-bold text-[#12324f]">Sertifikasi</h2>
                  <ul className="mt-4 space-y-3">
                    {data.certifications.map((c, i) => (
                      <li key={i}>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-gray-500">{[c.issuer, formatDate(c.issue_date)].filter(Boolean).join(" · ")}{c.credential_id ? ` · ${c.credential_id}` : ""}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            ) : null}

            {data.publications.length > 0 ? (
              <Reveal>
                <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-lg font-bold text-[#12324f]">Publikasi</h2>
                  <ul className="mt-4 space-y-3">
                    {data.publications.map((p, i) => (
                      <li key={i}>
                        <p className="font-medium">{p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="text-sky-700 underline">{p.title}</a> : p.title}</p>
                        <p className="text-sm text-gray-500">{p.publisher ?? ""}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              </Reveal>
            ) : null}

            <Reveal>
              <section className="rounded-2xl bg-[#12324f] p-6 text-white sm:p-8">
                <h2 className="text-lg font-bold">Kontak</h2>
                <p className="mt-2 text-sm text-slate-300">Silakan hubungi saya untuk peluang kerja atau kerja sama.</p>
                <ContactLinks data={data} className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-sky-200" />
              </section>
            </Reveal>
          </main>
        </div>
      </div>
    </div>
  );
}
