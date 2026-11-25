"use client";
// Template Logsfolio — konversi dari template Logsfolio oleh
// Logging Studio, lisensi MIT, didistribusikan ThemeWagon.
// Desain asli dipertahankan (CSS di ./themewagon/logsfolio.css.ts,
// dibatasi ke .tpl-logsfolio): hero foto bulat, timeline
// pengalaman & pendidikan, kartu proyek, plus mode gelap/terang.
// Semua isi berasal dari data form klien — tidak ada nama/teks
// contoh yang tersisa. Bagian yang tidak punya data di form
// sengaja DIHAPUS: testimoni, blog, dan tombol
// "Open Repository" (tidak ada field repo di form).
import { useState } from "react";
import type { PortfolioData } from "@/lib/types";
import { safeHttpUrl } from "@/lib/sanitize";
import { Reveal, Avatar, ContactLinks, formatRange, formatDate } from "./shared";
import { CSS_LOGSFOLIO } from "./themewagon/logsfolio.css";

// achievements/languages adalah field resmi PortfolioData
// (src/lib/types.ts) — dipakai langsung, tanpa tipe lokal.

export default function LogsfolioTemplate({ data }: { data: PortfolioData }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fallback [] menjaga kalau data datang dari view lama
  // yang belum mengembalikan kedua field itu.
  const achievements = data.achievements ?? [];
  const languages = data.languages ?? [];

  const firstName = (data.full_name ?? data.subdomain).split(" ")[0];
  const displayName = data.full_name ?? data.subdomain;

  // Kelompok skill mengikuti kategori yang diisi klien.
  const skillGroups = new Map<string, { name: string; level: number | null }[]>();
  for (const s of data.skills) {
    const cat = s.category?.trim() || "Umum";
    if (!skillGroups.has(cat)) skillGroups.set(cat, []);
    skillGroups.get(cat)!.push({ name: s.name, level: s.level });
  }

  // Tautan navbar hanya untuk section yang memang ada isinya.
  const nav: { href: string; label: string }[] = [];
  if (data.skills.length > 0) nav.push({ href: "#skills", label: "Skills" });
  if (data.experiences.length > 0) nav.push({ href: "#experience", label: "Experience" });
  if (data.projects.length > 0) nav.push({ href: "#projects", label: "Projects" });
  if (data.education.length > 0) nav.push({ href: "#education", label: "Education" });
  if (data.certifications.length > 0) nav.push({ href: "#certifications", label: "Certifications" });
  if (achievements.length > 0) nav.push({ href: "#achievements", label: "Achievements" });
  if (languages.length > 0) nav.push({ href: "#languages", label: "Languages" });

  return (
    <div className={`tpl-logsfolio${dark ? " dark" : ""}`}>
      <style>{CSS_LOGSFOLIO}</style>
      <a className="lg-skip" href="#main">
        Skip to content
      </a>
      <header className="lg-header">
        <nav className="lg-wrap lg-nav" aria-label="Main">
          <a href="#home" className="lg-logo">
            {firstName.toLowerCase()}
            <span>.</span>
          </a>
          <ul className={`lg-menu${menuOpen ? " open" : ""}`} id="menu">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} onClick={() => setMenuOpen(false)}>
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="lg-theme"
                aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
                onClick={() => setDark(!dark)}
              >
                {dark ? "☀ Terang" : "☾ Gelap"}
              </button>
            </li>
          </ul>
          <button
            className="lg-burger"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </nav>
      </header>

      <main id="main">
        <section id="home" className="lg-wrap lg-hero" aria-labelledby="h1">
          <Reveal className="lg-photo-col">
            <Avatar data={data} className="lg-photo" />
          </Reveal>
          <Reveal className="lg-hero-text">
            <h1 id="h1">
              Hey, I&apos;m {displayName}
            </h1>
            {data.headline ? <p className="lg-headline">{data.headline}</p> : null}
            {data.bio ? <p className="lg-bio">{data.bio}</p> : null}
            {data.location ? <p className="lg-loc">{data.location}</p> : null}
            <ContactLinks data={data} className="lg-soc" />
          </Reveal>
        </section>

        {data.skills.length > 0 ? (
          <section id="skills" className="lg-wrap lg-section" aria-labelledby="k1">
            <Reveal>
              <h2 className="lg-h2" id="k1">
                Skills
              </h2>
              <div className="lg-skills">
                {Array.from(skillGroups.entries()).map(([cat, items]) => (
                  <div className="lg-skill-card" key={cat}>
                    <h3>{cat}</h3>
                    <ul>
                      {items.map((s, i) => (
                        <li className="lg-skill-row" key={i}>
                          <span>{s.name}</span>
                          {s.level ? (
                            <span className="lg-dots" aria-label={`Level ${s.level} dari 5`}>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <i key={n} className={n <= s.level! ? "on" : ""} />
                              ))}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}

        {data.experiences.length > 0 ? (
          <section id="experience" className="lg-wrap lg-section" aria-labelledby="x1">
            <Reveal>
              <h2 className="lg-h2" id="x1">
                Work Experience
              </h2>
              <div className="lg-timeline">
                {data.experiences.map((x, i) => (
                  <div className="lg-tl-item" key={i}>
                    <h4>
                      {x.position} @<span> {x.company}</span>
                    </h4>
                    <div className="lg-tl-date">
                      {formatRange(x.start_date, x.end_date, x.is_current)}
                    </div>
                    {x.description ? <p className="lg-tl-body">{x.description}</p> : null}
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}

        {data.projects.length > 0 ? (
          <section id="projects" className="lg-wrap lg-section" aria-labelledby="w1">
            <Reveal>
              <h2 className="lg-h2" id="w1">
                My Projects
              </h2>
              <div className="lg-projects">
                {data.projects.map((p, i) => {
                  const liveUrl = safeHttpUrl(p.url);
                  return (
                    <article className="lg-card lg-proj" key={i}>
                      {p.image_url ? (
                        <div className="lg-proj-img">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.image_url}
                            alt={`Screenshot for ${p.title}`}
                            width={300}
                            height={200}
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                      <div className="lg-proj-body">
                        <h3>{p.title}</h3>
                        {p.tech_stack.length > 0 ? (
                          <div className="lg-badges">
                            {p.tech_stack.map((t) => (
                              <span className="lg-badge" key={t}>
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {p.description ? <p className="lg-proj-desc">{p.description}</p> : null}
                        {liveUrl ? (
                          <div className="lg-proj-foot">
                            <a
                              className="lg-btn lg-btn-primary"
                              href={liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Live Demo
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>
            </Reveal>
          </section>
        ) : null}

        {data.education.length > 0 ? (
          <section id="education" className="lg-wrap lg-section" aria-labelledby="e1">
            <Reveal>
              <h2 className="lg-h2" id="e1">
                Education
              </h2>
              <div className="lg-timeline">
                {data.education.map((e, i) => (
                  <div className="lg-tl-item" key={i}>
                    <h4>
                      {[e.degree, e.field_of_study].filter(Boolean).join(" ") || e.institution}
                    </h4>
                    <div className="lg-tl-sub">{e.institution}</div>
                    <div className="lg-tl-date">{formatRange(e.start_date, e.end_date)}</div>
                    {e.gpa ? <span className="lg-gpa">IPK {e.gpa}</span> : null}
                    {e.description ? <p className="lg-tl-body">{e.description}</p> : null}
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}

        {data.certifications.length > 0 ? (
          <section id="certifications" className="lg-wrap lg-section" aria-labelledby="c1">
            <Reveal>
              <h2 className="lg-h2" id="c1">
                Sertifikasi
              </h2>
              <div className="lg-ach">
                {data.certifications.map((c, i) => {
                  const credUrl = safeHttpUrl(c.credential_url);
                  const meta = [c.issuer, formatDate(c.issue_date)].filter(Boolean).join(" · ");
                  return (
                    <article className="lg-card lg-ach-card" key={i}>
                      <h3>{c.name}</h3>
                      {meta ? <p className="lg-ach-meta">{meta}</p> : null}
                      {c.credential_id ? <p className="lg-ach-desc">ID Kredensial: {c.credential_id}</p> : null}
                      {credUrl ? (
                        <a
                          className="lg-ach-link"
                          href={credUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat kredensial →
                        </a>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </Reveal>
          </section>
        ) : null}

        {achievements.length > 0 ? (
          <section id="achievements" className="lg-wrap lg-section" aria-labelledby="a1">
            <Reveal>
              <h2 className="lg-h2" id="a1">
                Pencapaian
              </h2>
              <div className="lg-ach">
                {achievements.map((a, i) => {
                  const docUrl = safeHttpUrl(a.document_url);
                  const meta = [a.issuer, formatDate(a.date)].filter(Boolean).join(" · ");
                  return (
                    <article className="lg-card lg-ach-card" key={i}>
                      <h3>{a.title}</h3>
                      {meta ? <p className="lg-ach-meta">{meta}</p> : null}
                      {a.description ? <p className="lg-ach-desc">{a.description}</p> : null}
                      {docUrl ? (
                        <a
                          className="lg-ach-link"
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Lihat dokumen →
                        </a>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </Reveal>
          </section>
        ) : null}

        {languages.length > 0 ? (
          <section id="languages" className="lg-wrap lg-section" aria-labelledby="l1">
            <Reveal>
              <h2 className="lg-h2" id="l1">
                Bahasa
              </h2>
              <div className="lg-lang">
                {languages.map((l, i) => (
                  <div className="lg-card lg-lang-card" key={i}>
                    <h3>{l.language}</h3>
                    <span>{l.level}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}
      </main>

      <footer className="lg-wrap">
        <p className="lg-foot">
          All rights reserved by
          <a href="https://github.com/Logging-Studio" target="_blank" rel="noopener noreferrer">
            Logging Studio
          </a>{" "}
          • Distributed by
          <a href="https://themewagon.com" target="_blank" rel="noopener noreferrer">
            ThemeWagon
          </a>
        </p>
      </footer>
    </div>
  );
}
