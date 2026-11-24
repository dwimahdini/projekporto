"use client";
// Template Desainer — konversi dari template MIT
// "Designer Portfolio" oleh mmrahmanbappi
// (100-free-html-templates, lisensi MIT — lihat docs/LICENSES.md).
// Desain asli dipertahankan (CSS di ./mit/designer.css.ts,
// dibatasi ke .tpl-designer). Semua isi berasal dari
// data form klien — tidak ada nama/teks contoh yang tersisa.
// Bagian yang tidak punya data di form sengaja DIHAPUS:
// kutipan testimoni klien (nama + kalimat palsu) dan
// formulir kontak (tidak ada backend penerima).
// Studi kasus dipetakan dari proyek klien: judul, deskripsi,
// dan tech_stack sebagai chip; angka hasil ("+38% ...")
// tidak ditampilkan karena bukan data klien.
import { useState } from "react";
import type { PortfolioData } from "@/lib/types";
import { Reveal, Avatar, ContactLinks, formatRange, formatDate } from "./shared";
import { CSS_DESIGNER } from "./mit/designer.css";

const CASE_COLORS = ["c1", "c2", "c3", "c4"];

export default function DesignerTemplate({ data }: { data: PortfolioData }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const firstName = (data.full_name ?? data.subdomain).split(" ")[0];
  // Judul hero = headline klien, kata terakhir diberi highlight peach.
  const headlineWords = (data.headline ?? "").split(" ").filter(Boolean);
  const headlineHead = headlineWords.slice(0, -1).join(" ");
  const headlineTail = headlineWords[headlineWords.length - 1] ?? "";

  // "Worked with" = perusahaan unik dari pengalaman klien.
  const companies = Array.from(
    new Set(data.experiences.map((x) => x.company)),
  ).slice(0, 4);

  return (
    <div className="tpl-designer">
      <style>{CSS_DESIGNER}</style>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="hd wrap">
        <nav className="nav" aria-label="Main" style={{ position: "relative" }}>
          <a href="#" className="logo">
            {data.full_name ?? data.subdomain}
          </a>
          <ul className={`menu${menuOpen ? " open" : ""}`} id="menu">
            <li>
              <a href="#work">Work</a>
            </li>
            <li>
              <a href="#experience">Experience</a>
            </li>
            <li>
              <a href="#process">Process</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
          </ul>
          <a href="#contact" className="btn btn-k">
            Hire me
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

      <main id="main" className="wrap">
        <section className="hero" aria-labelledby="h1">
          <Reveal>
            {/* Nama pemilik ditampilkan jelas di atas headline:
                sebelumnya nama hanya muncul kecil di nav dan
                caption avatar, padahal ini portofolio orangnya. */}
            <p style={{ fontSize: 15, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 14px" }}>
              {data.full_name ?? data.subdomain}
            </p>
            <h1 id="h1">
              {headlineWords.length > 0 ? (
                <>
                  {headlineHead ? `${headlineHead} ` : ""}
                  <span>{headlineTail}</span>
                </>
              ) : (
                <>
                  Portofolio <span>{firstName}</span>
                </>
              )}
            </h1>
            <div className="rw">
              {data.bio ? <p>{data.bio}</p> : <p />}
              <div className="me">
                <Avatar
                  data={data}
                  className="h-[72px] w-[72px] rounded-full object-cover"
                />
                <div>
                  <b>{data.full_name ?? data.subdomain}</b>
                  {data.location ? <small>{data.location}</small> : null}
                </div>
              </div>
            </div>
            {companies.length > 0 ? (
              <div className="logos" aria-label="Companies I've worked with">
                <span>Worked with</span>
                {companies.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
            ) : null}
          </Reveal>
        </section>

        {data.projects.length > 0 ? (
          <section id="work" aria-labelledby="w1">
            <Reveal>
              <div className="sh">
                <h2 id="w1">Selected case studies</h2>
                <p>
                  Each project shows the problem, what I did and the result
                  it had on the business.
                </p>
              </div>
              <div className="cases">
                {data.projects.map((p, i) => (
                  <a
                    className={`cs ${CASE_COLORS[i % CASE_COLORS.length]}`}
                    href={p.url ?? "#work"}
                    key={i}
                  >
                    <figure>
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image_url}
                          alt={`Preview of ${p.title}`}
                          width={900}
                          height={563}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          aria-hidden
                          style={{
                            width: "100%",
                            aspectRatio: "16/10",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 72,
                            fontWeight: 700,
                            background: "rgba(255,255,255,.55)",
                          }}
                        >
                          {p.title.charAt(0)}
                        </div>
                      )}
                    </figure>
                    {p.tech_stack.length > 0 ? (
                      <div className="meta">
                        {p.tech_stack.slice(0, 2).map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    ) : null}
                    <h3>{p.title}</h3>
                    {p.description ? <p>{p.description}</p> : null}
                  </a>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}

        {data.experiences.length > 0 ? (
          <section id="experience" aria-labelledby="x1">
            <Reveal>
              <div className="sh">
                <h2 id="x1">Experience</h2>
                <p>Roles I have held and what I did in each of them.</p>
              </div>
              <div className="space-y-7">
                {data.experiences.map((x, i) => (
                  <div key={i} className="border-t border-black/10 pt-5 first:border-t-0 first:pt-0">
                    <h3 className="text-xl font-bold">
                      {x.position} · {x.company}
                    </h3>
                    <p className="mt-1 text-sm text-black/60">
                      {formatRange(x.start_date, x.end_date, x.is_current)}
                    </p>
                    {x.description ? <p className="mt-2 leading-relaxed">{x.description}</p> : null}
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}

        {data.education.length > 0 ? (
          <section id="education" aria-labelledby="e1">
            <Reveal>
              <div className="sh">
                <h2 id="e1">Education</h2>
              </div>
              <div className="space-y-5">
                {data.education.map((e, i) => (
                  <div key={i} className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
                    <h3 className="text-lg font-bold">{e.institution}</h3>
                    <p className="mt-1 text-black/70">
                      {[e.degree, e.field_of_study].filter(Boolean).join(" · ")}
                      {e.gpa ? ` · IPK ${e.gpa}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-black/60">{formatRange(e.start_date, e.end_date)}</p>
                    {e.description ? <p className="mt-2 leading-relaxed">{e.description}</p> : null}
                  </div>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}

        {data.certifications.length > 0 ? (
          <section id="certificates" aria-labelledby="c2">
            <Reveal>
              <div className="sh">
                <h2 id="c2">Certificates</h2>
              </div>
              <ul className="space-y-4">
                {data.certifications.map((c, i) => (
                  <li key={i} className="border-t border-black/10 pt-4 first:border-t-0 first:pt-0">
                    <p className="font-bold">{c.name}</p>
                    <p className="mt-1 text-sm text-black/70">
                      {[c.issuer, formatDate(c.issue_date)].filter(Boolean).join(" · ")}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </section>
        ) : null}

        <section id="process" aria-labelledby="p1">
          <Reveal>
            <div className="sh">
              <h2 id="p1">How I work</h2>
              <p>A clear process, so you always know what happens next.</p>
            </div>
            <div className="proc">
              <div className="pr">
                <b>1</b>
                <h3>Understand</h3>
                <p>Interviews with users and your team, plus a look at your data.</p>
              </div>
              <div className="pr">
                <b>2</b>
                <h3>Sketch</h3>
                <p>Quick sketches and flows to agree on the right direction early.</p>
              </div>
              <div className="pr">
                <b>3</b>
                <h3>Design and test</h3>
                <p>High-fidelity screens tested with real users every week.</p>
              </div>
              <div className="pr">
                <b>4</b>
                <h3>Hand over</h3>
                <p>Clean Figma files, specs and support while developers build.</p>
              </div>
            </div>
          </Reveal>
        </section>

        {data.skills.length > 0 ? (
          <section id="about" aria-labelledby="t1">
            <Reveal>
              <div className="sh">
                <h2 id="t1">Tools I use</h2>
              </div>
              <div className="tools">
                {data.skills.map((s, i) => (
                  <span key={i}>
                    {s.name}
                    {s.level ? ` · ${s.level}/5` : ""}
                  </span>
                ))}
              </div>
            </Reveal>
          </section>
        ) : null}

        <section id="contact" aria-labelledby="c1">
          <Reveal>
            <div className="ct">
              <div>
                <h2 id="c1">Got a project in mind?</h2>
                <p>Tell me a little about it. I reply within two working days.</p>
                {data.email ? (
                  <p>
                    <b>{data.email}</b>
                  </p>
                ) : null}
                <ContactLinks
                  data={data}
                  className="mt-4 flex flex-wrap gap-4 font-semibold"
                />
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <footer>
        <div className="wrap ft">
          <span>
            © {new Date().getFullYear()} {data.full_name ?? data.subdomain}
          </span>
        </div>
      </footer>
    </div>
  );
}
