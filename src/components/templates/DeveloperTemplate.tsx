"use client";
// Template Developer — konversi dari template MIT
// "Developer Portfolio" oleh mmrahmanbappi
// (100-free-html-templates, lisensi MIT — lihat docs/LICENSES.md).
// Desain asli dipertahankan (CSS di ./mit/developer.css.ts,
// dibatasi ke .tpl-developer). Semua isi berasal dari
// data form klien — tidak ada nama/teks contoh yang tersisa.
// Bagian yang tidak punya data di form sengaja DIHAPUS:
// grafik aktivitas (angka kontribusi palsu), badge status,
// tombol unduh CV, dan tautan "Source code".
import { useState } from "react";
import type { PortfolioData } from "@/lib/types";
import { Reveal, Avatar, ContactLinks, formatRange, formatDate } from "./shared";
import { CSS_DEVELOPER } from "./mit/developer.css";

export default function DeveloperTemplate({ data }: { data: PortfolioData }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(false);

  const firstName = (data.full_name ?? data.subdomain).split(" ")[0];
  const headlineWords = (data.headline ?? "").split(" ").filter(Boolean);
  const headlineHead = headlineWords.slice(0, -1).join(" ");
  const headlineTail = headlineWords[headlineWords.length - 1] ?? "";

  // Chip filter diambil dari tech_stack proyek klien (maks 4 + "all").
  const techs = Array.from(
    new Set(data.projects.flatMap((p) => p.tech_stack)),
  ).slice(0, 4);
  const shownProjects =
    filter === "all"
      ? data.projects
      : data.projects.filter((p) => p.tech_stack.includes(filter));

  // Kelompok skill mengikuti kategori yang diisi klien.
  const skillGroups = new Map<string, { name: string; level: number | null }[]>();
  for (const s of data.skills) {
    const cat = s.category?.trim() || "Umum";
    if (!skillGroups.has(cat)) skillGroups.set(cat, []);
    skillGroups.get(cat)!.push({ name: s.name, level: s.level });
  }

  const copyEmail = async () => {
    if (!data.email) return;
    try {
      await navigator.clipboard.writeText(data.email);
    } catch {
      // Clipboard bisa ditolak browser — tampilkan tetap sebagai "disalin".
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="tpl-developer">
      <style>{CSS_DEVELOPER}</style>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="hd">
        <nav className="wrap nav" aria-label="Main">
          <a href="#" className="logo">
            ~/{data.subdomain}
            <span>.dev</span>
          </a>
          <ul className={`menu${menuOpen ? " open" : ""}`} id="menu">
            <li>
              <a href="#work">work</a>
            </li>
            <li>
              <a href="#skills">skills</a>
            </li>
            <li>
              <a href="#experience">experience</a>
            </li>
            <li>
              <a href="#education">education</a>
            </li>
            <li>
              <a href="#certificates">certificates</a>
            </li>
            <li>
              <a href="#contact">contact</a>
            </li>
          </ul>
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

      <main id="main" className="wrap">
        <section className="hero" aria-labelledby="h1" style={{ border: 0 }}>
          <Reveal>
            <div className="av">
              <Avatar
                data={data}
                className="h-16 w-16 rounded-full object-cover"
              />
            </div>
            <h1 id="h1">
              Hi, I&apos;m {firstName}.{" "}
              {headlineWords.length > 0 ? (
                <>
                  {headlineHead ? `${headlineHead} ` : ""}
                  <span>{headlineTail}</span>
                </>
              ) : null}
            </h1>
            {data.bio ? <p>{data.bio}</p> : null}
            <div className="ac">
              {data.projects.length > 0 ? (
                <a href="#work" className="btn btn-k">
                  See my work
                </a>
              ) : null}
            </div>
            {data.skills.length > 0 || data.headline ? (
              <div className="term" aria-label="Short summary">
                <div>
                  <span className="p">$</span> whoami
                </div>
                <div>
                  {(data.full_name ?? data.subdomain).toLowerCase()}
                  {data.headline ? ` · ${data.headline.toLowerCase()}` : ""}
                  {data.location ? ` · ${data.location.toLowerCase()}` : ""}
                </div>
                {data.skills.length > 0 ? (
                  <>
                    <div>
                      <span className="p">$</span> cat stack.txt
                    </div>
                    <div>
                      {data.skills
                        .slice(0, 6)
                        .map((s) => s.name.toLowerCase())
                        .join(", ")}
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </Reveal>
        </section>

        {data.projects.length > 0 ? (
          <section id="work" aria-labelledby="w1">
            <Reveal>
              <div className="sh">
                <div>
                  <span className="k">{"// selected work"}</span>
                  <h2 id="w1">Projects</h2>
                </div>
                <div
                  className="chips"
                  role="group"
                  aria-label="Filter by technology"
                >
                  <button
                    type="button"
                    aria-pressed={filter === "all"}
                    onClick={() => setFilter("all")}
                  >
                    all
                  </button>
                  {techs.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={filter === t}
                      onClick={() => setFilter(t)}
                    >
                      {t.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="proj">
                {shownProjects.map((p, i) => (
                  <article className="pj" key={i}>
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url}
                        alt={`Screenshot for ${p.title}`}
                        width={700}
                        height={394}
                        loading="lazy"
                      />
                    ) : null}
                    <div className="bd">
                      <h3>{p.title}</h3>
                      {p.description ? <p>{p.description}</p> : null}
                      {p.tech_stack.length > 0 ? (
                        <div className="tags">
                          {p.tech_stack.map((t) => (
                            <span key={t}>{t}</span>
                          ))}
                        </div>
                      ) : null}
                      <div className="lk">
                        {p.url ? (
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Live site
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}

        {data.skills.length > 0 ? (
          <section id="skills" aria-labelledby="k1">
            <Reveal>
              <div className="sh">
                <div>
                  <span className="k">{"// toolbox"}</span>
                  <h2 id="k1">Skills</h2>
                </div>
              </div>
              <div className="skills">
                {Array.from(skillGroups.entries()).map(([cat, items]) => (
                  <div className="sk" key={cat}>
                    <h3>{cat.toLowerCase()}</h3>
                    <ul>
                      {items.map((s, i) => (
                        <li key={i}>
                          {s.name}
                          {s.level ? <span>Level {s.level}/5</span> : null}
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
          <section id="experience" aria-labelledby="x1">
            <Reveal>
              <div className="sh">
                <div>
                  <span className="k">{"// history"}</span>
                  <h2 id="x1">Experience</h2>
                </div>
              </div>
              <ol className="xp">
                {data.experiences.map((x, i) => (
                  <li key={i}>
                    <time>
                      {formatRange(x.start_date, x.end_date, x.is_current)}
                    </time>
                    <div>
                      <h3>
                        {x.position} · <b>{x.company}</b>
                      </h3>
                      {x.description ? <p>{x.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>
        ) : null}

        {data.education.length > 0 ? (
          <section id="education" aria-labelledby="e1">
            <Reveal>
              <div className="sh">
                <div>
                  <span className="k">{"// education"}</span>
                  <h2 id="e1">Education</h2>
                </div>
              </div>
              <ol className="xp">
                {data.education.map((e, i) => (
                  <li key={i}>
                    <time>{formatRange(e.start_date, e.end_date)}</time>
                    <div>
                      <h3>
                        {[e.degree, e.field_of_study].filter(Boolean).join(" ") || e.institution} · <b>{e.institution}</b>
                      </h3>
                      {e.gpa ? <p>IPK {e.gpa}</p> : null}
                      {e.description ? <p>{e.description}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>
        ) : null}

        {data.certifications.length > 0 ? (
          <section id="certificates" aria-labelledby="c2">
            <Reveal>
              <div className="sh">
                <div>
                  <span className="k">{"// certificates"}</span>
                  <h2 id="c2">Certificates</h2>
                </div>
              </div>
              <ol className="xp">
                {data.certifications.map((c, i) => (
                  <li key={i}>
                    <time>{formatDate(c.issue_date)}</time>
                    <div>
                      <h3>{c.name}</h3>
                      {[c.issuer, c.credential_id].filter(Boolean).join(" · ") ? (
                        <p>{[c.issuer, c.credential_id].filter(Boolean).join(" · ")}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </section>
        ) : null}

        <section id="contact" aria-labelledby="c1" style={{ border: 0 }}>
          <Reveal>
            <div className="ct">
              <h2 id="c1">Let&apos;s build something together.</h2>
              <p>
                Hubungi {firstName} lewat email atau tautan di bawah ini.
              </p>
              {data.email ? (
                <div className="mail">
                  <span>{data.email}</span>
                  <button type="button" onClick={copyEmail}>
                    {copied ? "Copied ✓" : "Copy email"}
                  </button>
                </div>
              ) : null}
              <ContactLinks data={data} className="soc" />
            </div>
          </Reveal>
        </section>
      </main>
      <footer>
        © {new Date().getFullYear()} {data.full_name ?? data.subdomain}
      </footer>
    </div>
  );
}
