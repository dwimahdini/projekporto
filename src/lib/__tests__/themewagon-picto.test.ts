// Template Picto (ThemeWagon, MIT) — konversi ke React.
// Prinsip yang dijaga tes ini: template hanya "kulit".
// Tidak ada nama, email, statistik, atau foto contoh orang
// yang menempel di komponen atau CSS template.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { CSS_PICTO } from "@/components/templates/themewagon/picto.css";
import PictoTemplate from "@/components/templates/PictoTemplate";
import { demoPortfolio } from "@/lib/templates/demo-data";
import type { PortfolioData } from "@/lib/types";

const FORBIDDEN = [
  "Brooklyn Gilbert",
  "Brooklyn",
  "example@gmail.com",
  "mymail@mail.com",
  "Unsplash",
  "250+",
  "15 Y",
  "New Mexico",
  "London, England",
];

const COMPONENT_PATH = join(
  process.cwd(),
  "src/components/templates/PictoTemplate.tsx",
);

describe("CSS Picto tidak membawa data contoh", () => {
  it("tidak ada nama orang / email / statistik / foto contoh", () => {
    for (const word of FORBIDDEN) {
      expect(CSS_PICTO).not.toContain(word);
    }
  });

  it("semua selektor dibatasi ke wrapper .tpl-picto (tidak bocor global)", () => {
    const bare = CSS_PICTO.match(
      /^(body|html|img|a|h1|h2|h3|section|footer|input|label|form)\s*\{/m,
    );
    expect(bare).toBeNull();
    expect(CSS_PICTO).toContain(".tpl-picto");
    // Setiap aturan diawali .tpl-picto (atau @media).
    for (const line of CSS_PICTO.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("@") || trimmed === "}") continue;
      expect(trimmed.startsWith(".tpl-picto")).toBe(true);
    }
  });

  it("memakai warna asli Picto dan bukan unduhan font baru", () => {
    expect(CSS_PICTO).toContain("#9929fb");
    expect(CSS_PICTO).toContain("#f0f1f3");
    expect(CSS_PICTO).not.toContain("@import");
  });
});

describe("Komponen Picto tidak membawa data contoh", () => {
  const src = readFileSync(COMPONENT_PATH, "utf8");

  it("tidak ada nama / email / statistik contoh di source komponen", () => {
    for (const word of FORBIDDEN) {
      expect(src).not.toContain(word);
    }
  });

  it("footer mempertahankan kredit ThemeWagon", () => {
    expect(src).toContain("themewagon.com");
    expect(src).toContain("ThemeWagon");
  });

  it("tidak ada form kontak, preloader, atau hotlink gambar contoh", () => {
    expect(src).not.toContain("<form");
    expect(src).not.toContain("HashLoader");
    expect(src).not.toContain("unsplash");
    expect(src).not.toContain("picsum");
  });
});

describe("Render Picto dengan data contoh", () => {
  const data = {
    ...demoPortfolio,
    achievements: [
      {
        title: "Juara 1 Hackathon",
        issuer: "Kampus",
        date: "2025-05-01",
        description: "Membangun aplikasi dalam 24 jam.",
        document_url: "https://example.com/sertifikat.pdf",
      },
    ],
    languages: [
      { language: "Indonesia", level: "Fasih" },
      { language: "Inggris", level: "Menengah" },
    ],
  } as unknown as PortfolioData;

  const html = renderToString(createElement(PictoTemplate, { data }));

  it("menampilkan nama, headline, dan bio dari data", () => {
    expect(html).toContain("Dwi Mahdini");
    expect(html).toContain("Fullstack Web Developer");
    expect(html).toContain("Lulusan S1 Teknik Informatika");
  });

  it("statistik hero hanya angka nyata dari data (4 proyek, 2 pengalaman, 7 skill)", () => {
    expect(html).toContain(">4<");
    expect(html).toContain(">2<");
    expect(html).toContain(">7<");
    expect(html).not.toContain("250+");
  });

  it("menampilkan section tambahan: pendidikan, pencapaian, bahasa", () => {
    expect(html).toContain("Education");
    expect(html).toContain("UIN Suska Riau");
    expect(html).toContain("Pencapaian");
    expect(html).toContain("Juara 1 Hackathon");
    expect(html).toContain("Bahasa");
    expect(html).toContain("Indonesia");
  });

  it("menampilkan proyek dan skill dari data, tanpa gambar karangan", () => {
    expect(html).toContain("Toko Digital Lynk.id");
    expect(html).toContain("Laravel");
    expect(html).not.toContain("Unsplash");
  });

  it("tidak menampilkan section yang dibuang", () => {
    expect(html).not.toContain("Testimonial");
    expect(html).not.toContain("Happy Clients");
  });

  it("footer memuat kredit ThemeWagon", () => {
    expect(html).toContain("themewagon.com");
    expect(html).toContain("ThemeWagon");
  });
});
