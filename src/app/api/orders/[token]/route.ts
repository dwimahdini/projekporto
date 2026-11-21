import { NextResponse } from "next/server";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";
import {
  autosaveSchema,
  identitySchema,
  educationItemSchema,
  experienceItemSchema,
  projectItemSchema,
  skillItemSchema,
  certificationItemSchema,
  publicationItemSchema,
  visibilitySchema,
} from "@/lib/validation";

// GET /api/orders/[token] — ambil draft (harus bawa token yang benar).
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid atau sudah kedaluwarsa." }, { status: 401 });

  const supabase = createAdminClient();
  const profileId = (order.profile as { id?: string } | null)?.id;
  if (!profileId) return NextResponse.json({ order: { ...order, profile: null }, lists: {}, visibility: {} });

  const [edu, exp, proj, skills, certs, pubs, vis, pays] = await Promise.all([
    supabase.from("education").select("*").eq("profile_id", profileId).order("sort_order"),
    supabase.from("experiences").select("*").eq("profile_id", profileId).order("sort_order"),
    supabase.from("projects").select("*").eq("profile_id", profileId).order("sort_order"),
    supabase.from("skills").select("*").eq("profile_id", profileId).order("sort_order"),
    supabase.from("certifications").select("*").eq("profile_id", profileId).order("sort_order"),
    supabase.from("publications").select("*").eq("profile_id", profileId).order("sort_order"),
    supabase.from("profile_visibility").select("field_name, is_visible").eq("profile_id", profileId),
    supabase.from("payments").select("id, provider, provider_ref, amount, internal_status, created_at").eq("order_id", order.id).order("created_at", { ascending: false }),
  ]);

  const visibility: Record<string, boolean> = {};
  for (const row of vis.data ?? []) visibility[row.field_name] = row.is_visible;

  return NextResponse.json({
    order,
    lists: {
      education: edu.data ?? [],
      experiences: exp.data ?? [],
      projects: proj.data ?? [],
      skills: skills.data ?? [],
      certifications: certs.data ?? [],
      publications: pubs.data ?? [],
    },
    visibility,
    payments: pays.data ?? [],
  });
}

const SENSITIVE_FIELDS = ["email", "phone", "whatsapp", "address", "date_of_birth"] as const;

