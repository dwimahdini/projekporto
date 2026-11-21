import { createClient } from "@supabase/supabase-js";

// Client SERVER dengan service_role — HANYA di server.
// Dipakai untuk: cari order lewat token_hash, insert order
// baru, dan terima webhook Midtrans. File ini tidak boleh
// di-import dari komponen client ('use client').
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Supabase server env belum diisi");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Client ANON (publik) — hanya untuk baca templates dan
// view public_portfolio. Tidak bisa baca orders/profiles
// karena RLS menolaknya.
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}
