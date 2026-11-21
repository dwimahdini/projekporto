"use client";
// Template Minimalis — putih bersih, tipografi besar,
// banyak ruang kosong. Font: tumpukan sistem (gratis,
// tanpa unduhan) supaya performa tetap tinggi.
import type { PortfolioData } from "@/lib/types";
import { Reveal, Avatar, ContactLinks, formatDate, formatRange } from "./shared";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-14">
      <Reveal>
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">{title}</h2>
        <div className="mt-6">{children}</div>
      </Reveal>
    </section>
  );
}

export default function MinimalisTemplate({ data }: { data: PortfolioData }) {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* Hero */}
      <header className="mx-auto max-w-3xl px-6 pb-16 pt-24 sm:pt-32">
        <Reveal>
          <Avatar data={data} className="h-20 w-20 rounded-full bg-gray-100 text-2xl text-gray-700" />
          <h1 className="mt-8 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">{data.full_name}</h1>
          {data.headline ? <p className="mt-4 text-xl text-gray-500 sm:text-2xl">{data.headline}</p> : null}
          {data.location ? <p className="mt-3 text-gray-500">{data.location}</p> : null}
          <ContactLinks data={data} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium" />
        </Reveal>
      </header>

      {/* Tentang */}
      {data.bio ? (
        <Section title="Tentang">
          <p className="text-lg leading-relaxed text-gray-700 sm:text-xl">{data.bio}</p>
          {data.education.length > 0 ? (
            <div className="mt-8 space-y-4">
              {data.education.map((e, i) => (
                <div key={i} className="border-t pt-4">
                  <p className="font-semibold">{e.institution}</p>
                  <p className="text-gray-500">
                    {[e.degree, e.field_of_study].filter(Boolean).join(" · ")}
                    {e.gpa ? ` · IPK ${e.gpa}` : ""}
                  </p>
                  <p className="text-sm text-gray-400">{formatRange(e.start_date, e.end_date)}</p>
                  {e.description ? <p className="mt-1 text-gray-600">{e.description}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}

      {/* Pengalaman */}
      {data.experiences.length > 0 ? (
        <Section title="Pengalaman">
          <div className="space-y-8">
            {data.experiences.map((x, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold">{x.position}</h3>
                  <span className="text-sm text-gray-400">{formatRange(x.start_date, x.end_date, x.is_current)}</span>
                </div>
                <p className="text-gray-500">{x.company}</p>
                {x.description ? <p className="mt-2 leading-relaxed text-gray-700">{x.description}</p> : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Proyek */}
      {data.projects.length > 0 ? (
        <Section title="Proyek">
          <div className="space-y-8">
            {data.projects.map((p, i) => (
              <div key={i} className="border-t pt-6">
                <h3 className="text-lg font-semibold">
                  {p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">{p.title}</a> : p.title}
                </h3>
                {p.description ? <p className="mt-2 leading-relaxed text-gray-700">{p.description}</p> : null}
                {p.tech_stack.length > 0 ? <p className="mt-3 text-sm text-gray-400">{p.tech_stack.join(" · ")}</p> : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Skill */}
      {data.skills.length > 0 ? (
        <Section title="Skill">
          <ul className="flex flex-wrap gap-2">
            {data.skills.map((s, i) => (
              <li key={i} className="rounded-full border px-4 py-2 text-sm">
                {s.name}
                {s.level ? <span className="ml-2 text-gray-400">{"●".repeat(s.level)}{"○".repeat(5 - s.level)}</span> : null}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Sertifikasi */}
      {data.certifications.length > 0 ? (
        <Section title="Sertifikasi">
          <ul className="space-y-4">
            {data.certifications.map((c, i) => (
              <li key={i}>
                <p className="font-medium">
                  {c.credential_url ? <a href={c.credential_url} target="_blank" rel="noreferrer" className="underline underline-offset-4">{c.name}</a> : c.name}
                </p>
                <p className="text-sm text-gray-500">
                  {[c.issuer, formatDate(c.issue_date)].filter(Boolean).join(" · ")}
                  {c.credential_id ? ` · ${c.credential_id}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Publikasi — hanya kalau ada */}
      {data.publications.length > 0 ? (
        <Section title="Publikasi">
          <ul className="space-y-4">
            {data.publications.map((p, i) => (
              <li key={i}>
                <p className="font-medium">
                  {p.url ? <a href={p.url} target="_blank" rel="noreferrer" className="underline underline-offset-4">{p.title}</a> : p.title}
                </p>
                <p className="text-sm text-gray-500">{[p.publisher, formatDate(p.published_date)].filter(Boolean).join(" · ")}</p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Kontak */}
      <footer className="border-t">
        <div className="mx-auto max-w-3xl px-6 py-14">
          <Reveal>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Kontak</h2>
            <p className="mt-6 text-2xl font-bold">Mari terhubung.</p>
            <ContactLinks data={data} className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium" />
            {data.email ? null : <p className="mt-4 text-sm text-gray-400">Email disembunyikan oleh pemilik portofolio.</p>}
          </Reveal>
        </div>
      </footer>
    </div>
  );
}
