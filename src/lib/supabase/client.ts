"use client";
// Client browser — hanya untuk halaman admin (login Supabase Auth).
// Jangan pakai client ini untuk membaca order tamu.
import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
