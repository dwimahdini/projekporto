-- ============================================================
-- group.portofolio.my.id — Migrasi 0001: Fondasi
-- Jalankan di Supabase: SQL Editor > paste file ini > Run
-- Urutan penting: extension -> enum -> tabel -> trigger
--   -> helper -> RLS -> view/fungsi publik
-- ============================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------- ENUM ----------
-- Status lengkap dari spesifikasi awal. Jangan hapus
-- 'domain_pending': lunas TAPI belum aktif. Hanya admin
-- yang boleh mengubahnya jadi 'published'.
create type order_status as enum (
  'draft', 'preview', 'pending_payment', 'paid',
  'domain_pending', 'published',
  'expired', 'cancelled', 'deleted'
);

-- Status mentah dari Midtrans. Simpan apa adanya di
-- payments.transaction_status, jangan diterjemahkan
-- sendiri di frontend.
create type payment_status as enum (
  'pending', 'settlement', 'capture', 'deny',
  'cancel', 'expire', 'refund', 'failure'
);

-- ---------- HELPER: updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 1) templates — 5 template yang dijual
-- Harga disimpan di sini sebagai sumber kebenaran.
-- orders.price_snapshot mengunci harga saat order dibuat,
-- jadi kalau harga template naik, order lama tidak berubah.
-- ============================================================
create table public.templates (
  id text primary key, -- contoh: 'minimal', 'modern'
  name text not null,
  slug text not null unique,
  description text,
  price integer not null check (price >= 0), -- dalam Rupiah
  currency text not null default 'IDR',
  is_active boolean not null default true,
  preview_image_url text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2) orders — satu order = satu portofolio yang dibeli
-- Tanpa login klien. Identitas klien adalah token rahasia
-- yang dikirim lewat email. Di database HANYA hash-nya
-- yang disimpan (SHA-256 hex). Token asli tidak pernah
-- disimpan, jadi kalau database bocor, link order tidak
-- bisa ditebak dari isi database.
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  template_id text not null references public.templates (id),
  email citext not null,
  -- Subdomain yang diminta klien, contoh: 'wirza'.
  -- citext supaya 'Wirza' dan 'wirza' dianggap sama.
  -- Validasi karakter (huruf/angka/strip) dilakukan di
  -- aplikasi (Zod) SEBELUM insert, karena CHECK di bawah
  -- hanya lapisan kedua.
  subdomain citext unique
    check (subdomain is null or subdomain ~ '^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])$'),
  token_hash text not null unique,
  token_expires_at timestamptz not null,
  status order_status not null default 'draft',
  email_verified_at timestamptz,
  midtrans_order_id text unique,
  price_snapshot integer not null check (price_snapshot >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_email_idx on public.orders (email);
create index orders_status_idx on public.orders (status);
create index orders_subdomain_idx on public.orders (subdomain)
  where subdomain is not null;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- 3) profiles — data identitas PRIVAT pemilik portofolio
-- Satu order punya tepat satu profile (1:1).
-- Kolom role di sini yang membedakan admin dan klien:
--   role='admin'  -> baris admin, order_id NULL,
--                    auth_user_id terisi (Supabase Auth)
--   role='client' -> baris klien, order_id terisi,
--                    auth_user_id NULL (tamu, tanpa login)
-- Alamat (address) sengaja TIDAK punya flag visibility:
-- alamat tidak pernah tampil di halaman publik.
-- ============================================================
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  order_id uuid unique references public.orders (id) on delete cascade,
  auth_user_id uuid references auth.users (id) on delete set null,
  role text not null default 'client'
    check (role in ('client', 'admin')),
  full_name text not null,
  headline text,
  bio text,
  email citext,
  phone text,
  whatsapp text,
  location text,
  address text, -- privat, tidak pernah dipublikasikan
  photo_url text,
  website_url text,
  linkedin_url text,
  github_url text,
  instagram_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_order_check check (
    (role = 'admin' and order_id is null and auth_user_id is not null)
    or (role = 'client' and order_id is not null)
  )
);
create index profiles_auth_user_idx on public.profiles (auth_user_id)
  where auth_user_id is not null;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- 4) profile_visibility — flag tampil/tidak per field
