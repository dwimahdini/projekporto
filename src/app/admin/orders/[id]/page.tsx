import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminRequest } from "@/lib/admin-auth";
import AdminLogin from "../../AdminClient";
import AdminOrderDetailClient from "./AdminOrderDetailClient";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

// Detail pesanan admin: data klien, template, status
// pembayaran, riwayat percobaan pembayaran, tombol
// "Lihat pratinjau". Data pribadi (tanggal lahir, alamat,
// nomor HP) disembunyikan secara default dan hanya tampil
// setelah admin menekan "Tampilkan" (dicatat audit_log).
export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  if (!(await isAdminRequest())) return <AdminLogin />;

  const supabase = createAdminClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, subdomain, email, template_id, status, price_snapshot, created_at, domain_status, published_at")
    .eq("id", params.id)
    .single();
  if (!order) notFound();

  const [{ data: profile }, { data: payments }, { data: audit }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, city, province, headline, bio, location, photo_url, website_url, linkedin_url, github_url, instagram_url")
      .eq("order_id", order.id)
      .single(),
    supabase
      .from("payments")
      .select("id, provider, provider_ref, amount, internal_status, created_at, paid_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("audit_log")
      .select("admin_email, action, details, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <AdminOrderDetailClient
      order={{
        id: order.id as string,
        subdomain: (order.subdomain as string) ?? "",
        email: order.email as string,
        templateId: order.template_id as string,
        status: order.status as string,
        price: Number(order.price_snapshot ?? 0),
        createdAt: order.created_at as string,
        domainStatus: (order.domain_status as string) ?? "",
        publishedAt: (order.published_at as string | null) ?? null,
      }}
      profile={(profile ?? {}) as Record<string, unknown>}
      payments={(payments ?? []).map((p) => ({
        id: p.id as string,
        provider: p.provider as string,
        providerRef: (p.provider_ref as string | null) ?? "",
        amount: Number(p.amount ?? 0),
        status: p.internal_status as string,
        createdAt: p.created_at as string,
      }))}
      audit={(audit ?? []).map((a) => ({
        adminEmail: a.admin_email as string,
        action: a.action as string,
        createdAt: a.created_at as string,
      }))}
    />
  );
}
