// Helper server untuk order tamu.
// Semua route order memakai ini — jangan query orders
// langsung dari route tanpa verifikasi token.
import { createAdminClient } from "./supabase/server";
import { hashToken } from "./validation";

export interface OrderWithProfile {
  id: string;
  template_id: string;
  email: string;
  subdomain: string | null;
  status: string;
  email_verified_at: string | null;
  token_expires_at: string;
  draft_expires_at: string | null;
  price_snapshot: number;
  profile: Record<string, unknown> | null;
}

// Cari order lewat token polos (dari URL). Yang dibandingkan
// adalah hash-nya. Token yang salah / expired -> null.
// Jangan bocorkan alasan detail ke client (salah vs expired
// dibedakan hanya di log server).
export async function getOrderByToken(token: string): Promise<OrderWithProfile | null> {
  if (!token || token.length < 32) return null;
  const tokenHash = await hashToken(token);
  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, template_id, email, subdomain, status, email_verified_at, token_expires_at, draft_expires_at, price_snapshot, token_hash")
    .eq("token_hash", tokenHash)
    .single();
  if (error || !order) return null;
  if (new Date(order.token_expires_at).getTime() < Date.now()) return null;
  if (order.status === "deleted") return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("order_id", order.id)
    .single();

  return {
    id: order.id,
    template_id: order.template_id,
    email: order.email,
    subdomain: order.subdomain,
    status: order.status,
    email_verified_at: order.email_verified_at,
    token_expires_at: order.token_expires_at,
    draft_expires_at: order.draft_expires_at,
    price_snapshot: order.price_snapshot,
    profile: (profile as Record<string, unknown> | null) ?? null,
  };
}

// Apakah order ini boleh lanjut ke pembayaran?
// Syarat: email sudah terverifikasi + status masih draft/preview.
export function canProceedToPayment(order: OrderWithProfile): boolean {
  return (
    order.email_verified_at !== null &&
    (order.status === "draft" || order.status === "preview")
  );
}
