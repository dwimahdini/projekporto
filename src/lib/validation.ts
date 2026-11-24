import { z } from "zod";
import { FORBIDDEN_SUBDOMAINS } from "./types";

// Subdomain: huruf kecil, angka, strip di tengah, 3-30 karakter.
// Daftar terlarang dicek di sini (lapisan aplikasi) DAN
// di database (unique + CHECK regex) sebagai lapisan kedua.
export const subdomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Subdomain minimal 3 karakter")
  .max(30, "Subdomain maksimal 30 karakter")
  .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])$/, "Hanya huruf, angka, dan strip di tengah")
  .refine((v) => !(FORBIDDEN_SUBDOMAINS as readonly string[]).includes(v), {
    message: "Subdomain ini tidak boleh dipakai",
  });

export const phoneSchema = z
  .string()
  .trim()
  .min(9, "Nomor HP minimal 9 digit")
  .max(16, "Nomor HP maksimal 16 digit")
  .regex(/^(\+62|62|0)[0-9]+$/, "Nomor HP harus angka, boleh diawali +62 / 62 / 0");

// Langkah 1: email dulu + subdomain + template + persetujuan privasi.
// Checkbox privasi WAJIB — tanpa ini order tidak dibuat.
export const orderStep1Schema = z.object({
  email: z.string().email("Email tidak valid"),
  subdomain: subdomainSchema,
  templateId: z.string().min(1, "Pilih 1 template"),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: "Kamu harus menyetujui Kebijakan Privasi" }),
  }),
  turnstileToken: z.string().min(1, "Verifikasi keamanan wajib diisi"),
});

// Langkah 2: identitas. Setiap field pribadi punya toggle
// "Tampilkan di portofolio" — toggle itu disimpan terpisah
// di profile_visibility, bukan di schema ini.
export const identitySchema = z.object({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  headline: z.string().trim().max(120).optional().or(z.literal("")),
  bio: z.string().trim().max(1000).optional().or(z.literal("")),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal lahir tidak valid").optional().or(z.literal("")),
  gender: z.enum(["laki-laki", "perempuan", "lainnya", "tidak-ingin-menjawab"]).optional(),
  nationality: z.string().trim().max(60).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  province: z.string().trim().max(80).optional().or(z.literal("")),
  postalCode: z.string().trim().max(10).optional().or(z.literal("")),
  phone: phoneSchema.optional().or(z.literal("")),
  whatsapp: phoneSchema.optional().or(z.literal("")),
  email: z.string().email("Email tidak valid"),
  websiteUrl: z.string().url("URL website tidak valid").optional().or(z.literal("")),
  linkedinUrl: z.string().url("URL LinkedIn tidak valid").optional().or(z.literal("")),
  githubUrl: z.string().url("URL GitHub tidak valid").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL Instagram tidak valid").optional().or(z.literal("")),
  photoUrl: z.string().url().optional().or(z.literal("")),
});

// Daftar berulang: pendidikan / pengalaman / proyek / skill /
// sertifikasi / publikasi. Tiap baris bisa disembunyikan
// (isVisible) tanpa dihapus.
export const educationItemSchema = z.object({
  institution: z.string().trim().min(1, "Institusi wajib diisi").max(150),
  degree: z.string().trim().max(80).optional().or(z.literal("")),
  fieldOfStudy: z.string().trim().max(100).optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  gpa: z.number().min(0).max(4).optional(),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isVisible: z.boolean().default(true),
});

export const experienceItemSchema = z.object({
  company: z.string().trim().min(1, "Perusahaan wajib diisi").max(150),
  position: z.string().trim().min(1, "Posisi wajib diisi").max(120),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  isCurrent: z.boolean().default(false),
  description: z.string().trim().max(800).optional().or(z.literal("")),
  isVisible: z.boolean().default(true),
});

export const projectItemSchema = z.object({
  title: z.string().trim().min(1, "Judul proyek wajib diisi").max(150),
  description: z.string().trim().max(800).optional().or(z.literal("")),
  url: z.string().url("URL proyek tidak valid").optional().or(z.literal("")),
  imageUrl: z.string().url().optional().or(z.literal("")),
  techStack: z.array(z.string().trim().max(40)).max(12).default([]),
  isVisible: z.boolean().default(true),
});

export const skillItemSchema = z.object({
  name: z.string().trim().min(1, "Nama skill wajib diisi").max(60),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  level: z.number().int().min(1).max(5).optional(),
  isVisible: z.boolean().default(true),
});

export const certificationItemSchema = z.object({
  name: z.string().trim().min(1, "Nama sertifikasi wajib diisi").max(150),
  issuer: z.string().trim().max(120).optional().or(z.literal("")),
  issueDate: z.string().optional().or(z.literal("")),
  expiryDate: z.string().optional().or(z.literal("")),
  credentialId: z.string().trim().max(100).optional().or(z.literal("")),
  credentialUrl: z.string().url("URL kredensial tidak valid").optional().or(z.literal("")),
  isVisible: z.boolean().default(true),
});

export const publicationItemSchema = z.object({
  title: z.string().trim().min(1, "Judul publikasi wajib diisi").max(200),
  publisher: z.string().trim().max(120).optional().or(z.literal("")),
  publishedDate: z.string().optional().or(z.literal("")),
  url: z.string().url("URL publikasi tidak valid").optional().or(z.literal("")),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  isVisible: z.boolean().default(true),
});

// Langkah 7: preferensi tampil. Kunci = nama field di
// profile_visibility. Nilai true = tampil di portofolio.
export const visibilitySchema = z.record(z.string(), z.boolean());

// Autosave per langkah: server menerima { step, data } dan
// memvalidasi hanya langkah itu. Token dicek dulu di route.
export const autosaveSchema = z.object({
  step: z.enum(["identity", "education", "experiences", "projects", "skills", "certifications", "publications", "visibility"]),
  data: z.unknown(),
});

export const otpRequestSchema = z.object({
  purpose: z.enum(["edit-private", "resend-link"]).default("edit-private"),
  turnstileToken: z.string().min(1).optional(),
});

export const otpVerifySchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Kode OTP harus 6 digit angka"),
  purpose: z.enum(["edit-private", "resend-link"]).default("edit-private"),
});

export const lookupSchema = z.object({
  email: z.string().email("Email tidak valid"),
  turnstileToken: z.string().min(1, "Verifikasi keamanan wajib diisi"),
});

// Teknologi proyek: teks "Figma, HTML, CSS" -> ["Figma", "HTML", "CSS"].
// Dipanggil saat menyimpan (OrderForm.saveStep), BUKAN saat mengetik:
// parse-di-setiap-ketikan merusak input karena nilai yang tampil
// selalu dirender ulang dari hasil parse (koma dan spasi hilang).
export function parseTechStackText(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Token: 32 byte acak -> 64 karakter hex. Disimpan sebagai
// SHA-256 hash di orders.token_hash. Jangan simpan token asli.
export function createOrderToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}
