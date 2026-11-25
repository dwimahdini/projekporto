// Template Astrowind (ThemeWagon / onWidget, MIT).
// Prinsip yang dijaga tes ini: template hanya "kulit" — tidak ada
// nama, foto, atau data contoh orang dari halaman demo personal.astro
// yang menempel di komponen atau CSS template.
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import fs from "fs";
import path from "path";
import type { PortfolioData } from "@/lib/types";
import { demoPortfolio } from "@/lib/templates/demo-data";
import AstrowindTemplate from "@/components/templates/AstrowindTemplate";
import { CSS_ASTROWIND } from "@/components/templates/themewagon/astrowind.css";

const forbidden = ["Sarah Johnson", "Unsplash", "Porfolio", "arthelokyo"];

const componentSource = fs.readFileSync(
  path.resolve(__dirname, "../../components/templates/AstrowindTemplate.tsx"),
  "utf-8",
);

describe("CSS Astrowind tidak membawa data contoh", () => {
  it("tidak ada nama orang / foto contoh / typo bawaan", () => {
    for (const word of forbidden) {
      expect(CSS_ASTROWIND).not.toContain(word);
    }
  });

  it("semua selektor dibatasi ke wrapper .tpl-astrowind (tidak bocor global)", () => {
    const bare = CSS_ASTROWIND.match(
      /^(body|html|img|a|h1|h2|h3|section|footer|input|label|form)\s*\{/m,
    );
    expect(bare).toBeNull();
    expect(CSS_ASTROWIND).toContain(".tpl-astrowind");
    // Setiap aturan diawali .tpl-astrowind (termasuk di dalam @media).
    for (const line of CSS_ASTROWIND.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("@") || trimmed === "}") continue;
      expect(trimmed.startsWith(".tpl-astrowind")).toBe(true);
    }
  });

  it("menyediakan variabel mode gelap", () => {
    expect(CSS_ASTROWIND).toContain(".tpl-astrowind.dark");
  });
});

describe("Komponen Astrowind tidak membawa data contoh", () => {
  it("tidak ada nama orang / foto contoh / typo bawaan di source", () => {
    for (const word of forbidden) {
      expect(componentSource).not.toContain(word);
    }
  });

  it("mempertahankan kredit asli ThemeWagon + onWidget", () => {
    expect(componentSource).toContain("ThemeWagon");
    expect(componentSource).toContain("https://themewagon.com");
    expect(componentSource).toContain("onWidget");
  });
});

describe("Render AstrowindTemplate", () => {
  it("merender data demo tanpa kata terlarang", () => {
    const html = renderToString(createElement(AstrowindTemplate, { data: demoPortfolio }));
    expect(html).toContain("Dwi Mahdini");
    expect(html).toContain("Fullstack Web Developer");
    expect(html).toContain('id="portfolio"');
    expect(html).toContain("IPK 3.58");
    for (const word of forbidden) {
      expect(html).not.toContain(word);
    }
  });

  it("merender pencapaian dan bahasa bila datanya ada", () => {
    const data = {
      ...demoPortfolio,
      achievements: [
        {
          title: "Juara 1 Lomba Web",
          issuer: "Kampus",
          date: "2025-03-01",
          description: "Lomba membuat website.",
          document_url: "https://example.com/doc.pdf",
        },
      ],
      languages: [
        { language: "Indonesia", level: "Native" },
        { language: "Inggris", level: "Menengah" },
      ],
    } as unknown as PortfolioData;
    const html = renderToString(createElement(AstrowindTemplate, { data }));
    expect(html).toContain("Juara 1 Lomba Web");
    expect(html).toContain("https://example.com/doc.pdf");
    expect(html).toContain("Indonesia");
    expect(html).toContain("Inggris");
  });

  it("tidak merender section pencapaian/bahasa bila datanya kosong", () => {
    // Data kosong dibuat eksplisit — data demo kini berisi
    // 1 pencapaian contoh, jadi tidak bisa lagi dipakai
    // untuk kasus "kosong".
    const data = { ...demoPortfolio, achievements: [], languages: [] } as unknown as PortfolioData;
    const html = renderToString(createElement(AstrowindTemplate, { data }));
    expect(html).not.toContain('id="achievements"');
    expect(html).not.toContain('id="languages"');
  });

  it("merender sertifikasi bila datanya ada", () => {
    const data = {
      ...demoPortfolio,
      certifications: [
        {
          name: "Meta Intro to Front-End Development",
          issuer: "Meta",
          issue_date: "2026-08-18",
          expiry_date: null,
          credential_id: "DXIP03SSFWK2",
          credential_url: "https://coursera.org/verify/DXIP03SSFWK2",
        },
      ],
    } as unknown as PortfolioData;
    const html = renderToString(createElement(AstrowindTemplate, { data }));
    expect(html).toContain('id="certifications"');
    expect(html).toContain("Meta Intro to Front-End Development");
    expect(html).toContain("DXIP03SSFWK2");
    expect(html).toContain("https://coursera.org/verify/DXIP03SSFWK2");
  });

  it("tidak merender section sertifikasi bila datanya kosong", () => {
    const data = { ...demoPortfolio, certifications: [] } as unknown as PortfolioData;
    const html = renderToString(createElement(AstrowindTemplate, { data }));
    expect(html).not.toContain('id="certifications"');
  });
});
