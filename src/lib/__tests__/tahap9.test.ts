// Tahap 9 — tiga template MIT baru.
// Prinsip yang dijaga tes ini: template hanya "kulit".
// Tidak ada nama, email, atau data contoh orang yang
// menempel di komponen atau CSS template.
import { describe, it, expect } from "vitest";
import { TEMPLATE_IDS } from "@/lib/types";
import { TEMPLATE_REGISTRY, getTemplate } from "@/lib/templates/registry";
import { CSS_DEVELOPER } from "@/components/templates/mit/developer.css";
import { CSS_DESIGNER } from "@/components/templates/mit/designer.css";
import { CSS_RESUME } from "@/components/templates/mit/resume.css";

describe("registry template MIT", () => {
  it("memuat 11 template (8 lama + 3 ThemeWagon)", () => {
    expect(TEMPLATE_IDS).toHaveLength(11);
    expect(new Set(TEMPLATE_IDS).size).toBe(11); // tanpa duplikat
  });

  it("ketiga id ThemeWagon terdaftar dan punya komponen", () => {
    for (const id of ["logsfolio", "picto", "astrowind"] as const) {
      const meta = getTemplate(id);
      expect(meta).not.toBeNull();
      expect(meta!.id).toBe(id);
      expect(typeof meta!.Component).toBe("function");
    }
  });

  it("pemilih template alur baru hanya 3 template ThemeWagon", async () => {
    const { BUAT_TEMPLATE_IDS, BUAT_TEMPLATE_LIST } = await import(
      "@/lib/templates/registry"
    );
    expect(BUAT_TEMPLATE_IDS).toEqual(["logsfolio", "picto", "astrowind"]);
    expect(BUAT_TEMPLATE_LIST.map((t) => t.id)).toEqual(BUAT_TEMPLATE_IDS);
  });

  it("ketiga id MIT terdaftar dan punya komponen", () => {
    for (const id of ["developer", "desainer", "resume-cv"] as const) {
      const meta = getTemplate(id);
      expect(meta).not.toBeNull();
      expect(meta!.id).toBe(id);
      expect(typeof meta!.Component).toBe("function");
    }
  });

  it("template lama tetap ada (order yang sudah ada tidak rusak)", () => {
    for (const id of [
      "minimalis",
      "gelap-futuristik",
      "kreatif",
      "profesional",
      "visual",
    ] as const) {
      expect(TEMPLATE_REGISTRY[id]).toBeDefined();
    }
  });

  it("id tidak dikenal tetap 404 (null)", () => {
    expect(getTemplate("tidak-ada")).toBeNull();
  });
});

describe("CSS template MIT tidak membawa data contoh", () => {
  const css = [CSS_DEVELOPER, CSS_DESIGNER, CSS_RESUME];
  const forbidden = [
    "Maya",
    "Lena",
    "Aisha",
    "maya.dev",
    "hello@maya",
    "lenapark",
    "Unsplash",
    "mmrahmanbappi.github.io",
  ];
  it("tidak ada nama orang / foto contoh / kredit situs asal", () => {
    for (const c of css) {
      for (const word of forbidden) {
        expect(c).not.toContain(word);
      }
    }
  });

  it("semua selektor dibatasi ke wrapper .tpl- (tidak bocor global)", () => {
    for (const c of css) {
      // Tidak ada aturan yang dimulai dengan selektor elemen telanjang.
      const bare = c.match(/^(body|html|img|a|h1|h2|h3|section|footer|input|label|form)\s*\{/m);
      expect(bare).toBeNull();
      expect(c).toContain(".tpl-");
    }
  });
});
