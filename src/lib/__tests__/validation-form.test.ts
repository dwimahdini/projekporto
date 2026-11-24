// Tes skema form yang dipakai perbaikan 24 Nov 2026:
// IPK di pendidikan, "masih bekerja" di pengalaman, dan
// teknologi proyek — ketiganya sudah diterima Zod + API
// sejak Tahap 2, tapi form belum punya inputnya, jadi
// data ini tidak pernah bisa masuk dari pengguna.
import { describe, expect, it } from "vitest";
import {
  educationItemSchema,
  experienceItemSchema,
  projectItemSchema,
} from "../validation";

describe("kolom form yang baru diekspos", () => {
  it("IPK diterima 0-4, ditolak di atas 4, boleh kosong", () => {
    const base = { institution: "UIN Suska Riau", degree: "S1", fieldOfStudy: "Teknik Informatika" };
    expect(educationItemSchema.safeParse({ ...base, gpa: 3.75 }).success).toBe(true);
    expect(educationItemSchema.safeParse({ ...base, gpa: 4.5 }).success).toBe(false);
    expect(educationItemSchema.safeParse(base).success).toBe(true);
  });

  it("pengalaman boleh tanpa tanggal selesai kalau masih bekerja", () => {
    const parsed = experienceItemSchema.safeParse({
      company: "PT Kreatif Digital",
      position: "UI/UX Designer",
      startDate: "2023-01-01",
      endDate: "",
      isCurrent: true,
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.isCurrent).toBe(true);
  });

  it("teknologi proyek diterima sebagai daftar, maks 12", () => {
    const base = { title: "Aplikasi Kasir", description: "" };
    expect(
      projectItemSchema.safeParse({ ...base, techStack: ["Figma", "HTML", "CSS"] }).success,
    ).toBe(true);
    expect(
      projectItemSchema.safeParse({ ...base, techStack: Array.from({ length: 13 }, (_, i) => `T${i}`) }).success,
    ).toBe(false);
    expect(projectItemSchema.safeParse(base).success).toBe(true);
  });
});
