// Tipe yang dipakai di seluruh aplikasi.
// public_portfolio adalah bentuk data yang keluar dari
// view public_portfolio — halaman publik HANYA kenal tipe ini.

// --- Bentuk tiap bagian di view public_portfolio (JSON) ---
export interface PortfolioEducation {
  institution: string;
  degree: string | null;
  field_of_study: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: number | null;
  description: string | null;
}

export interface PortfolioExperience {
  company: string;
  position: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export interface PortfolioProject {
  title: string;
  description: string | null;
  url: string | null;
  image_url: string | null;
  tech_stack: string[];
}

export interface PortfolioSkill {
  name: string;
  category: string | null;
  level: number | null;
}

export interface PortfolioCertification {
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
}

export interface PortfolioPublication {
  title: string;
  publisher: string | null;
  published_date: string | null;
  url: string | null;
  description: string | null;
}

// PortfolioData: SATU bentuk props untuk SEMUA template.
// Kelima template di src/components/templates/ menerima
// props { data: PortfolioData } — tidak ada bentuk lain.
// Field yang null / array kosong = tidak ditampilkan.
export interface PortfolioData {
  profile_id: string;
  subdomain: string;
  template_id: string;
  template_name: string;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  location: string | null;
  photo_url: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  instagram_url: string | null;
  email: string | null; // null kalau disembunyikan
  phone: string | null;
  whatsapp: string | null;
  education: PortfolioEducation[];
  experiences: PortfolioExperience[];
  projects: PortfolioProject[];
  skills: PortfolioSkill[];
  certifications: PortfolioCertification[];
  publications: PortfolioPublication[];
  published_at: string;
}

// Nama lama, dipertahankan supaya kode Tahap 1-2 tidak rusak.
export type PublicPortfolio = PortfolioData;

export type OrderStatus =
  | "draft" | "preview" | "pending_payment" | "paid"
  | "domain_pending" | "published"
  | "expired" | "cancelled" | "deleted";

export type TemplateId =
  | "minimalis"
  | "gelap-futuristik"
  | "kreatif"
  | "profesional"
  | "visual"
  | "developer"
  | "desainer"
  | "resume-cv";

export const TEMPLATE_IDS: TemplateId[] = [
  "minimalis",
  "gelap-futuristik",
  "kreatif",
  "profesional",
  "visual",
  "developer",
  "desainer",
  "resume-cv",
];

export const FORBIDDEN_SUBDOMAINS = [
  "group", "www", "admin", "api", "mail", "app",
  "dashboard", "preview", "pesanan", "login", "auth",
  "support", "help", "blog", "shop", "payment", "pay",
  "midtrans", "webhook", "cdn", "static", "assets",
] as const;
