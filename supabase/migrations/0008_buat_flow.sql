-- ============================================================
-- 0008: Alur baru (/buat) — bucket + tabel shares.
-- JANGAN jalankan lewat CLI di sini: terapkan lewat
-- SQL Editor Supabase (Dashboard -> SQL Editor) sebelum
-- upload (/api/buat/upload) dan buat (/api/buat/create)
-- bisa dipakai. Tanpa migrasi ini, kedua route mengembalikan
-- pesan "belum disiapkan".
-- ============================================================

-- Bucket publik baru untuk foto & dokumen alur baru.
-- Foto: folder foto/, dokumen PDF: folder dokumen/.
insert into storage.buckets (id, name, public)
values ('portfolio-public', 'portfolio-public', true)
on conflict (id) do nothing;

-- Bacaan publik untuk bucket portfolio-public, supaya URL
-- publik dari getPublicUrl bisa dibuka siapa saja.
-- HANYA policy baca yang ditulis di sini; service_role
-- melewati RLS, jadi tulis tetap hanya lewat server
-- (/api/buat/upload) — tidak ada policy insert/update anon.
create policy "Bacaan publik portfolio-public"
  on storage.objects for select
  using (bucket_id = 'portfolio-public');

-- Tabel tautan berbagi alur baru. Satu baris = satu
-- portofolio yang sudah dibuat lewat /buat/selesai.
-- share_code acak 16 karakter adalah kuncinya (tidak ada
-- login/token): siapa pun yang punya tautan bisa membuka.
-- data = PortfolioData lengkap (jsonb), template_id = id
-- template di registry saat portofolio dibuat.
create table if not exists public.shares (
  id uuid primary key default gen_random_uuid(),
  share_code text unique not null,
  data jsonb not null,
  template_id text not null,
  created_at timestamptz default now()
);

-- RLS aktif, TANPA policy anon: baca/tulis hanya lewat
-- service_role (createAdminClient di /bagikan/[code] dan
-- /api/buat/create). Jangan tambah policy anon di sini.
alter table public.shares enable row level security;
