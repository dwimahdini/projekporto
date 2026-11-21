// Penyaring data publik — cerminan logika view
// public_portfolio (SQL, migrasi 0001) dalam TypeScript,
// supaya bisa dites: field privat yang toggle-nya mati
// TIDAK BOLEH muncul di HTML situs publik.
// Sumber kebenaran untuk situs publik tetap view SQL;
// fungsi ini dipakai tes + pratinjau, bukan halaman /s/.
import type { PortfolioData } from "./types";

// Default visibility: field umum tampil, kontak privat sembunyi.
const DEFAULT_VISIBLE: Record<string, boolean> = {
  full_name: true,
  headline: true,
  bio: true,
  location: true,
  photo_url: true,
  website_url: true,
  linkedin_url: true,
  github_url: true,
  instagram_url: true,
  email: false,
  phone: false,
  whatsapp: false,
};

const PRIVATE_FIELDS = ["email", "phone", "whatsapp"] as const;

export function applyVisibilityToPortfolio(
  data: PortfolioData,
  visibility: Record<string, boolean>
): PortfolioData {
  const show = (field: string) => visibility[field] ?? DEFAULT_VISIBLE[field] ?? true;
  const out: PortfolioData = { ...data };
  for (const field of PRIVATE_FIELDS) {
    if (!show(field)) (out as unknown as Record<string, unknown>)[field] = null;
  }
  // Alamat tidak pernah masuk data publik, apa pun toggle-nya.
  // PortfolioData memang tidak punya field address — pastikan
  // tetap begitu: kalau ada yang menyelipkannya, buang.
  delete (out as unknown as Record<string, unknown>).address;
  return out;
}
