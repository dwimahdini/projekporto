// Tipe & helper alur baru (/buat): isi form, simpan
// draft di localStorage, lalu ubah jadi PortfolioData
// untuk pratinjau template. File ini dipakai di client
// component — jangan import yang server-only di sini.
import type { z } from "zod";
import type { PortfolioData } from "./types";
import type {
  achievementItemSchema,
  buatCertificationItemSchema,
  buatEducationItemSchema,
  buatExperienceItemSchema,
  buatProjectItemSchema,
  buatSkillItemSchema,
  languageItemSchema,
} from "./validation";
import { buatDraftSchema } from "./validation";
import { getTemplate } from "./templates/registry";

export type BuatEducationItem = z.infer<typeof buatEducationItemSchema>;
export type BuatExperienceItem = z.infer<typeof buatExperienceItemSchema>;
export type BuatProjectItem = z.infer<typeof buatProjectItemSchema>;
export type BuatSkillItem = z.infer<typeof buatSkillItemSchema>;
export type BuatCertificationItem = z.infer<typeof buatCertificationItemSchema>;
export type BuatAchievementItem = z.infer<typeof achievementItemSchema>;
export type BuatLanguageItem = z.infer<typeof languageItemSchema>;

// State form alur baru. String kosong = belum diisi.
// photoUrl & templateId null = belum dipilih.
export interface BuatDraft {
  fullName: string;
  headline: string;
  bio: string;
  photoUrl: string | null;
  phone: string;
  whatsapp: string;
  city: string;
  province: string;
  websiteUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  instagramUrl: string;
  education: BuatEducationItem[];
  experiences: BuatExperienceItem[];
  projects: BuatProjectItem[];
  skills: BuatSkillItem[];
  certifications: BuatCertificationItem[];
  achievements: BuatAchievementItem[];
  languages: BuatLanguageItem[];
  templateId: string | null;
}

export const BUAT_DRAFT_KEY = "buat-draft-v1";

export function loadBuatDraft(): BuatDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const mentah = window.localStorage.getItem(BUAT_DRAFT_KEY);
    if (!mentah) return null;
    return JSON.parse(mentah) as BuatDraft;
  } catch {
    return null;
  }
}

export function saveBuatDraft(draft: BuatDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BUAT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Penyimpanan penuh / privat: draft tetap di memori form.
  }
}

// Validasi data mentah (dari localStorage / body API) dengan
// schema draft, lalu gabung di atas draft kosong supaya field
// yang hilang (misal dari versi lama) tetap punya nilai
// default. Kembalikan null kalau datanya tidak valid.
// Urutan: gabung dulu ke draft kosong (supaya array wajib
// seperti education tidak kosong dari sumbernya), baru
// validasi hasil gabungan dengan schema.
export function normalizeBuatDraft(mentah: unknown): BuatDraft | null {
  if (!mentah || typeof mentah !== "object" || Array.isArray(mentah)) return null;
  const calon = { ...emptyBuatDraft(), ...(mentah as Partial<BuatDraft>) };
  const parsed = buatDraftSchema.safeParse(calon);
  if (!parsed.success) return null;
  const gabung = emptyBuatDraft();
  for (const [kunci, nilai] of Object.entries(parsed.data)) {
    if (nilai !== undefined) {
      (gabung as unknown as Record<string, unknown>)[kunci] = nilai;
    }
  }
  return gabung;
}

// Muat draft dari localStorage lalu validasi dengan schema.
// Kembalikan null kalau tidak ada draft atau tidak valid.
export function loadValidatedBuatDraft(): BuatDraft | null {
  return normalizeBuatDraft(loadBuatDraft());
}

export function emptyBuatDraft(): BuatDraft {
  return {
    fullName: "",
    headline: "",
    bio: "",
    photoUrl: null,
    phone: "",
    whatsapp: "",
    city: "",
    province: "",
    websiteUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    instagramUrl: "",
    education: [],
    experiences: [],
    projects: [],
    skills: [],
    certifications: [],
    achievements: [],
    languages: [],
    templateId: null,
  };
}

