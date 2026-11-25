// Halaman berbagi portofolio: /bagikan/<shareCode>.
// Server component. Baris shares dibaca lewat service_role
// (createAdminClient) — TIDAK ada policy anon untuk tabel
// shares; kode acak 16 karakter sudah cukup sebagai kunci.
// Kode tidak dikenal -> 404 rapi. Tanpa watermark, tanpa UI edit.
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates/registry";
import type { PortfolioData } from "@/lib/types";

export const dynamic = "force-dynamic";

interface BarisShare {
  share_code: string;
  data: unknown;
  template_id: string;
}

async function loadShare(code: string): Promise<BarisShare | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("shares")
    .select("share_code, data, template_id")
    .eq("share_code", code)
    .single();
  if (error || !data) return null;
  return data as BarisShare;
}

// Data tersimpan (jsonb) -> PortfolioData. Pastikan
// achievements/languages berupa array (default [] kalau
// tidak ada / bukan array) supaya template tidak rusak.
function normalisasiData(mentah: unknown): PortfolioData {
  const data = (mentah ?? {}) as Partial<PortfolioData>;
  return {
    ...(data as PortfolioData),
    achievements: Array.isArray(data.achievements) ? data.achievements : [],
    languages: Array.isArray(data.languages) ? data.languages : [],
  };
}

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const share = await loadShare(params.code);
  if (!share) return { robots: { index: false, follow: false } };
  const portfolio = normalisasiData(share.data);
  const nama = portfolio.full_name ?? "Portofolio";
  const title = `${nama} — Portofolio`;
  const description =
    portfolio.headline ?? portfolio.bio ?? `Portofolio ${nama}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: portfolio.photo_url
        ? [{ url: portfolio.photo_url, alt: nama }]
        : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BagikanPage({
  params,
}: {
  params: { code: string };
}) {
  const share = await loadShare(params.code);
  if (!share) notFound();

  const meta = getTemplate(share.template_id);
  if (!meta) notFound();

  const portfolio = normalisasiData(share.data);
  const { Component } = meta;
  return <Component data={portfolio} />;
}
