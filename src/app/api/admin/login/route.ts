import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// POST /api/admin/login — login admin LEWAT SERVER, bukan
// langsung dari browser ke Supabase. Tujuannya:
//  1. Rate limiting per IP+email (5x per 15 menit).
//  2. Penundaan 1 detik pada percobaan gagal (memperlambat
//     brute force; Supabase Auth sendiri juga membatasi).
//  3. Cek role='admin' di server sebelum sesi dianggap sah.
// Pesan error sengaja generik (jangan bocorkan apakah
// email terdaftar atau password yang salah).
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
  }

  const rl = checkRateLimit({ key: `admin-login:${ip}:${email}`, ...RATE_LIMITS.adminLogin });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan login. Coba lagi dalam ${rl.retryAfterSec} detik.` },
      { status: 429 }
    );
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...(options as object) });
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value: "", ...(options as object) });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    await sleep(1000);
    console.warn("[admin-login] gagal untuk", email, "dari", ip);
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  // Cek role di server: hanya role='admin' yang boleh masuk.
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .eq("role", "admin")
    .limit(1)
    .single();
  if (!profile) {
    await supabase.auth.signOut();
    console.warn("[admin-login] bukan admin:", email);
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
