"use client";
// Template Astrowind — konversi dari template Astrowind oleh onWidget,
// lisensi MIT, didistribusikan oleh ThemeWagon
// (sumber: /tmp/themewagon-templates/astrowind, halaman personal.astro).
// Desain asli dipertahankan (CSS di ./themewagon/astrowind.css.ts,
// dibatasi ke .tpl-astrowind, token warna dari CustomStyles.astro).
// Semua isi berasal dari data form klien — tidak ada nama, foto,
// atau testimoni contoh yang tersisa.
// Typo bawaan pada label navigasi dan id section asli diperbaiki
// menjadi ejaan "Portfolio" yang benar.
// Bagian yang tidak punya field di form sengaja DIHAPUS:
// Testimonials, BlogLatestPosts, dan Brands.
// Ditambah: section Pencapaian dan Bahasa (field achievements/languages).
// Mode gelap/terang: toggle sederhana dengan useState yang mengganti
// class "dark" di wrapper (variabel CSS di .tpl-astrowind.dark).
import { useState } from "react";
import type { PortfolioData } from "@/lib/types";
import { safeHttpUrl } from "@/lib/sanitize";
import { Reveal, Avatar, ContactLinks, formatRange, formatDate } from "./shared";
import { CSS_ASTROWIND } from "./themewagon/astrowind.css";

// achievements/languages adalah field resmi PortfolioData
// (src/lib/types.ts) — dipakai langsung, tanpa tipe lokal.