-- Satu baris per field. Kalau baris tidak ada, view
-- memakai default: field umum = tampil, field kontak
-- privat (email/phone/whatsapp) = sembunyi.
-- ============================================================
create table public.profile_visibility (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  field_name text not null check (field_name in (
    'full_name', 'headline', 'bio', 'email', 'phone',
    'whatsapp', 'location', 'photo_url', 'website_url',
    'linkedin_url', 'github_url', 'instagram_url'
  )),
  is_visible boolean not null default true,
  primary key (profile_id, field_name)
);

-- ============================================================
-- 5) Tabel anak — semuanya milik satu profile.
-- is_visible per baris: klien bisa sembunyikan satu
-- pengalaman/proyek tertentu tanpa menghapusnya.
-- ============================================================
create table public.education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  institution text not null,
  degree text,
  field_of_study text,
  start_date date,
  end_date date,
  gpa numeric(3, 2) check (gpa is null or (gpa >= 0 and gpa <= 4)),
  description text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index education_profile_idx on public.education (profile_id, sort_order);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  company text not null,
  position text not null,
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index experiences_profile_idx on public.experiences (profile_id, sort_order);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  url text,
  image_url text,
  tech_stack text[] not null default '{}',
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index projects_profile_idx on public.projects (profile_id, sort_order);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  category text,
  level integer check (level is null or (level >= 1 and level <= 5)),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (profile_id, name)
);
create index skills_profile_idx on public.skills (profile_id, sort_order);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  issuer text,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index certifications_profile_idx on public.certifications (profile_id, sort_order);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  publisher text,
  published_date date,
  url text,
  description text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create index publications_profile_idx on public.publications (profile_id, sort_order);

-- ============================================================
-- 6) payments — jejak pembayaran Midtrans
-- raw_notification disimpan utuh (jsonb) untuk audit.
-- Jangan pernah update status order dari data ini lewat
-- frontend — hanya webhook yang boleh.
-- ============================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  midtrans_order_id text not null unique,
  gross_amount integer not null check (gross_amount >= 0),
  payment_type text,
  transaction_status text,
  fraud_status text,
  status payment_status not null default 'pending',
  raw_notification jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_idx on public.payments (order_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Prinsip: default DENY. Tidak ada policy = tidak bisa
-- diakses, meskipun pakai anon key.
--
-- Tamu (tanpa login) TIDAK punya policy langsung ke
-- orders/profiles. Mereka hanya lewat server (service_role
-- di Next.js) yang sudah memverifikasi token_hash.
-- Ini sengaja — kalau anon bisa SELECT orders, semua
-- token_hash dan email klien bisa dibaca orang lain.
--
-- Admin dicek lewat fungsi is_admin() (SECURITY DEFINER)
-- supaya tidak terjadi rekursi policy di tabel profiles.
-- ============================================================
alter table public.templates enable row level security;
alter table public.orders enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_visibility enable row level security;
alter table public.education enable row level security;
alter table public.experiences enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.certifications enable row level security;
alter table public.publications enable row level security;
alter table public.payments enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid() and role = 'admin'
  );
$$;

-- templates: publik hanya boleh baca yang aktif.
create policy "templates_read_public" on public.templates
  for select using (is_active = true);
create policy "templates_admin_all" on public.templates
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: hanya admin. Tamu lewat server (service_role).
create policy "orders_admin_all" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- profiles: admin semua; klien yang login (nanti, kalau
-- ada login) hanya barisnya sendiri. Tamu: tanpa policy.
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
create policy "profiles_owner_read_update" on public.profiles
  for select using (auth_user_id = auth.uid());
