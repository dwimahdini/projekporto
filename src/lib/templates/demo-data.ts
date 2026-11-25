// Data contoh untuk /demo/[template] — persona FIKTIF "John Alex".
// Bentuknya SAMA dengan PortfolioData dari view public_portfolio,
// jadi yang kamu lihat di demo adalah yang akan tampil di
// portofolio asli klien. Semua nama, perusahaan, dan alamat di
// sini karangan — JANGAN pakai data orang asli di file ini.
// Email/telepon tampil apa adanya karena nilainya contoh.
import type { PortfolioData } from "@/lib/types";

export const demoPortfolio: PortfolioData = {
  profile_id: "demo-john-alex",
  subdomain: "johnalex",
  template_id: "minimalis",
  template_name: "Minimalis",
  full_name: "John Alex",
  headline: "Fullstack Web Developer",
  bio: "Lulusan S1 Ilmu Komputer Universitas XYZ. Membangun website dengan Laravel, Next.js, dan MySQL/PostgreSQL. Fokus ke website yang cepat, rapi, dan mudah dipakai.",
  location: "Jakarta, Indonesia",
  photo_url: null,
  website_url: "https://johnalex.example.com",
  linkedin_url: null,
  github_url: null,
  instagram_url: null,
  email: "john.alex@example.com",
  phone: "+6281234567890",
  whatsapp: "+6281234567890",
  education: [
    {
      institution: "Universitas XYZ",
      degree: "S1",
      field_of_study: "Ilmu Komputer",
      start_date: "2020-08-01",
      end_date: "2024-06-01",
      gpa: 3.5,
      description: null,
    },
  ],
  experiences: [
    {
      company: "PT Contoh Teknologi",
      position: "Web Developer",
      start_date: "2023-01-01",
      end_date: null,
      is_current: true,
      description: "Membangun dan merawat website perusahaan dengan Laravel dan Next.js.",
    },
    {
      company: "Freelance",
      position: "Web Developer",
      start_date: "2022-01-01",
      end_date: null,
      is_current: true,
      description: "Membangun website portofolio, toko online, dan aplikasi kasir untuk klien.",
    },
  ],
  projects: [
    {
      title: "Website Toko Online Contoh",
      description: "Toko online fiktif: katalog produk, keranjang, dan checkout sederhana.",
      url: null,
      image_url: null,
      tech_stack: ["Next.js", "Tailwind CSS"],
    },
    {
      title: "Aplikasi Kasir Sederhana",
      description: "Aplikasi kasir fiktif: pencatatan penjualan dan laporan harian.",
      url: null,
      image_url: null,
      tech_stack: ["Laravel", "MySQL"],
    },
  ],
  skills: [
    { name: "Laravel", category: "Backend", level: 4 },
    { name: "Next.js", category: "Frontend", level: 4 },
    { name: "JavaScript", category: "Bahasa", level: 4 },
    { name: "TypeScript", category: "Bahasa", level: 3 },
    { name: "MySQL", category: "Database", level: 4 },
    { name: "PostgreSQL", category: "Database", level: 3 },
    { name: "Android Studio", category: "Mobile", level: 3 },
  ],
  certifications: [
    { name: "Responsive Web Design", issuer: "freeCodeCamp", issue_date: "2024-09-25", expiry_date: null, credential_id: null, credential_url: null },
    { name: "Full-Stack Web Development", issuer: "Contoh Academy", issue_date: "2024-01-20", expiry_date: null, credential_id: null, credential_url: null },
  ],
  publications: [],
  achievements: [
    {
      title: "Juara 1 Lomba Desain Web Tingkat Kota",
      issuer: "Dinas Komunikasi dan Informatika Kota Contoh",
      date: "2024-08",
      description: "Lomba desain web antar peserta se-kota.",
      document_url: null,
    },
    {
      // Judul panjang fiktif (101 karakter) — sengaja dipakai
      // untuk memastikan kartu pencapaian tidak memotong judul.
      title: "Juara 1 Lomba Membuat Website Toko Online untuk Pelaku Usaha Kecil dan Menengah di Kota Contoh",
      issuer: "Dinas Koperasi dan UKM Kota Contoh",
      date: "2024-11",
      description: "Lomba membuat website toko online untuk pelaku usaha kecil dan menengah.",
      document_url: null,
    },
  ],
  languages: [
    { language: "Bahasa Indonesia", level: "Tingkat Fasih atau Bahasa Ahli" },
    { language: "English", level: "Tingkat Menengah" },
  ],
  published_at: "2024-12-01T00:00:00.000Z",
};
