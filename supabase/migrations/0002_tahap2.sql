-- ============================================================
-- Tahap 2: Form pesanan tanpa login
-- Jalankan SETELAH 0001_init.sql.
-- Isi: kolom identitas baru, tabel OTP, bucket upload,
-- dan penghapusan draft otomatis 14 hari.
-- ============================================================

-- ---------- 1) Kolom identitas baru di profiles ----------
-- date_of_birth / gender / nationality punya toggle tampil
-- di profile_visibility (lihat bawah). Alamat lengkap tetap
-- privat: tidak pernah masuk view public_portfolio.
alter table public.profiles
  add column if not exists date_of_birth date,
  add column if not exists gender text check (gender is null or gender in ('laki-laki', 'perempuan', 'lainnya', 'tidak-ingin-menjawab')),
  add column if not exists nationality text,
  add column if not exists city text,
  add column if not exists province text,
  add column if not exists postal_code text;

-- Persetujuan privasi wajib (checkbox di Langkah 1).
-- Tanpa ini, order tidak boleh dibuat.
alter table public.orders
  add column if not exists privacy_consent boolean not null default false,
  add column if not exists privacy_consent_at timestamptz,
  add column if not exists draft_expires_at timestamptz;

-- Draft yang sudah ada: masa berlaku 14 hari dari dibuat.
update public.orders
set draft_expires_at = created_at + interval '14 days'
where draft_expires_at is null;

-- ---------- 2) profile_visibility: tambah field baru ----------
-- CHECK lama hanya mengizinkan field Tahap 1. Ganti dengan
-- daftar baru yang mencakup tanggal lahir, jenis kelamin,
-- kewarganegaraan, kota, dan provinsi.
alter table public.profile_visibility
  drop constraint if exists profile_visibility_field_name_check;
alter table public.profile_visibility
  add constraint profile_visibility_field_name_check
  check (field_name in (
    'full_name', 'headline', 'bio', 'email', 'phone',
    'whatsapp', 'location', 'photo_url', 'website_url',
    'linkedin_url', 'github_url', 'instagram_url',
    'date_of_birth', 'gender', 'nationality', 'city', 'province'
  ));

-- ---------- 3) Tabel OTP (untuk edit data pribadi) ----------
-- OTP 6 digit TIDAK PERNAH disimpan polos — hanya hash SHA-256.
-- Berlaku 10 menit, maks 5 kali coba, sekali pakai.
create table if not exists public.otps (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  email citext not null,
  code_hash text not null,
  purpose text not null default 'edit-private'
    check (purpose in ('edit-private', 'resend-link')),
  attempts integer not null default 0 check (attempts >= 0),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists otps_order_idx on public.otps (order_id, created_at desc);
alter table public.otps enable row level security;
-- Tanpa policy = tidak bisa diakses langsung. Hanya server
-- (service_role) yang boleh baca/tulis OTP.
create policy "otps_admin_read" on public.otps
  for select using (public.is_admin());

-- ---------- 4) Storage: bucket upload foto/gambar ----------
-- Bucket privat. Yang boleh baca publik hanya file yang
-- sudah dipakai di portofolio published — itu diatur lewat
-- URL publik yang disimpan di profiles.photo_url /
-- projects.image_url, bukan dengan membuka bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-uploads', 'portfolio-uploads', false,
  2097152, -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do nothing;

-- Policy storage: upload hanya lewat service_role (server),
-- jadi tidak ada policy insert untuk anon/authenticated.
-- Admin boleh baca untuk moderasi.
create policy "uploads_admin_read" on storage.objects
  for select using (
    bucket_id = 'portfolio-uploads' and public.is_admin()
  );

-- ---------- 5) Hapus draft otomatis 14 hari ----------
-- Fungsi ini menghapus order yang:
--   status draft/preview/pending_payment,
--   belum dibayar (tidak ada payments settlement),
--   dan draft_expires_at sudah lewat (14 hari).
-- Data turunan (profile, dsb.) ikut terhapus via CASCADE.
-- File upload di Storage harus dihapus aplikasi setelahnya
-- (lihat /api/cron/cleanup-drafts) karena Storage tidak
-- ikut CASCADE database.
create or replace function public.cleanup_expired_drafts()
returns integer language plpgsql security definer as $$
declare
  deleted_count integer;
begin
  delete from public.orders o
  where o.status in ('draft', 'preview', 'pending_payment')
    and o.draft_expires_at is not null
    and o.draft_expires_at < now()
    and not exists (
      select 1 from public.payments p
      where p.order_id = o.id and p.status = 'settlement'
    );
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

-- Cara menjalankan otomatis (pilih satu):
--  A. Vercel Cron: GET /api/cron/cleanup-drafts (lihat route itu)
--     dengan header Authorization: Bearer CRON_SECRET,
--     jadwal harian 03:00 WIB di vercel.json.
--  B. Supabase pg_cron (kalau tersedia di paketmu):
--     select cron.schedule('cleanup-drafts', '0 20 * * *',
--       $$select public.cleanup_expired_drafts()$$);
--     (20:00 UTC = 03:00 WIB)
