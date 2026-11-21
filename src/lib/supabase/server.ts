import { createClient } from "@supabase/supabase-js";

// PENTING — jangan biarkan fetch Supabase masuk Data Cache
// Next.js: fetch default di server component bisa di-cache
// tanpa batas waktu, dan cache itu di Vercel bertahan antar
// deploy. Akibat nyata (21 Nov 2026): template baru yang
// ditambah lewat SQL tidak muncul di landing production —
// server terus menyajikan 5 template lama walau database
// sudah berisi 8 dan halaman sudah force-dynamic +
// revalidate = 0. `cache: "no-store"` di sini mematikan
// cache itu di sumbernya. Data aplikasi ini selalu berubah
// (template baru, order lunas, situs terbit), jadi tidak
// ada bacaan server yang boleh di-cache.
const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

// Client SERVER dengan service_role — HANYA di server.
// Dipakai untuk: cari order lewat token_hash, insert order
// baru, dan terima webhook Midtrans. File ini tidak boleh
// di-import dari komponen client ('use client').
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Supabase server env belum diisi");
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: noStoreFetch },
  });
}

// Client ANON (publik) — hanya untuk baca templates dan
// view public_portfolio. Tidak bisa baca orders/profiles
// karena RLS menolaknya.
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { global: { fetch: noStoreFetch } });
}
