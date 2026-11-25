"use client";
// Template Picto — konversi dari template Picto oleh ThemeWagon,
// lisensi MIT, didistribusikan ThemeWagon.
// Kredit persis dari README sumber: "Design and Code is Copyright
// © ThemeWagon — Licensed cover under MIT — Developed by ThemeWagon".
// Desain asli dipertahankan (CSS di ./themewagon/picto.css.ts,
// dibatasi ke .tpl-picto). Semua isi berasal dari data form klien —
// tidak ada nama, email, atau angka contoh yang tersisa.
// Bagian yang tidak punya data di form sengaja DIHAPUS: Blog,
// HappyClients (marquee logo), Testimonial (slider testimoni),
// WorkTogether CTA gelap (sudah tercakup Contact), formulir kontak
// (tidak ada backend penerima), tombol Download CV, dan preloader
// (akan memblokir render). Back-to-top dipertahankan sebagai tombol
// sederhana (window.scrollTo) yang muncul setelah scroll 200px.
// Sertifikasi & publikasi klien dirender di dalam section Pencapaian
// supaya tidak ada data klien yang hilang (Picto asli tidak punya
// section khusus untuk keduanya).
import { useEffect, useState } from "react";
import type { PortfolioData } from "@/lib/types";
import { Reveal, Avatar, ContactLinks, formatRange, formatDate } from "./shared";
import { CSS_PICTO } from "./themewagon/picto.css";

// achievements/languages adalah field resmi PortfolioData
// (src/lib/types.ts) — dipakai langsung, tanpa tipe lokal.

// 4 langkah cara kerja — label metode generik dari template asli,
// bukan riwayat orang, jadi dipertahankan apa adanya.
const WORK_STEPS = [
  {
    title: "Research",
    description:
      "Design meets function in every pixel, blending clarity with intuitive motion.",
  },
  {
    title: "Analyze",
    description:
      "Crafting clean, thoughtful interfaces where form flows seamlessly into function and clarity.",
  },
  {
    title: "Design",
    description:
      "I design seamless digital experiences with precision, purpose, and a touch of elegance.",
  },
  {
    title: "Launch",
    description:
      "I craft digital products where thoughtful design meets performance-driven, responsive development.",
  },
];

