import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates/registry";
import type { PortfolioData } from "@/lib/types";

// Halaman portofolio publik: {subdomain}.portofolio.my.id
// SATU-SATUNYA sumber data: view public_portfolio — yang
// hanya mengembalikan order berstatus published.
// Kalau tidak ada baris (belum published / domain_pending /
// tidak ada), tampilkan 404 yang rapi — jangan bocorkan
// alasan detail. Template dipilih dari registry.
// Halaman ini TIDAK memakai watermark (itu hanya pratinjau).

async function loadPortfolio(subdomain: string): Promise<PortfolioData | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .rpc("public_portfolio_by_subdomain", { p_subdomain: subdomain })
    .single();
  if (error || !data) return null;
  return data as unknown as PortfolioData;
}

// SEO per situs klien: judul, deskripsi, dan Open Graph
// dari data klien sendiri (bukan dari pratinjau).
export async function generateMetadata({ params }: { params: { subdomain: string } }): Promise<Metadata> {
  const portfolio = await loadPortfolio(params.subdomain);
  if (!portfolio) return { robots: { index: false, follow: false } };
  const name = portfolio.full_name ?? params.subdomain;
  const title = portfolio.headline ? `${name} — ${portfolio.headline}` : name;
  const description = portfolio.bio ?? `Portofolio ${name}`;
  const url = `https://${params.subdomain}.portofolio.my.id`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: portfolio.photo_url ? [{ url: portfolio.photo_url, alt: name }] : [],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SubdomainPage({
  params,
}: {
  params: { subdomain: string };
}) {
  const portfolio = await loadPortfolio(params.subdomain);
  if (!portfolio) notFound();

  const meta = getTemplate(portfolio.template_id);
  if (!meta) notFound();

  const { Component } = meta;
  return <Component data={portfolio} />;
}
