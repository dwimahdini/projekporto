// Membangun PortfolioData untuk PRATINJAU dari order yang
// BELUM published. View public_portfolio hanya mengembalikan
// order published, jadi preview tidak bisa memakai view itu.
// Fungsi ini meniru logika view yang sama, di server saja:
//  - hanya field yang flag visibility-nya true yang diisi,
//  - email/telepon/WhatsApp default SEMBUNYI,
//  - address TIDAK PERNAH disertakan,
//  - tabel anak hanya yang is_visible=true.
// Jangan panggil fungsi ini dari client — hanya server.
import { createAdminClient } from "./supabase/server";
import type { PortfolioData } from "./types";

export async function buildPreviewPortfolio(orderId: string): Promise<PortfolioData | null> {
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, template_id, email, subdomain, status")
    .eq("id", orderId)
    .single();
  if (!order) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("order_id", orderId)
    .single();
  if (!profile) return null;

  const { data: templates } = await supabase
    .from("templates")
    .select("name")
    .eq("id", order.template_id)
    .single();

  const [edu, exp, proj, skills, certs, pubs, vis] = await Promise.all([
    supabase.from("education").select("*").eq("profile_id", profile.id).order("sort_order"),
    supabase.from("experiences").select("*").eq("profile_id", profile.id).order("sort_order"),
    supabase.from("projects").select("*").eq("profile_id", profile.id).order("sort_order"),
    supabase.from("skills").select("*").eq("profile_id", profile.id).order("sort_order"),
    supabase.from("certifications").select("*").eq("profile_id", profile.id).order("sort_order"),
    supabase.from("publications").select("*").eq("profile_id", profile.id).order("sort_order"),
    supabase.from("profile_visibility").select("field_name, is_visible").eq("profile_id", profile.id),
  ]);

  const visMap: Record<string, boolean> = {};
  for (const row of vis.data ?? []) visMap[row.field_name] = row.is_visible;

  // Default: field umum tampil, kontak privat sembunyi.
  const show = (field: string, defaultVisible: boolean) =>
    visMap[field] ?? defaultVisible;

  const pick = (field: string, value: unknown, defaultVisible: boolean) =>
    show(field, defaultVisible) ? (value as string | null) ?? null : null;

  return {
    profile_id: profile.id as string,
    subdomain: (order.subdomain as string) ?? "",
    template_id: order.template_id as string,
    template_name: (templates?.name as string) ?? (order.template_id as string),
    full_name: pick("full_name", profile.full_name, true),
    headline: pick("headline", profile.headline, true),
    bio: pick("bio", profile.bio, true),
    location: pick("location", profile.location, true),
    photo_url: pick("photo_url", profile.photo_url, true),
    website_url: pick("website_url", profile.website_url, true),
    linkedin_url: pick("linkedin_url", profile.linkedin_url, true),
    github_url: pick("github_url", profile.github_url, true),
    instagram_url: pick("instagram_url", profile.instagram_url, true),
    email: pick("email", profile.email, false),
    phone: pick("phone", profile.phone, false),
    whatsapp: pick("whatsapp", profile.whatsapp, false),
    education: (edu.data ?? [])
      .filter((r) => r.is_visible)
      .map((r) => ({
        institution: r.institution as string,
        degree: r.degree as string | null,
        field_of_study: r.field_of_study as string | null,
        start_date: r.start_date as string | null,
        end_date: r.end_date as string | null,
        gpa: r.gpa as number | null,
        description: r.description as string | null,
      })),
    experiences: (exp.data ?? [])
      .filter((r) => r.is_visible)
      .map((r) => ({
        company: r.company as string,
        position: r.position as string,
        start_date: r.start_date as string | null,
        end_date: r.end_date as string | null,
        is_current: Boolean(r.is_current),
        description: r.description as string | null,
      })),
    projects: (proj.data ?? [])
      .filter((r) => r.is_visible)
      .map((r) => ({
        title: r.title as string,
        description: r.description as string | null,
        url: r.url as string | null,
        image_url: r.image_url as string | null,
        tech_stack: (r.tech_stack as string[]) ?? [],
      })),
    skills: (skills.data ?? [])
      .filter((r) => r.is_visible)
      .map((r) => ({
        name: r.name as string,
        category: r.category as string | null,
        level: r.level as number | null,
      })),
    certifications: (certs.data ?? [])
      .filter((r) => r.is_visible)
      .map((r) => ({
        name: r.name as string,
        issuer: r.issuer as string | null,
        issue_date: r.issue_date as string | null,
        expiry_date: r.expiry_date as string | null,
        credential_id: r.credential_id as string | null,
        credential_url: r.credential_url as string | null,
      })),
    publications: (pubs.data ?? [])
      .filter((r) => r.is_visible)
      .map((r) => ({
        title: r.title as string,
        publisher: r.publisher as string | null,
        published_date: r.published_date as string | null,
        url: r.url as string | null,
        description: r.description as string | null,
      })),
    published_at: new Date().toISOString(),
  };
}
