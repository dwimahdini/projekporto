// Cek admin di server (untuk /preview/[orderId]).
// Admin login lewat Supabase Auth; role dicek di tabel
// profiles (role='admin'). Kalau tidak ada sesi admin,
// kembalikan false — halaman preview lalu memakai token.
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "./supabase/server";

export async function getAdminEmail(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("auth_user_id", data.user.id)
      .eq("role", "admin")
      .limit(1)
      .single();
    if (!profile) return null;
    return data.user.email ?? null;
  } catch {
    return null;
  }
}

export async function isAdminRequest(): Promise<boolean> {
  return (await getAdminEmail()) !== null;
}
