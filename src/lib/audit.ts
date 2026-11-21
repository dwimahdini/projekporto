// Audit log admin — semua aksi admin dicatat di tabel
// audit_log (migrasi 0006). Jangan pernah mencatat token,
// OTP, password, atau data pribadi lengkap di sini;
// details hanya berisi ringkasan (misalnya field apa yang
// dilihat, bukan isinya).
import { createAdminClient } from "./supabase/server";

export async function logAudit(input: {
  adminEmail: string;
  action: string;
  orderId?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_log").insert({
      admin_email: input.adminEmail,
      action: input.action,
      order_id: input.orderId ?? null,
      details: input.details ?? {},
    });
  } catch (e) {
    // Audit gagal tidak boleh membatalkan aksi admin —
    // tapi harus terlihat di log server.
    console.error("[audit] gagal mencatat", e);
  }
}

// Keputusan murni untuk tes: aksi admin apa yang boleh
// untuk status order apa.
export function decideAdminAction(input: {
  isAdmin: boolean;
  action: "disable" | "enable" | "cancel";
  orderStatus: string;
}): { allowed: boolean; error?: string } {
  if (!input.isAdmin) return { allowed: false, error: "forbidden_non_admin" };
  if (input.action === "disable" && input.orderStatus !== "published") {
    return { allowed: false, error: "invalid_order_status" };
  }
  if (input.action === "enable" && input.orderStatus !== "disabled") {
    return { allowed: false, error: "invalid_order_status" };
  }
  if (input.action === "cancel" && ["published", "disabled", "deleted", "cancelled", "expired"].includes(input.orderStatus)) {
    return { allowed: false, error: "invalid_order_status" };
  }
  return { allowed: true };
}