create policy "profiles_owner_update" on public.profiles
  for update using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- Helper untuk tabel anak: "profile ini milik user login?"
-- Dipakai di policy tabel anak dan visibility.
create or replace function public.owns_profile(p_profile_id uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = p_profile_id and auth_user_id = auth.uid()
  );
$$;

-- Pola yang sama untuk semua tabel anak + visibility:
-- admin = semua, pemilik = CRUD barisnya sendiri.
create policy "profile_visibility_admin_all" on public.profile_visibility
  for all using (public.is_admin()) with check (public.is_admin());
create policy "profile_visibility_owner_all" on public.profile_visibility
  for all using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy "education_admin_all" on public.education
  for all using (public.is_admin()) with check (public.is_admin());
create policy "education_owner_all" on public.education
  for all using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy "experiences_admin_all" on public.experiences
  for all using (public.is_admin()) with check (public.is_admin());
create policy "experiences_owner_all" on public.experiences
  for all using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy "projects_admin_all" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());
create policy "projects_owner_all" on public.projects
  for all using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy "skills_admin_all" on public.skills
  for all using (public.is_admin()) with check (public.is_admin());
create policy "skills_owner_all" on public.skills
  for all using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy "certifications_admin_all" on public.certifications
  for all using (public.is_admin()) with check (public.is_admin());
create policy "certifications_owner_all" on public.certifications
  for all using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

create policy "publications_admin_all" on public.publications
  for all using (public.is_admin()) with check (public.is_admin());
create policy "publications_owner_all" on public.publications
  for all using (public.owns_profile(profile_id))
  with check (public.owns_profile(profile_id));

-- payments: hanya admin yang boleh baca. Insert/update
-- hanya dari webhook lewat service_role.
create policy "payments_admin_read" on public.payments
  for select using (public.is_admin());

-- ============================================================
-- VIEW public_portfolio — SATU-SATUNYA sumber data publik
-- Aturan:
--  1. Hanya order status='published'.
--  2. Field scalar hanya tampil kalau flag visibility-nya
--     true (atau default-nya true untuk field umum).
--  3. email/phone/whatsapp default SEMBUNYI.
--  4. address TIDAK PERNAH ada di view ini.
--  5. Tabel anak hanya yang is_visible=true, sebagai JSON.
-- Halaman subdomain ([subdomain].portofolio.my.id) dan
-- preview WAJIB query view/fungsi ini, jangan query
-- profiles/orders langsung.
-- ============================================================
create or replace view public.public_portfolio as
select
  p.id as profile_id,
  o.subdomain,
  o.template_id,
  t.name as template_name,
  case when coalesce(v_name.is_visible, true) then p.full_name end as full_name,
  case when coalesce(v_headline.is_visible, true) then p.headline end as headline,
  case when coalesce(v_bio.is_visible, true) then p.bio end as bio,
  case when coalesce(v_location.is_visible, true) then p.location end as location,
  case when coalesce(v_photo.is_visible, true) then p.photo_url end as photo_url,
  case when coalesce(v_website.is_visible, true) then p.website_url end as website_url,
  case when coalesce(v_linkedin.is_visible, true) then p.linkedin_url end as linkedin_url,
  case when coalesce(v_github.is_visible, true) then p.github_url end as github_url,
  case when coalesce(v_instagram.is_visible, true) then p.instagram_url end as instagram_url,
  case when coalesce(v_email.is_visible, false) then p.email end as email,
  case when coalesce(v_phone.is_visible, false) then p.phone end as phone,
  case when coalesce(v_whatsapp.is_visible, false) then p.whatsapp end as whatsapp,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'institution', e.institution, 'degree', e.degree,
      'field_of_study', e.field_of_study,
      'start_date', e.start_date, 'end_date', e.end_date,
      'gpa', e.gpa, 'description', e.description
    ) order by e.sort_order, e.start_date desc)
    from public.education e
    where e.profile_id = p.id and e.is_visible
  ), '[]'::jsonb) as education,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'company', x.company, 'position', x.position,
      'start_date', x.start_date, 'end_date', x.end_date,
      'is_current', x.is_current, 'description', x.description
    ) order by x.sort_order, x.start_date desc)
    from public.experiences x
    where x.profile_id = p.id and x.is_visible
  ), '[]'::jsonb) as experiences,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'title', j.title, 'description', j.description,
      'url', j.url, 'image_url', j.image_url,
      'tech_stack', j.tech_stack
    ) order by j.sort_order)
    from public.projects j
    where j.profile_id = p.id and j.is_visible
  ), '[]'::jsonb) as projects,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'name', s.name, 'category', s.category, 'level', s.level
    ) order by s.sort_order, s.name)
    from public.skills s
    where s.profile_id = p.id and s.is_visible
  ), '[]'::jsonb) as skills,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'name', c.name, 'issuer', c.issuer,
      'issue_date', c.issue_date, 'expiry_date', c.expiry_date,
      'credential_id', c.credential_id, 'credential_url', c.credential_url
    ) order by c.sort_order, c.issue_date desc)
    from public.certifications c
    where c.profile_id = p.id and c.is_visible
  ), '[]'::jsonb) as certifications,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'title', u.title, 'publisher', u.publisher,
      'published_date', u.published_date, 'url', u.url,
      'description', u.description
    ) order by u.sort_order, u.published_date desc)
    from public.publications u
    where u.profile_id = p.id and u.is_visible
  ), '[]'::jsonb) as publications,
  o.updated_at as published_at
