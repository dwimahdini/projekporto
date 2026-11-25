// Registry template — SATU tempat yang memetakan
// template_id (dari database) ke komponennya.
// Tambah template baru = tambah 1 baris di sini +
// 1 file komponen. Tidak ada if/else template yang
// tersebar di halaman.
import type { ComponentType } from "react";
import type { PortfolioData, TemplateId } from "@/lib/types";
import MinimalisTemplate from "@/components/templates/MinimalisTemplate";
import GelapFuturistikTemplate from "@/components/templates/GelapFuturistikTemplate";
import KreatifTemplate from "@/components/templates/KreatifTemplate";
import ProfesionalTemplate from "@/components/templates/ProfesionalTemplate";
import VisualTemplate from "@/components/templates/VisualTemplate";
import DeveloperTemplate from "@/components/templates/DeveloperTemplate";
import DesignerTemplate from "@/components/templates/DesignerTemplate";
import ResumeCvTemplate from "@/components/templates/ResumeCvTemplate";
import LogsfolioTemplate from "@/components/templates/LogsfolioTemplate";
import PictoTemplate from "@/components/templates/PictoTemplate";
import AstrowindTemplate from "@/components/templates/AstrowindTemplate";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
  Component: ComponentType<{ data: PortfolioData }>;
}

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateMeta> = {
  minimalis: {
    id: "minimalis",
    name: "Minimalis",
    description: "Putih bersih, tipografi besar, banyak ruang kosong.",
    Component: MinimalisTemplate,
  },
  "gelap-futuristik": {
    id: "gelap-futuristik",
    name: "Gelap Futuristik",
    description: "Tema gelap, efek glow, background partikel ringan.",
    Component: GelapFuturistikTemplate,
  },
  kreatif: {
    id: "kreatif",
    name: "Kreatif",
    description: "Warna-warni, kartu miring saat hover, animasi playful.",
    Component: KreatifTemplate,
  },
  profesional: {
    id: "profesional",
    name: "Profesional",
    description: "Rapi dan formal, cocok untuk melamar kerja kantoran.",
    Component: ProfesionalTemplate,
  },
  visual: {
    id: "visual",
    name: "Visual",
    description: "Hero foto besar, galeri proyek dengan lightbox.",
    Component: VisualTemplate,
  },
  developer: {
    id: "developer",
    name: "Developer",
    description:
      "Gaya terminal dan kode, filter proyek per teknologi, garis waktu pengalaman.",
    Component: DeveloperTemplate,
  },
  desainer: {
    id: "desainer",
    name: "Desainer",
    description:
      "Hero serif besar, studi kasus warna-warni, proses kerja 4 langkah.",
    Component: DesignerTemplate,
  },
  "resume-cv": {
    id: "resume-cv",
    name: "Resume & CV",
    description:
      "CV dua kolom navy-putih yang rapi, bisa di-print jadi PDF.",
    Component: ResumeCvTemplate,
  },
  logsfolio: {
    id: "logsfolio",
    name: "Logsfolio",
    description:
      "Foto bulat, timeline pengalaman, kartu proyek, mode gelap/terang.",
    Component: LogsfolioTemplate,
  },
  picto: {
    id: "picto",
    name: "Picto",
    description:
      "Kreatif dan berwarna, hero statistik, proses kerja 4 langkah, grid portofolio.",
    Component: PictoTemplate,
  },
  astrowind: {
    id: "astrowind",
    name: "Astrowind",
    description:
      "Modern dan bersih, pengalaman dan pendidikan gaya Steps, mode gelap/terang.",
    Component: AstrowindTemplate,
  },
};

export const TEMPLATE_LIST: TemplateMeta[] = Object.values(TEMPLATE_REGISTRY);

// Template yang dipakai pemilih template alur baru (/buat/template).
// Hanya 3 template ThemeWagon: 8 template lama tidak me-render
// seksi Pencapaian/Bahasa, jadi tidak dipakai di alur baru.
// Template lama tetap ada di TEMPLATE_LIST untuk alur lama
// (/demo, /s, /preview) — jangan hapus.
export const BUAT_TEMPLATE_IDS: TemplateId[] = [
  "logsfolio",
  "picto",
  "astrowind",
];

export const BUAT_TEMPLATE_LIST: TemplateMeta[] = BUAT_TEMPLATE_IDS.map(
  (id) => TEMPLATE_REGISTRY[id],
);

export function getTemplate(id: string): TemplateMeta | null {
  return (TEMPLATE_REGISTRY as Record<string, TemplateMeta>)[id] ?? null;
}
