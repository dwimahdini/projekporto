// Logsfolio (ThemeWagon) — template hanya "kulit".
// Tidak ada nama, email, atau data contoh dari data.json
// Logsfolio yang menempel di komponen atau CSS template.
// Lingkungan vitest di sini "node" (lihat vitest.config.ts),
// jadi tes ini memakai string CSS + isi file komponen
// (fs.readFileSync), bukan render.
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import fs from "fs";
import path from "path";
import type { PortfolioData } from "@/lib/types";
import { demoPortfolio } from "@/lib/templates/demo-data";
import LogsfolioTemplate from "@/components/templates/LogsfolioTemplate";
import { CSS_LOGSFOLIO } from "@/components/templates/themewagon/logsfolio.css";

const componentSrc = fs.readFileSync(
  path.join(process.cwd(), "src/components/templates/LogsfolioTemplate.tsx"),
  "utf8",
);

const forbidden = [
  "Arif Hossain",
  "devarifhossain",
  "Dhaka",
  "Unsplash",
  "Makers Tracker",
  "Pricing Bees",
  "Indie Hustles",
  "Tech Corp",
  "Web Solutions",
  "Jane Smith",
  "Mike Johnson",
];

describe("CSS Logsfolio tidak membawa data contoh", () => {
  it("tidak ada nama orang / proyek contoh / foto contoh", () => {
    for (const word of forbidden) {
      expect(CSS_LOGSFOLIO).not.toContain(word);
    }
  });

  it("semua selektor dibatasi ke wrapper .tpl-logsfolio (tidak bocor global)", () => {
    const bare = CSS_LOGSFOLIO.match(
      /^(body|html|img|a|h1|h2|h3|section|footer|input|label|form)\s*\{/m,
    );
    expect(bare).toBeNull();
    expect(CSS_LOGSFOLIO).toContain(".tpl-logsfolio");
    // Setiap selektor sebelum "{" harus diawali .tpl-logsfolio
    // (kecuali pembuka @media).
    const selectorChunks = CSS_LOGSFOLIO.split("{").slice(0, -1);
    for (const chunk of selectorChunks) {
      const before = chunk.split("}").pop()!.trim();
      if (!before) continue;
      for (const sel of before.split(",")) {
        const s = sel.trim();
        if (!s) continue;
        if (s.startsWith("@media")) continue;
        expect(s.startsWith(".tpl-logsfolio")).toBe(true);
      }
    }
  });

  it("menyediakan varian gelap (.tpl-logsfolio.dark)", () => {
    expect(CSS_LOGSFOLIO).toContain(".tpl-logsfolio.dark");
  });
});

describe("Komponen Logsfolio tidak membawa data contoh", () => {
  it("tidak ada nama orang / proyek contoh / foto contoh", () => {
    for (const word of forbidden) {
      expect(componentSrc).not.toContain(word);
    }
  });

  it("mempertahankan kredit asli Logging Studio / ThemeWagon", () => {
    expect(componentSrc).toContain("All rights reserved by");
    expect(componentSrc).toContain("Logging Studio");
    expect(componentSrc).toContain("ThemeWagon");
    expect(componentSrc).toContain("https://themewagon.com");
  });

  it("client component dengan section yang dipersyaratkan", () => {
    expect(componentSrc).toContain('"use client"');
    for (const section of [
      "Work Experience",
      "My Projects",
      "Education",
      "Sertifikasi",
      "Pencapaian",
      "Bahasa",
    ]) {
      expect(componentSrc).toContain(section);
    }
    // Bagian tanpa field di form sengaja dibuang.
    expect(componentSrc).not.toContain("Testimonials");
    expect(componentSrc).not.toContain("Blogs");
  });
});

describe("Render LogsfolioTemplate", () => {
  it("merender sertifikasi dari data demo", () => {
    const html = renderToString(createElement(LogsfolioTemplate, { data: demoPortfolio }));
    expect(html).toContain('id="certifications"');
    expect(html).toContain("Intro to Front-End Development");
    expect(html).toContain("DXIP03SSFWK2");
  });

  it("tidak merender section sertifikasi bila datanya kosong", () => {
    const data = { ...demoPortfolio, certifications: [] } as unknown as PortfolioData;
    const html = renderToString(createElement(LogsfolioTemplate, { data }));
    expect(html).not.toContain('id="certifications"');
  });
});
