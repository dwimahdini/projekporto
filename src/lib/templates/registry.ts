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
};

export const TEMPLATE_LIST: TemplateMeta[] = Object.values(TEMPLATE_REGISTRY);

export function getTemplate(id: string): TemplateMeta | null {
  return (TEMPLATE_REGISTRY as Record<string, TemplateMeta>)[id] ?? null;
}