// PATCH /api/orders/[token] — autosave per langkah.
// Body: { step, data }. Token dicek dulu, lalu data langkah
// itu divalidasi dengan Zod sebelum disimpan.
// Edit data sensitif SETELAH data pertama kali terisi wajib
// OTP yang sudah terverifikasi (lihat /otp). Pengisian
// pertama kali tidak butuh OTP.
export async function PATCH(req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid atau sudah kedaluwarsa." }, { status: 401 });
  if (order.status === "published" || order.status === "deleted") {
    return NextResponse.json({ error: "Pesanan ini sudah tidak bisa diubah." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);

  // Subdomain dikunci: tidak ada API yang boleh mengubahnya,
  // apalagi setelah paid. Form tidak pernah mengirim field ini.
  if (body?.data && typeof body.data === "object" && "subdomain" in body.data) {
    return NextResponse.json({ error: "Subdomain sudah dikunci dan tidak bisa diubah." }, { status: 403 });
  }

  const parsed = autosaveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });

  const supabase = createAdminClient();
  const profileId = (order.profile as { id?: string } | null)?.id;
  if (!profileId) return NextResponse.json({ error: "Profile tidak ditemukan." }, { status: 500 });

  const { step, data } = parsed.data;

  if (step === "identity") {
    const v = identitySchema.safeParse(data);
    if (!v.success) return NextResponse.json({ error: v.error.issues[0]?.message ?? "Data identitas tidak valid." }, { status: 400 });

    // Cek OTP untuk perubahan data sensitif (bukan pengisian pertama).
    const profile = order.profile as Record<string, unknown>;
    const changingSensitive = SENSITIVE_FIELDS.some((f) => {
      const keyMap: Record<string, string> = { email: "email", phone: "phone", whatsapp: "whatsapp", address: "address", date_of_birth: "dateOfBirth" };
      const newVal = (v.data as Record<string, unknown>)[keyMap[f]];
      const oldVal = profile[f];
      return newVal !== undefined && newVal !== "" && oldVal !== undefined && oldVal !== null && oldVal !== "" && String(newVal) !== String(oldVal);
    });
    if (changingSensitive) {
      const { data: otp } = await supabase
        .from("otps")
        .select("id")
        .eq("order_id", order.id)
        .eq("purpose", "edit-private")
        .not("used_at", "is", null)
        .gte("used_at", new Date(Date.now() - 15 * 60 * 1000).toISOString())
        .order("used_at", { ascending: false })
        .limit(1);
      if (!otp || otp.length === 0) {
        return NextResponse.json({ error: "OTP_REQUIRED", message: "Untuk mengubah data pribadi, verifikasi dulu dengan kode OTP yang dikirim ke email kamu." }, { status: 403 });
      }
    }

    const d = v.data;
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: d.fullName,
        headline: d.headline || null,
        bio: d.bio || null,
        date_of_birth: d.dateOfBirth || null,
        gender: d.gender ?? null,
        nationality: d.nationality || null,
        address: d.address || null,
        city: d.city || null,
        province: d.province || null,
        postal_code: d.postalCode || null,
        phone: d.phone || null,
        whatsapp: d.whatsapp || null,
        email: d.email,
        website_url: d.websiteUrl || null,
        linkedin_url: d.linkedinUrl || null,
        github_url: d.githubUrl || null,
        instagram_url: d.instagramUrl || null,
        photo_url: d.photoUrl || null,
      })
      .eq("id", profileId);
    if (error) return NextResponse.json({ error: "Gagal menyimpan identitas." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (step === "visibility") {
    const v = visibilitySchema.safeParse(data);
    if (!v.success) return NextResponse.json({ error: "Data visibility tidak valid." }, { status: 400 });
    const rows = Object.entries(v.data).map(([field_name, is_visible]) => ({
      profile_id: profileId,
      field_name,
      is_visible,
    }));
    if (rows.length > 0) {
      const { error } = await supabase.from("profile_visibility").upsert(rows, { onConflict: "profile_id,field_name" });
      if (error) return NextResponse.json({ error: "Gagal menyimpan preferensi tampil." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // Langkah daftar: ganti seluruh isi tabel itu (delete + insert).
  // Ini sederhana dan aman untuk draft — data lama diganti
  // dengan data form terbaru.
  const listConfig = {
    education: { table: "education", schema: educationItemSchema, map: (i: Record<string, unknown>) => ({ institution: i.institution, degree: i.degree || null, field_of_study: i.fieldOfStudy || null, start_date: i.startDate || null, end_date: i.endDate || null, gpa: i.gpa ?? null, description: i.description || null, is_visible: i.isVisible ?? true }) },
    experiences: { table: "experiences", schema: experienceItemSchema, map: (i: Record<string, unknown>) => ({ company: i.company, position: i.position, start_date: i.startDate || null, end_date: i.endDate || null, is_current: i.isCurrent ?? false, description: i.description || null, is_visible: i.isVisible ?? true }) },
    projects: { table: "projects", schema: projectItemSchema, map: (i: Record<string, unknown>) => ({ title: i.title, description: i.description || null, url: i.url || null, image_url: i.imageUrl || null, tech_stack: i.techStack ?? [], is_visible: i.isVisible ?? true }) },
    skills: { table: "skills", schema: skillItemSchema, map: (i: Record<string, unknown>) => ({ name: i.name, category: i.category || null, level: i.level ?? null, is_visible: i.isVisible ?? true }) },
    certifications: { table: "certifications", schema: certificationItemSchema, map: (i: Record<string, unknown>) => ({ name: i.name, issuer: i.issuer || null, issue_date: i.issueDate || null, expiry_date: i.expiryDate || null, credential_id: i.credentialId || null, credential_url: i.credentialUrl || null, is_visible: i.isVisible ?? true }) },
    publications: { table: "publications", schema: publicationItemSchema, map: (i: Record<string, unknown>) => ({ title: i.title, publisher: i.publisher || null, published_date: i.publishedDate || null, url: i.url || null, description: i.description || null, is_visible: i.isVisible ?? true }) },
  } as const;

  const cfg = (listConfig as Record<string, { table: string; schema: { safeParse: (v: unknown) => { success: boolean; data?: unknown; error?: { issues: { message?: string }[] } } }; map: (i: Record<string, unknown>) => Record<string, unknown> }>)[step];
  if (!cfg) return NextResponse.json({ error: "Langkah tidak dikenal." }, { status: 400 });
  if (!Array.isArray(data)) return NextResponse.json({ error: "Data harus berupa daftar." }, { status: 400 });

  const items: Record<string, unknown>[] = [];
  for (const raw of data) {
    const v = cfg.schema.safeParse(raw);
    if (!v.success) return NextResponse.json({ error: v.error?.issues[0]?.message ?? "Ada item yang tidak valid." }, { status: 400 });
    items.push({ profile_id: profileId, ...cfg.map(v.data as Record<string, unknown>), sort_order: items.length });
  }

  const { error: delErr } = await supabase.from(cfg.table).delete().eq("profile_id", profileId);
  if (delErr) return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });
  if (items.length > 0) {
    const { error } = await supabase.from(cfg.table).insert(items);
    if (error) return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