from public.orders o
join public.profiles p on p.order_id = o.id
join public.templates t on t.id = o.template_id
left join public.profile_visibility v_name
  on v_name.profile_id = p.id and v_name.field_name = 'full_name'
left join public.profile_visibility v_headline
  on v_headline.profile_id = p.id and v_headline.field_name = 'headline'
left join public.profile_visibility v_bio
  on v_bio.profile_id = p.id and v_bio.field_name = 'bio'
left join public.profile_visibility v_location
  on v_location.profile_id = p.id and v_location.field_name = 'location'
left join public.profile_visibility v_photo
  on v_photo.profile_id = p.id and v_photo.field_name = 'photo_url'
left join public.profile_visibility v_website
  on v_website.profile_id = p.id and v_website.field_name = 'website_url'
left join public.profile_visibility v_linkedin
  on v_linkedin.profile_id = p.id and v_linkedin.field_name = 'linkedin_url'
left join public.profile_visibility v_github
  on v_github.profile_id = p.id and v_github.field_name = 'github_url'
left join public.profile_visibility v_instagram
  on v_instagram.profile_id = p.id and v_instagram.field_name = 'instagram_url'
left join public.profile_visibility v_email
  on v_email.profile_id = p.id and v_email.field_name = 'email'
left join public.profile_visibility v_phone
  on v_phone.profile_id = p.id and v_phone.field_name = 'phone'
left join public.profile_visibility v_whatsapp
  on v_whatsapp.profile_id = p.id and v_whatsapp.field_name = 'whatsapp'
where o.status = 'published';

-- Fungsi yang dipakai middleware/halaman subdomain:
-- cari satu portofolio publik berdasarkan subdomain.
create or replace function public.public_portfolio_by_subdomain(p_subdomain citext)
returns setof public.public_portfolio
language sql stable as $$
  select * from public.public_portfolio
  where subdomain = p_subdomain;
$$;

-- View dibaca lewat anon key oleh server publik, tapi
-- isinya sudah disaring (hanya published + hanya field
-- yang diizinkan). Jangan grant tabel aslinya ke anon.
grant select on public.public_portfolio to anon, authenticated;
grant execute on function public.public_portfolio_by_subdomain(citext) to anon, authenticated;
