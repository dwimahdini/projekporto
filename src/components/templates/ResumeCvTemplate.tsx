"use client";
// Template Resume & CV — konversi dari template MIT
// "Resume and CV" oleh mmrahmanbappi
// (100-free-html-templates, lisensi MIT — lihat docs/LICENSES.md).
// Desain asli dipertahankan (CSS di ./mit/resume.css.ts,
// dibatasi ke .tpl-resume), termasuk tombol Print/Save as PDF
// yang memang fitur asli template ini. Semua isi berasal
// dari data form klien — tidak ada nama/teks contoh yang tersisa.
// Bagian yang tidak punya data di form sengaja DIHAPUS:
// Languages (form tidak punya kolom bahasa) dan References
// (form tidak punya kolom referensi).
// Publikasi ditambahkan sebagai seksi baru dengan gaya h2
// yang sama, supaya data publikasi klien tidak hilang.
import type { PortfolioData } from "@/lib/types";
import { Reveal, Avatar, formatDate, formatRange } from "./shared";
import { CSS_RESUME } from "./mit/resume.css";

export default function ResumeCvTemplate({ data }: { data: PortfolioData }) {
  const hasContact = data.location || data.email || data.phone || data.linkedin_url;

  // Deskripsi pengalaman dipisah per "•" menjadi poin-poin CV.
  const bullets = (text: string | null): string[] =>
    (text ?? "")
      .split("•")
      .map((b) => b.trim())
      .filter(Boolean);

  return (
    <div className="tpl-resume">
      <style>{CSS_RESUME}</style>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="bar">
        <div className="in">
          <ul className="menu" id="menu">
            {data.experiences.length > 0 ? (
              <li>
                <a href="#experience">Experience</a>
              </li>
            ) : null}
            {data.education.length > 0 ? (
              <li>
                <a href="#education">Education</a>
              </li>
            ) : null}
          </ul>
          <div className="g">
            <button type="button" onClick={() => window.print()}>
              Print or save as PDF
            </button>
            {data.email ? <a href={`mailto:${data.email}`}>Email me</a> : null}
          </div>
        </div>
      </div>

      <main id="main">
        <Reveal>
          <article className="page" aria-labelledby="h1">
            <aside className="side">
              <Avatar
                data={data}
                className="mb-[18px] h-[140px] w-[140px] rounded-full border-4 border-white object-cover"
              />
              {hasContact ? (
                <>
                  <h2>Contact</h2>
                  <ul>
                    {data.location ? <li>{data.location}</li> : null}
                    {data.email ? <li>{data.email}</li> : null}
                    {data.phone ? <li>{data.phone}</li> : null}
                    {data.linkedin_url ? (
                      <li>
                        <a
                          href={data.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data.linkedin_url.replace(/^https?:\/\/(www\.)?/, "")}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </>
              ) : null}

              {data.skills.length > 0 ? (
                <>
                  <h2>Skills</h2>
                  {data.skills.map((s, i) => (
                    <div className="sk" key={i}>
                      {s.name}
                      <div className="t">
                        <i
                          style={{ width: `${((s.level ?? 3) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </>
              ) : null}

              {data.certifications.length > 0 ? (
                <>
                  <h2>Certificates</h2>
                  <ul>
                    {data.certifications.map((c, i) => (
                      <li key={i}>
                        {c.name}
                        {c.issuer ? `, ${c.issuer}` : ""}
                        {c.issue_date ? `, ${formatDate(c.issue_date)}` : ""}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </aside>

            <div className="main">
              <h1 id="h1">{data.full_name ?? data.subdomain}</h1>
              {data.headline ? (
                <div className="role">{data.headline}</div>
              ) : null}
              {data.bio ? <p className="sum">{data.bio}</p> : null}

              {data.experiences.length > 0 ? (
                <>
                  <h2 id="experience">Work experience</h2>
                  {data.experiences.map((x, i) => {
                    const points = bullets(x.description);
                    return (
                      <div className="job" key={i}>
                        <div className="top">
                          <h3>
                            {x.position} ·{" "}
                            <span className="co">{x.company}</span>
                          </h3>
                          <time>
                            {formatRange(
                              x.start_date,
                              x.end_date,
                              x.is_current,
                            )}
                          </time>
                        </div>
                        {points.length > 1 ? (
                          <ul>
                            {points.map((p, j) => (
                              <li key={j}>{p}</li>
                            ))}
                          </ul>
                        ) : points.length === 1 ? (
                          <p>{points[0]}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </>
              ) : null}

              {data.education.length > 0 ? (
                <>
                  <h2 id="education">Education</h2>
                  {data.education.map((e, i) => (
                    <div className="edu" key={i}>
                      <div>
                        <b>
                          {[e.degree, e.field_of_study]
                            .filter(Boolean)
                            .join(" ")}
                        </b>
                        <span>{e.institution}</span>
                        {e.gpa ? <span>{`IPK ${e.gpa}`}</span> : null}
                      </div>
                      <span>{formatRange(e.start_date, e.end_date)}</span>
                    </div>
                  ))}
                </>
              ) : null}

              {data.projects.length > 0 ? (
                <>
                  <h2 id="projects">Projects</h2>
                  {data.projects.map((p, i) => (
                    <div className="job" key={i}>
                      <div className="top">
                        <h3>{p.title}</h3>
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
                      {p.description ? <p>{p.description}</p> : null}
                      {p.tech_stack.length > 0 ? (
                        <p>
                          <span className="co">{p.tech_stack.join(" · ")}</span>
                        </p>
                      ) : null}
                    </div>
                  ))}
                </>
              ) : null}

              {data.publications.length > 0 ? (
                <>
                  <h2 id="publications">Publications</h2>
                  {data.publications.map((p, i) => (
                    <div className="job" key={i}>
                      <div className="top">
                        <h3>{p.title}</h3>
                        {p.published_date ? (
                          <time>{formatDate(p.published_date)}</time>
                        ) : null}
                      </div>
                      {p.publisher ? <p>{p.publisher}</p> : null}
                      {p.description ? <p>{p.description}</p> : null}
                      {p.url ? (
                        <p>
                          <a
                            href={p.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Read
                          </a>
                        </p>
                      ) : null}
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </article>
        </Reveal>
      </main>
    </div>
  );
}