// Ikon Tabler (astro-icon) diganti inline SVG sederhana.
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
    </svg>
  );
}
function IconSchool() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 9 12 4l10 5-10 5L2 9Z" />
      <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v5" />
    </svg>
  );
}
function IconPoint() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}
function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M10 14a5 5 0 0 0 7.1 0l2.4-2.4a5 5 0 0 0-7.1-7.1L11 5.9M14 10a5 5 0 0 0-7.1 0l-2.4 2.4a5 5 0 0 0 7.1 7.1L13 18.1" />
    </svg>
  );
}
function IconSun() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export default function AstrowindTemplate({ data }: { data: PortfolioData }) {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fallback [] menjaga kalau data datang dari view lama
  // yang belum mengembalikan kedua field itu.
  const achievements = data.achievements ?? [];
  const languages = data.languages ?? [];
  const displayName = data.full_name ?? data.subdomain;
  const firstName = displayName.split(" ")[0];

  // Tautan sosial untuk kartu About — hanya yang terisi di data.
  const socialCards: { label: string; href: string }[] = [];
  const website = safeHttpUrl(data.website_url);
  if (website) socialCards.push({ label: "Website", href: website });
  const linkedin = safeHttpUrl(data.linkedin_url);
  if (linkedin) socialCards.push({ label: "LinkedIn", href: linkedin });
  const github = safeHttpUrl(data.github_url);
  if (github) socialCards.push({ label: "GitHub", href: github });
  const instagram = safeHttpUrl(data.instagram_url);
  if (instagram) socialCards.push({ label: "Instagram", href: instagram });
  if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    socialCards.push({ label: "Email", href: `mailto:${data.email}` });
  }

  const navLinks: { text: string; href: string }[] = [
    { text: "Home", href: "#hero" },
    { text: "About", href: "#about" },
    { text: "Resume", href: "#resume" },
  ];
  if (data.projects.length > 0) navLinks.push({ text: "Portfolio", href: "#portfolio" });
  if (data.certifications.length > 0) navLinks.push({ text: "Sertifikasi", href: "#certifications" });
  if (achievements.length > 0) navLinks.push({ text: "Pencapaian", href: "#achievements" });
  if (github) navLinks.push({ text: "Github", href: github });

  const hireHref = data.email
    ? `mailto:${data.email}`
    : data.whatsapp
      ? `https://wa.me/${data.whatsapp.replace(/[^0-9]/g, "")}`
      : "#contact";

  const showAbout = Boolean(data.bio || data.photo_url || data.location || socialCards.length > 0);

  return (
    <div className={`tpl-astrowind${dark ? " dark" : ""}`}>
      <style>{CSS_ASTROWIND}</style>
      <a className="skip" href="#main">
        Skip to content
      </a>

      <header className="hd">
        <nav className="wrap nav" aria-label="Main navigation">
          <a className="logo" href="#hero">
            {firstName}
            <span>.</span>
          </a>
          <ul className={`menu${menuOpen ? " open" : ""}`} id="menu">
            {navLinks.map((l) => (
              <li key={l.text}>
                <a href={l.href} {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} onClick={() => setMenuOpen(false)}>
                  {l.text}
                </a>
              </li>
            ))}
          </ul>
          <div className="nav-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label={dark ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
              aria-pressed={dark}
              onClick={() => setDark(!dark)}
            >
              {dark ? <IconSun /> : <IconMoon />}
            </button>
            <a href={hireHref} className="btn btn-primary btn-sm">
              Hire me
            </a>
            <button
              type="button"
              className="icon-btn burger"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="hero" aria-labelledby="h1">
          <div className="wrap">
            <Reveal>
              {data.headline ? <p className="tagline">{data.headline}</p> : null}
              <h1 id="h1">{displayName}</h1>
              {data.bio ? <p className="sub">{data.bio}</p> : null}
              <div className="actions">
                <a href={hireHref} className="btn btn-primary">
                  Hire me
                </a>
                {data.projects.length > 0 ? (
                  <a href="#portfolio" className="btn">
                    Lihat Portfolio
                  </a>
                ) : null}
              </div>
              {data.location ? <p className="meta">{data.location}</p> : null}
            </Reveal>
          </div>
        </section>

        {showAbout ? (
          <section className="about" id="about" aria-labelledby="about-h">
            <div className="wrap">
              <Reveal>
                <div className="about-grid">
                  <div className="about-text">
                    <h2 id="about-h">About me</h2>
                    <p>
                      Welcome to my creative journey. My work is a testament to my commitment to
                      bringing ideas to life.
                    </p>
                    {data.location ? <p className="loc">{data.location}</p> : null}
                    {socialCards.length > 0 ? (
                      <>
                        <p>If you&apos;re curious to dive deeper into my work, you can follow me:</p>
                        <div className="soc-cards">
                          {socialCards.map((s) => (
                            <a key={s.label} className="soc-card" href={s.href} target="_blank" rel="noreferrer">
                              <IconLink />
                              {s.label}
                            </a>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div className="about-photo-wrap">
                    <Avatar data={data} className="photo" />
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        {data.experiences.length > 0 ? (
          <section id="resume" aria-labelledby="exp-h">
            <div className="wrap">
              <Reveal>
                <div className="sec-head left">
                  <h2 id="exp-h">Work experience</h2>
                </div>
                <div className="steps">
                  {data.experiences.map((x, i) => (
                    <div className="step" key={i}>
                      <div className="step-rail">
                        <div className="step-icon">
                          <IconBriefcase />
                        </div>
                        {i !== data.experiences.length - 1 ? <div className="step-line" /> : null}
                      </div>
                      <div className="step-body">
                        <h3>
                          {x.position} <span>{x.company}</span>{" "}
                          <span className="when">{formatRange(x.start_date, x.end_date, x.is_current)}</span>
                        </h3>
                        {x.description ? <p>{x.description}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        {data.education.length > 0 ? (
          <section id="education" aria-labelledby="edu-h">
            <div className="wrap">
              <Reveal>
                <div className="sec-head left">
                  <h2 id="edu-h">Education</h2>
                </div>
                <div className="steps">
                  {data.education.map((e, i) => (
                    <div className="step" key={i}>
                      <div className="step-rail">
                        <div className="step-icon">
                          <IconSchool />
                        </div>
                        {i !== data.education.length - 1 ? <div className="step-line" /> : null}
                      </div>
                      <div className="step-body">
                        <h3>
                          {[e.degree, e.field_of_study].filter(Boolean).join(" ") || e.institution}{" "}
                          <span>{e.institution}</span>{" "}
                          <span className="when">{formatRange(e.start_date, e.end_date)}</span>
                        </h3>
                        {e.gpa ? <p className="gpa">{`IPK ${e.gpa}`}</p> : null}
                        {e.description ? <p>{e.description}</p> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        {data.skills.length > 0 ? (
          <section id="skills" aria-labelledby="skills-h">
            <div className="wrap">
              <Reveal>
                <div className="sec-head">
                  <h2 id="skills-h">Skills</h2>
                  <p>Discover the proficiencies that allow me to bring imagination to life through design.</p>
                </div>
                <div className="skills-grid">
                  {data.skills.map((s, i) => (
                    <div className="skill" key={i}>
                      <IconPoint />
                      <div>
                        <h3>{s.name}</h3>
                        {s.category ? <p className="cat">{s.category}</p> : null}
                        {s.level ? (
                          <div className="lvl" aria-label={`Level ${s.level} dari 5`}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <i key={n} className={n <= (s.level ?? 0) ? "on" : undefined} />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        {data.projects.length > 0 ? (
          <section id="portfolio" aria-labelledby="port-h">
            <div className="wrap">
              <Reveal>
                <div className="sec-head">
                  <h2 id="port-h">Elevating visual narratives</h2>
                  <p>
                    Embark on a design journey that surpasses pixels, entering a realm of imagination.
                    Explore my portfolio, where passion and creativity converge to shape enthralling
                    visual narratives.
                  </p>
                </div>
                {data.projects.map((p, i) => (
                  <article className={`proj${i % 2 === 1 ? " rev" : ""}`} key={i}>
                    <div className="proj-text">
                      <h3>
                        Project {i + 1}: <span>{p.title}</span>
                      </h3>
                      {p.description ? (
                        <div className="proj-item">
                          <h4>Description:</h4>
                          <p>{p.description}</p>
                        </div>
                      ) : null}
                      {p.tech_stack.length > 0 ? (
                        <div className="proj-item">
                          <h4>Teknologi:</h4>
                          <div className="proj-tags">
                            {p.tech_stack.map((t) => (
                              <span key={t}>{t}</span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {p.url ? (
                        <a className="proj-link" href={p.url} target="_blank" rel="noreferrer">
                          Go to the project <IconChevron />
                        </a>
                      ) : null}
                    </div>
                    {p.image_url ? (
                      <div className="proj-img">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.image_url} alt={`Gambar proyek ${p.title}`} loading="lazy" />
                      </div>
                    ) : null}
                  </article>
                ))}
              </Reveal>
            </div>
          </section>
        ) : null}

        {data.certifications.length > 0 ? (
          <section id="certifications" aria-labelledby="cert-h">
            <div className="wrap">
              <Reveal>
                <div className="sec-head">
                  <h2 id="cert-h">Sertifikasi</h2>
                </div>
                <div className="cards">
                  {data.certifications.map((c, i) => {
                    const meta = [c.issuer, c.issue_date ? formatDate(c.issue_date) : ""]
                      .filter(Boolean)
                      .join(" · ");
                    const credUrl = safeHttpUrl(c.credential_url);
                    return (
                      <article className="card" key={i}>
                        <h3>{c.name}</h3>
                        {meta ? <p className="issuer">{meta}</p> : null}
                        {c.credential_id ? <p>ID Kredensial: {c.credential_id}</p> : null}
                        {credUrl ? (
                          <a href={credUrl} target="_blank" rel="noreferrer">
                            Lihat kredensial
                          </a>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        {achievements.length > 0 ? (
          <section id="achievements" aria-labelledby="ach-h">
            <div className="wrap">
              <Reveal>
                <div className="sec-head">
                  <h2 id="ach-h">Pencapaian</h2>
                </div>
                <div className="cards">
                  {achievements.map((a, i) => (
                    <article className="card" key={i}>
                      <h3>{a.title}</h3>
                      {[a.issuer, a.date ? formatDate(a.date) : ""].filter(Boolean).join(" · ") ? (
                        <p className="issuer">{[a.issuer, a.date ? formatDate(a.date) : ""].filter(Boolean).join(" · ")}</p>
                      ) : null}
                      {a.description ? <p>{a.description}</p> : null}
                      {a.document_url ? (
                        <a href={a.document_url} target="_blank" rel="noreferrer">
                          Lihat dokumen
                        </a>
                      ) : null}
                    </article>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        {languages.length > 0 ? (
          <section id="languages" aria-labelledby="lang-h">
            <div className="wrap">
              <Reveal>
                <div className="sec-head">
                  <h2 id="lang-h">Bahasa</h2>
                </div>
                <div className="langs">
                  {languages.map((l, i) => (
                    <span className="lang" key={i}>
                      {l.language} <span>{l.level}</span>
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}

        <section id="contact" aria-labelledby="cta-h">
          <div className="wrap">
            <Reveal>
              <div className="cta-card">
                <h2 id="cta-h">Let&apos;s create together</h2>
                <p>Ready to transform your vision into captivating designs?</p>
                <div className="actions">
                  <a href={hireHref} className="btn btn-primary">
                    Hire me
                  </a>
                </div>
                <ContactLinks data={data} className="cta-links" />
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap ft">
          <div>
            <a className="brand" href="#hero">
              {firstName}
              <span>.</span>
            </a>
            <p>
              © {new Date().getFullYear()} {displayName} · Made by onWidget · All rights reserved · Distributed by{" "}
              <a href="https://themewagon.com" target="_blank" rel="noreferrer">
                ThemeWagon
              </a>
              .
            </p>
          </div>
          <nav aria-label="Footer">
            <a href="#about">About</a>
            <a href="#resume">Resume</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
