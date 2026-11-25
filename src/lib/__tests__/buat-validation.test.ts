// Tes model data alur baru (/buat): schema pencapaian &
// bahasa, daftar master skill, helper kode berbagi & slug,
// dan konversi draft -> PortfolioData.
import { describe, expect, it } from "vitest";
import {
  achievementItemSchema,
  buatDraftSchema,
  languageItemSchema,
  validateImageFile,
  validatePdfFile,
} from "../validation";
import { MASTER_SKILLS } from "../skills-master";
import {
  createShareCode,
  draftToPortfolioData,
  emptyBuatDraft,
  loadBuatDraft,
  slugifyName,
} from "../buat";

describe("achievementItemSchema", () => {
  it("menerima pencapaian lengkap", () => {
    const parsed = achievementItemSchema.safeParse({
      title: "Juara 1 Hackathon",
      issuer: "Pemprov Riau",
      date: "2026-11",
      description: "Juara 1 lomba hackathon tingkat provinsi.",
      documentUrl: "https://contoh.id/sertifikat.pdf",
    });
    expect(parsed.success).toBe(true);
  });

  it("menerima pencapaian hanya dengan judul", () => {
    expect(achievementItemSchema.safeParse({ title: "Lomba Desain" }).success).toBe(true);
  });

  it("menolak judul kosong", () => {
    expect(achievementItemSchema.safeParse({ title: "" }).success).toBe(false);
    expect(achievementItemSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("menolak bulan 13 dan bulan 00", () => {
    const dasar = { title: "Lomba", issuer: "Sekolah" };
    expect(achievementItemSchema.safeParse({ ...dasar, date: "2026-13" }).success).toBe(false);
    expect(achievementItemSchema.safeParse({ ...dasar, date: "2026-00" }).success).toBe(false);
    expect(achievementItemSchema.safeParse({ ...dasar, date: "2026-12" }).success).toBe(true);
    expect(achievementItemSchema.safeParse({ ...dasar, date: "2026-01" }).success).toBe(true);
  });
});

describe("languageItemSchema", () => {
  it("menerima kelima tingkat", () => {
    const tingkat = [
      "Tingkat Dasar",
      "Tingkat Menengah",
      "Tingkat Profesional",
      "Tingkat Profesional Mahir",
      "Tingkat Fasih atau Bahasa Ahli",
    ];
    for (const level of tingkat) {
      expect(languageItemSchema.safeParse({ language: "Inggris", level }).success).toBe(true);
    }
  });

  it("menolak level di luar 5 pilihan", () => {
    expect(
      languageItemSchema.safeParse({ language: "Inggris", level: "Fasih" }).success
    ).toBe(false);
    expect(
      languageItemSchema.safeParse({ language: "Inggris", level: "Native" }).success
    ).toBe(false);
  });

  it("menolak bahasa kosong", () => {
    expect(
      languageItemSchema.safeParse({ language: "", level: "Tingkat Dasar" }).success
    ).toBe(false);
  });
});

describe("MASTER_SKILLS", () => {
  it("tidak kosong, minimal 80 entri", () => {
    expect(MASTER_SKILLS.length).toBeGreaterThanOrEqual(80);
  });

  it("tanpa nama duplikat (case-insensitive)", () => {
    const nama = MASTER_SKILLS.map((s) => s.name.toLowerCase());
    expect(new Set(nama).size).toBe(nama.length);
  });

  it("memuat skill dari data contoh Dwi & Fakhri", () => {
    const nama = new Set(MASTER_SKILLS.map((s) => s.name));
    for (const wajib of [
      "Laravel",
      "Next.js",
      "Microsoft Word",
      "Microsoft Excel",
      "Python",
      "RapidMiner",
      "SQL",
      "Disiplin",
      "Problem Solving",
    ]) {
      expect(nama.has(wajib)).toBe(true);
    }
  });
});

describe("createShareCode", () => {
  it("panjang minimal 12 dan hanya karakter URL-safe", () => {
    const kode = createShareCode();
    expect(kode.length).toBeGreaterThanOrEqual(12);
    expect(kode).toMatch(/^[A-Za-z0-9-_]+$/);
  });

  it("1000 kali unik", () => {
    const semua = new Set(Array.from({ length: 1000 }, () => createShareCode()));
    expect(semua.size).toBe(1000);
  });
});

describe("slugifyName", () => {
  it("spasi jadi strip, huruf besar jadi kecil", () => {
    expect(slugifyName("Dwi Mahdini")).toBe("dwi-mahdini");
    expect(slugifyName("Fakhri Aja")).toBe("fakhri-aja");
  });

  it("karakter aneh dibuang", () => {
    expect(slugifyName("Dwi @ Mahdini! #1")).toBe("dwi-mahdini-1");
    expect(slugifyName("  Budi   Santoso  ")).toBe("budi-santoso");
  });

  it("fallback portofolio kalau kosong", () => {
    expect(slugifyName("")).toBe("portofolio");
    expect(slugifyName("!!!")).toBe("portofolio");
  });
});

describe("draftToPortfolioData", () => {
  it("profile_id terisi, subdomain dari nama, publications & tech_stack kosong", () => {
    const draft = {
      ...emptyBuatDraft(),
      fullName: "Fakhri Aja",
      headline: "Data Analyst",
      city: "Pekanbaru",
      province: "Riau",
      phone: "089561304800",
      whatsapp: "6289561304800",
      projects: [
        {
          title: "Harga Bahan Pokok",
          description: "Website harga bahan pokok.",
          url: "",
          imageUrl: "",
          isVisible: true,
        },
      ],
      achievements: [
        {
          title: "Juara 1 Hackathon",
          issuer: "Pemprov Riau",
          date: "2026-11",
          description: "",
          documentUrl: "",
        },
      ],
      languages: [{ language: "Inggris", level: "Tingkat Menengah" as const }],
      templateId: "minimalis",
    };
    const data = draftToPortfolioData(draft, "minimalis");
    expect(data.profile_id.length).toBeGreaterThan(0);
    expect(data.subdomain).toBe("fakhri-aja");
    expect(data.template_id).toBe("minimalis");
    expect(data.template_name).toBe("Minimalis");
    expect(data.publications).toEqual([]);
    expect(data.projects).toHaveLength(1);
    expect(data.projects[0].tech_stack).toEqual([]);
    expect(data.achievements).toHaveLength(1);
    expect(data.achievements[0].title).toBe("Juara 1 Hackathon");
    expect(data.achievements[0].date).toBe("2026-11");
    expect(data.languages).toEqual([{ language: "Inggris", level: "Tingkat Menengah" }]);
    // Alur baru tanpa email: email selalu null, tapi nomor
    // phone/whatsapp dari draft ditampilkan di portofolio.
    expect(data.email).toBeNull();
    expect(data.phone).toBe("089561304800");
    expect(data.whatsapp).toBe("6289561304800");
    expect(data.location).toBe("Pekanbaru, Riau");
    expect(typeof data.published_at).toBe("string");
  });

  it("template tidak dikenal: template_name fallback ke templateId", () => {
    const data = draftToPortfolioData({ ...emptyBuatDraft(), fullName: "Budi" }, "tidak-ada");
    expect(data.template_name).toBe("tidak-ada");
    expect(data.subdomain).toBe("budi");
  });
});

describe("buatDraftSchema", () => {
  it("menerima URL tanpa protokol dengan menambahkan https://", () => {
    const parsed = buatDraftSchema.safeParse({
      ...emptyBuatDraft(),
      fullName: "Dwi Mahdini",
      websiteUrl: "porto.mahdini.my.id",
      linkedinUrl: "linkedin.com/in/dwimahdini",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.websiteUrl).toBe("https://porto.mahdini.my.id");
      expect(parsed.data.linkedinUrl).toBe("https://linkedin.com/in/dwimahdini");
    }
  });

  it("menolak nama kurang dari 2 karakter", () => {
    const parsed = buatDraftSchema.safeParse({ ...emptyBuatDraft(), fullName: "D" });
    expect(parsed.success).toBe(false);
  });
});

describe("loadBuatDraft di luar browser", () => {
  it("mengembalikan null saat tidak ada window (SSR)", () => {
    expect(loadBuatDraft()).toBeNull();
  });
});

describe("validateImageFile & validatePdfFile", () => {
  it("gambar JPG/PNG/WebP di bawah 2 MB lolos", () => {
    const kecil = new File(["x"], "foto.png", { type: "image/png" });
    expect(validateImageFile(kecil)).toBeNull();
    const gif = new File(["x"], "foto.gif", { type: "image/gif" });
    expect(validateImageFile(gif)).not.toBeNull();
    const besar = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "foto.jpg", {
      type: "image/jpeg",
    });
    expect(validateImageFile(besar)).not.toBeNull();
  });

  it("PDF di bawah 5 MB lolos, selain PDF ditolak", () => {
    const pdf = new File(["x"], "dok.pdf", { type: "application/pdf" });
    expect(validatePdfFile(pdf)).toBeNull();
    const txt = new File(["x"], "dok.txt", { type: "text/plain" });
    expect(validatePdfFile(txt)).not.toBeNull();
  });
});