export default function PictoTemplate({ data }: { data: PortfolioData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fallback [] menjaga kalau data datang dari view lama
  // yang belum mengembalikan kedua field itu.
  const achievements = data.achievements ?? [];
  const languages = data.languages ?? [];

  const firstName = (data.full_name ?? data.subdomain).split(" ")[0];
  const headlineWords = (data.headline ?? "").split(" ").filter(Boolean);
  const headlineHead = headlineWords.slice(0, -1).join(" ");
  const headlineTail = headlineWords[headlineWords.length - 1] ?? "";

  // Statistik hero HANYA dari data nyata klien.
  const stats = [
    { value: data.projects.length, label: "Proyek" },
    { value: data.experiences.length, label: "Pengalaman Kerja" },
    { value: data.skills.length, label: "Keahlian" },
  ].filter((s) => s.value > 0);

  // Layanan = skill klien yang dikelompokkan per kategori.
  const skillGroups = new Map<string, { name: string; level: number | null }[]>();
  for (const s of data.skills) {
    const cat = s.category?.trim() || "Umum";
    if (!skillGroups.has(cat)) skillGroups.set(cat, []);
    skillGroups.get(cat)!.push({ name: s.name, level: s.level });
  }

  const hasAchievements =
    achievements.length > 0 ||
    data.certifications.length > 0 ||
    data.publications.length > 0;

  const mailHref = data.email ? `mailto:${data.email}` : "#contact";

  return (
    <div className="tpl-picto">
      <style>{CSS_PICTO}</style>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={`hd${scrolled ? " scrolled" : ""}`}>
        <nav className="wrap nav" aria-label="Main">
          <a href="#introduction" className="logo">
            {firstName}
            <span>.</span>
          </a>
          <ul className={`menu${menuOpen ? " open" : ""}`} id="menu">
            <li>
              <a href="#introduction" onClick={() => setMenuOpen(false)}>Home</a>
            </li>
            <li>
              <a href="#profile" onClick={() => setMenuOpen(false)}>About</a>
            </li>
            <li>
              <a href="#work-process" onClick={() => setMenuOpen(false)}>Process</a>
            </li>
            <li>
              <a href="#portfolio" onClick={() => setMenuOpen(false)}>Portfolio</a>
            </li>
            {data.skills.length > 0 ? (
              <li>
                <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
              </li>
            ) : null}
            <li>
              <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
            </li>
          </ul>
          <a href="#contact" className="btn btn-p">
            Contact
          </a>
          <button
            className="burger"
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
        <div className="hero-bg">
          <div className="wrap">
            <section className="hero" id="introduction" aria-labelledby="h1" style={{ border: 0 }}>
              <Reveal>
                <h1 id="h1">
                  Hello, I&rsquo;m
                  <span className="nm">{data.full_name ?? data.subdomain}</span>
                </h1>
                {headlineWords.length > 0 ? (
                  <p className="lede">
                    {headlineHead ? `${headlineHead} ` : ""}
                    <span className="hl">{headlineTail}</span>
                    {data.location ? ` based in ${data.location}.` : ""}
                  </p>
                ) : data.location ? (
                  <p className="lede">Based in {data.location}.</p>
                ) : null}
                {data.bio ? <p className="bio">{data.bio}</p> : null}
                <p className="cta">
                  <a className="btn btn-p" href={mailHref}>
                    Say Hello!
                  </a>
                </p>
                {stats.length > 0 ? (
                  <div className="stats" aria-label="Ringkasan portofolio">
                    {stats.map((s) => (
                      <div className="stat" key={s.label}>
                        <b>{s.value}</b>
                        <span>{s.label}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </Reveal>
              <Reveal delay={0.1}>
                <Avatar
                  data={data}
                  className={
                    data.photo_url
                      ? "hero-photo"
                      : "hero-photo-fallback"
                  }
                />
              </Reveal>
            </section>
          </div>

          <div className="wrap">
            <section className="profile-card" id="profile" aria-labelledby="about-h" style={{ border: 0 }}>
              <Reveal>
                <div className="profile-grid">
                  <div className="prof-photo">
                    <Avatar
                      data={data}
                      className={data.photo_url ? "ph" : "ph-fallback"}
                    />
                    <div className="soc">
                      <div className="soc-in">
                        <ContactLinks data={data} className="" />
                      </div>
                    </div>
                  </div>
                  <div className="about-txt">
                    <h2 id="about-h">
                      {data.headline ?? `Tentang ${firstName}`}
                    </h2>
                    {data.bio ? <p>{data.bio}</p> : null}
                    {data.location ? (
                      <p style={{ marginTop: 12 }}>📍 {data.location}</p>
                    ) : null}
                    {data.projects.length > 0 ? (
                      <div className="acts">
                        <a className="btn btn-p" href="#portfolio">
                          My Projects
                        </a>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Reveal>
            </section>
          </div>
        </div>

        <div className="proc-sec">
          <div className="wrap">
            <section id="work-process" aria-labelledby="wp-h">
              <Reveal>
                <div className="proc-grid">
                  <div className="intro">
                    <h2 id="wp-h" style={{ fontSize: "clamp(32px,3.6vw,48px)" }}>
                      Work Process
                    </h2>
                    <p>
                      Driven by design and powered by code, I create digital
                      interfaces that feel intuitive and perform seamlessly.
                      Every layout, animation, and component is crafted with
                      intention — merging usability with visual clarity.
                    </p>
                    <p>
                      I blend clean design with efficient code to build
                      engaging, user-friendly web experiences that stand out.
                    </p>
                  </div>
                  <div className="steps">
                    {WORK_STEPS.map((step, i) => (
                      <div className="step" key={step.title}>
                        <div className="step-ic" aria-hidden="true">
                          {i + 1}
                        </div>
                        <h3>{`${i + 1}. ${step.title}`}</h3>
                        <p>{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </section>
          </div>
        </div>

        {data.projects.length > 0 ? (
          <div className="wrap">
            <section id="portfolio" aria-labelledby="pf-h">
              <Reveal>
                <div className="sec-head">
                  <h2 id="pf-h">Portfolio</h2>
                  <p>
                    Here&rsquo;s a selection of my recent work, showcasing my
                    skills in creating user-centric and visually appealing
                    interfaces.
                  </p>
                </div>
                <div className="proj-grid">
                  {data.projects.map((p, i) => (
                    <article className="pj" key={i}>
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={`Screenshot for ${p.title}`}
                          loading="lazy"
                        />
                      ) : null}
                      <div className="bd">
                        {p.tech_stack[0] ? (
                          <p className="cat">{p.tech_stack[0]}</p>
                        ) : null}
                        <h3>{p.title}</h3>
                        {p.description ? <p>{p.description}</p> : null}
                        {p.tech_stack.length > 0 ? (
                          <div className="tags">
                            {p.tech_stack.map((t) => (
                              <span key={t}>{t}</span>
                            ))}
                          </div>
                        ) : null}
                        {p.url ? (
                          <div className="lk">
                            <a
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Lihat Proyek →
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              </Reveal>
            </section>
          </div>
        ) : null}

        {data.education.length > 0 ? (
          <div className="wrap">
            <section id="education" aria-labelledby="edu-h">
              <Reveal>
                <div className="sec-head left">
                  <h2 id="edu-h">Education</h2>
                  <p>Riwayat pendidikan.</p>
                </div>
                <ol className="edu-list">
                  {data.education.map((e, i) => (
                    <li key={i}>
                      <time>{formatRange(e.start_date, e.end_date)}</time>
                      <div>
                        <h3>
                          {[e.degree, e.field_of_study].filter(Boolean).join(" ") || e.institution}{" "}
                          · <b>{e.institution}</b>
                        </h3>
                        {e.gpa ? <p>IPK {e.gpa}</p> : null}
                        {e.description ? <p>{e.description}</p> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </section>
          </div>
        ) : null}

        {data.skills.length > 0 ? (
          <div className="svc-sec">
            <div className="wrap">
              <section id="services" aria-labelledby="svc-h">
                <Reveal>
                  <div className="svc-grid">
                    <div className="svc-intro">
                      <h2 id="svc-h">What I do?</h2>
                      <p>
                        I specialize in designing user experiences, crafting
                        engaging interfaces, and building robust web
                        applications that deliver value and usability.
                      </p>
                      <p>
                        My approach combines creativity and technical expertise
                        to deliver solutions that are both visually appealing
                        and highly functional for users.
                      </p>
                      <a className="btn btn-p" href={mailHref}>
                        Say Hello!
                      </a>
                    </div>
                    <div>
                      {Array.from(skillGroups.entries()).map(([cat, items]) => (
                        <div className="role" key={cat}>
                          <h3>{cat}</h3>
                          <div className="chips">
                            {items.map((s, i) => (
                              <span key={i}>
                                {s.name}
                                {s.level ? ` · Level ${s.level}/5` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </section>
            </div>
          </div>
        ) : null}

        {hasAchievements ? (
          <div className="wrap">
            <section id="achievements" aria-labelledby="ach-h">
              <Reveal>
                <div className="sec-head">
                  <h2 id="ach-h">Pencapaian</h2>
                  <p>Penghargaan, sertifikasi, dan publikasi.</p>
                </div>
                {achievements.length > 0 ? (
                  <div className="ach-grid">
                    {achievements.map((a, i) => (
                      <article className="ach" key={i}>
                        <h3>{a.title}</h3>
                        {[a.issuer, formatDate(a.date)].filter(Boolean).join(" · ") ? (
                          <p className="meta">
                            {[a.issuer, formatDate(a.date)].filter(Boolean).join(" · ")}
                          </p>
                        ) : null}
                        {a.description ? <p>{a.description}</p> : null}
                        {a.document_url ? (
                          <a
                            className="doc"
                            href={a.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Lihat Dokumen →
                          </a>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : null}
                {data.certifications.length > 0 ? (
                  <>
                    <h3 className="sub-h">Sertifikasi</h3>
                    <div className="ach-grid">
                      {data.certifications.map((c, i) => (
                        <article className="ach" key={i}>
                          <h3>{c.name}</h3>
                          {[c.issuer, formatDate(c.issue_date)].filter(Boolean).join(" · ") ? (
                            <p className="meta">
                              {[c.issuer, formatDate(c.issue_date)].filter(Boolean).join(" · ")}
                            </p>
                          ) : null}
                          {c.credential_id ? <p>ID Kredensial: {c.credential_id}</p> : null}
                          {c.credential_url ? (
                            <a
                              className="doc"
                              href={c.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Lihat Kredensial →
                            </a>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </>
                ) : null}
                {data.publications.length > 0 ? (
                  <>
                    <h3 className="sub-h">Publikasi</h3>
                    <div className="ach-grid">
                      {data.publications.map((p, i) => (
                        <article className="ach" key={i}>
                          <h3>{p.title}</h3>
                          {[p.publisher, formatDate(p.published_date)].filter(Boolean).join(" · ") ? (
                            <p className="meta">
                              {[p.publisher, formatDate(p.published_date)].filter(Boolean).join(" · ")}
                            </p>
                          ) : null}
                          {p.description ? <p>{p.description}</p> : null}
                          {p.url ? (
                            <a
                              className="doc"
                              href={p.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Baca Publikasi →
                            </a>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </>
                ) : null}
              </Reveal>
            </section>
          </div>
        ) : null}

        {languages.length > 0 ? (
          <div className="wrap">
            <section id="languages" aria-labelledby="lang-h" style={{ paddingTop: 0 }}>
              <Reveal>
                <div className="sec-head">
                  <h2 id="lang-h">Bahasa</h2>
                  <p>Bahasa yang dikuasai beserta tingkat kemahiran.</p>
                </div>
                <div className="lang-list">
                  {languages.map((l, i) => (
                    <span className="lang" key={i}>
                      {l.language} <span>· {l.level}</span>
                    </span>
                  ))}
                </div>
              </Reveal>
            </section>
          </div>
        ) : null}

        <div className="wrap">
          <section id="contact" aria-labelledby="ct-h" style={{ paddingBottom: 120 }}>
            <Reveal>
              <div className="contact-card">
                <h2 id="ct-h">Let&rsquo;s discuss your Project</h2>
                <p className="lead">
                  I&rsquo;m available for freelance work. Drop me a line if you
                  have a project you think I&rsquo;d be a good fit for.
                </p>
                <div className="addr-list">
                  {data.location ? (
                    <div className="addr">
                      <div className="addr-ic" aria-hidden="true">◎</div>
                      <div>
                        <small>Address:</small>
                        <b>{data.location}</b>
                      </div>
                    </div>
                  ) : null}
                  {data.email ? (
                    <div className="addr">
                      <div className="addr-ic" aria-hidden="true">✉</div>
                      <div>
                        <small>My Email:</small>
                        <b>{data.email}</b>
                      </div>
                    </div>
                  ) : null}
                  {data.phone ? (
                    <div className="addr">
                      <div className="addr-ic" aria-hidden="true">☎</div>
                      <div>
                        <small>Call Me Now:</small>
                        <b>{data.phone}</b>
                      </div>
                    </div>
                  ) : null}
                </div>
                <ContactLinks data={data} className="contact-links" />
              </div>
            </Reveal>
          </section>
        </div>
      </main>

      <footer className="ft">
        <div className="wrap ft-in">
          <a href="#introduction" className="logo">
            {firstName}
            <span>.</span>
          </a>
          <nav aria-label="Footer">
            <a href="#introduction">Home</a>
            <a href="#profile">About</a>
            <a href="#work-process">Process</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </nav>
          <p className="copy">
            Copyright © {new Date().getFullYear()} {data.full_name ?? data.subdomain}
          </p>
        </div>
        <p className="credit">
          Developed with ❤️ by{" "}
          <a href="https://www.themewagon.com" target="_blank" rel="noopener noreferrer">
            ThemeWagon
          </a>
        </p>
      </footer>

      {scrolled ? (
        <button
          type="button"
          className="totop"
          aria-label="Kembali ke atas"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      ) : null}
    </div>
  );
}
