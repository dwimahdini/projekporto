// Data contoh untuk /demo/[template] — dari CV Dwi Mahdini.
// Bentuknya SAMA dengan PortfolioData dari view public_portfolio,
// jadi yang kamu lihat di demo adalah yang akan tampil di
// portofolio asli klien. Email/telepon sengaja null di sini,
// sama seperti kalau klien mematikan toggle tampilnya.
import type { PortfolioData } from "@/lib/types";

export const demoPortfolio: PortfolioData = {
  profile_id: "demo-dwi-mahdini",
  subdomain: "dwimahdini",
  template_id: "minimalis",
  template_name: "Minimalis",
  full_name: "Dwi Mahdini",
  headline: "Fullstack Web Developer",
  bio: "Lulusan S1 Teknik Informatika UIN Suska Riau. Membangun website dengan Laravel, Next.js, dan MySQL/PostgreSQL. Fokus ke website yang cepat, rapi, dan mudah dipakai.",
  location: "Pekanbaru, Riau",
  photo_url: null,
  website_url: "https://porto.mahdini.my.id/",
  linkedin_url: null,
  github_url: "https://github.com/dwimahdini",
  instagram_url: null,
  email: null,
  phone: null,
  whatsapp: null,
  education: [
    {
      institution: "UIN Suska Riau",
      degree: "S1",
      field_of_study: "Teknik Informatika",
      start_date: "2022-08-01",
      end_date: "2026-06-01",
      gpa: 3.58,
      description: null,
    },
  ],
  experiences: [
    {
      company: "Freelance",
      position: "Web Developer",
      start_date: "2024-12-01",
      end_date: null,
      is_current: true,
      description: "Membangun website portofolio, toko digital, dan aplikasi gudang untuk klien.",
    },
    {
      company: "Lab Inkubator Bisnis TI UIN Suska Riau",
      position: "Web Developer",
      start_date: "2025-02-01",
      end_date: "2025-07-31",
      is_current: false,
      description: "Mengembangkan aplikasi web untuk kebutuhan lab dan mahasiswa.",
    },
  ],
  projects: [
    {
      title: "Toko Digital Lynk.id",
      description: "Storefront untuk produk digital: kelas PHP, source code Laravel, dan e-book.",
      url: "https://lynk.id/wikithey",
      image_url: null,
      tech_stack: ["Next.js", "Tailwind CSS"],
    },
    {
      title: "Website Gempa Global (USGS)",
      description: "Peta gempa global interaktif, refresh tiap menit, data USGS.",
      url: "https://github.com/dwimahdini/gempa-global",
      image_url: null,
      tech_stack: ["Next.js", "Leaflet"],
    },
    {
      title: "Peminjaman Alat Gudang",
      description: "Aplikasi peminjaman alat untuk 12 teknisi gudang.",
      url: null,
      image_url: null,
      tech_stack: ["Next.js", "Supabase"],
    },
    {
      title: "Pembuat CV ATS",
      description: "Website pembuat CV ATS: isi biodata, unduh PDF, tanpa login.",
      url: null,
      image_url: null,
      tech_stack: ["Next.js", "Tailwind CSS"],
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
    { name: "Intro to Front-End Development", issuer: "Meta (Coursera)", issue_date: "2026-08-18", expiry_date: null, credential_id: "DXIP03SSFWK2", credential_url: null },
    { name: "Technical Support Fundamentals", issuer: "Google (Coursera)", issue_date: "2026-10-31", expiry_date: null, credential_id: "PKE6GST0YQZH", credential_url: null },
    { name: "Implementing the Application Front End Using React Components", issuer: "IBM", issue_date: "2026-09-04", expiry_date: null, credential_id: null, credential_url: null },
    { name: "Responsive Web Design", issuer: "freeCodeCamp", issue_date: "2025-09-25", expiry_date: null, credential_id: null, credential_url: null },
  ],
  publications: [
    {
      title: "Chatbot Generative AI Berbasis Hybrid RAG dengan Integrasi RIASEC untuk Rekomendasi Jurusan",
      publisher: "JUPTIK",
      published_date: null,
      url: "https://ejournal.ummuba.ac.id/index.php/JUPTIK/en/article/view/4373",
      description: "Skripsi: perancangan chatbot Hybrid RAG untuk rekomendasi jurusan.",
    },
  ],
  published_at: "2026-11-21T00:00:00.000Z",
};