// "Dwi Mahdini" -> "dwi-mahdini". Hanya a-z, 0-9, strip.
// Kosong / tanpa karakter valid -> "portofolio".
export function slugifyName(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "portofolio";
}

// Kode berbagi 16 karakter URL-safe (A-Z, a-z, 0-9, - _),
// 16 byte acak kriptografis = 96 bit entropi.
export function createShareCode(): string {
  const alfabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let kode = "";
  for (const b of bytes) kode += alfabet[b & 63];
  return kode;
}

function kosongKeNull(nilai: string | undefined): string | null {
  if (!nilai) return null;
  const rapi = nilai.trim();
  return rapi === "" ? null : rapi;
}

// Draft form -> PortfolioData untuk pratinjau template.
// profile_id acak tiap konversi; subdomain HANYA untuk
// tampilan di template, bukan subdomain sungguhan.
// Alur baru tanpa email: email selalu null (form baru tidak
// meminta email). Nomor phone/whatsapp dari draft DITAMPILKAN
// di portofolio.
// Form baru tidak memakai publikasi, jadi publications
// selalu kosong; proyek tanpa tech_stack.
export function draftToPortfolioData(
  draft: BuatDraft,
  templateId: string
): PortfolioData {
  const lokasi = [draft.city, draft.province]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
  return {
    profile_id: crypto.randomUUID(),
    subdomain: slugifyName(draft.fullName),
    template_id: templateId,
    template_name: getTemplate(templateId)?.name ?? templateId,
    full_name: draft.fullName,
    headline: kosongKeNull(draft.headline),
    bio: kosongKeNull(draft.bio),
    location: lokasi === "" ? null : lokasi,
    photo_url: draft.photoUrl,
    website_url: kosongKeNull(draft.websiteUrl),
    linkedin_url: kosongKeNull(draft.linkedinUrl),
    github_url: kosongKeNull(draft.githubUrl),
    instagram_url: kosongKeNull(draft.instagramUrl),
    email: null,
    phone: kosongKeNull(draft.phone),
    whatsapp: kosongKeNull(draft.whatsapp),
    education: draft.education.map((item) => ({
      institution: item.institution,
      degree: kosongKeNull(item.degree),
      field_of_study: kosongKeNull(item.fieldOfStudy),
      start_date: kosongKeNull(item.startDate),
      end_date: kosongKeNull(item.endDate),
      gpa: item.gpa ?? null,
      description: kosongKeNull(item.description),
    })),
    experiences: draft.experiences.map((item) => ({
      company: item.company,
      position: item.position,
      start_date: kosongKeNull(item.startDate),
      end_date: kosongKeNull(item.endDate),
      is_current: item.isCurrent,
      description: kosongKeNull(item.description),
    })),
    projects: draft.projects.map((item) => ({
      title: item.title,
      description: kosongKeNull(item.description),
      url: kosongKeNull(item.url),
      image_url: kosongKeNull(item.imageUrl),
      tech_stack: [],
    })),
    skills: draft.skills.map((item) => ({
      name: item.name,
      category: kosongKeNull(item.category),
      level: item.level ?? null,
    })),
    certifications: draft.certifications.map((item) => ({
      name: item.name,
      issuer: kosongKeNull(item.issuer),
      issue_date: kosongKeNull(item.issueDate),
      expiry_date: kosongKeNull(item.expiryDate),
      credential_id: kosongKeNull(item.credentialId),
      credential_url: kosongKeNull(item.credentialUrl),
    })),
    publications: [],
    achievements: draft.achievements.map((item) => ({
      title: item.title,
      issuer: kosongKeNull(item.issuer),
      date: kosongKeNull(item.date),
      description: kosongKeNull(item.description),
      document_url: kosongKeNull(item.documentUrl),
    })),
    languages: draft.languages.map((item) => ({
      language: item.language,
      level: item.level,
    })),
    published_at: new Date().toISOString(),
  };
}
