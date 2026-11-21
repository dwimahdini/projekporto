import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates/registry";
import type { PortfolioData } from "@/lib/types";

// Halaman portofolio publik: {subdomain}.portofolio.my.id
// SATU-SATUNYA sumber data: view public_portfolio.
// Kalau tidak ada baris (belum published / tidak ada),
// tampilkan 404 yang rapi — jangan bocorkan alasan detail.
// Template dipilih dari registry berdasarkan template_id.
export default async function SubdomainPage({
  params,
}: {
  params: { subdomain: string };
}) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .rpc("public_portfolio_by_subdomain", { p_subdomain: params.subdomain })
    .single();

  if (error || !data) notFound();

  const portfolio = data as unknown as PortfolioData;
  const meta = getTemplate(portfolio.template_id);
  if (!meta) notFound();

  const { Component } = meta;
  return <Component data={portfolio} />;
}
