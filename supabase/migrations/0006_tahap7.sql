-- ============================================================
-- Tahap 7: audit keamanan + status disabled + retensi hapus
-- Jalankan SETELAH 0005_tahap6.sql.
-- JANGAN ubah migrasi lama. File ini hanya MENAMBAH,
-- kecuali cleanup_expired_drafts() yang diganti versinya
-- (fungsi, bukan tabel — versi baru tetap idempoten).
--
-- PERHATIAN: "alter type ... add value" TIDAK BISA jalan
-- di dalam blok transaksi. Jalankan file ini lewat
-- Supabase SQL Editor (menjalankan tiap pernyataan
-- sendiri-sendiri) atau pisahkan baris ALTER TYPE itu
-- dan jalankan sendiri dulu sebelum sisanya.
-- ============================================================

-- ---------- 1) Status 'disabled' untuk situs yang dinonaktifkan admin ----------
alter type public.order_status add value if not exists 'disabled';

-- ---------- 2) Tabel audit_log ----------
-- Semua aksi admin (aktivasi, nonaktifkan, aktifkan lagi,
-- batalkan, melihat data pribadi) dicatat di sini.
-- order_id boleh null (aksi yang tidak terkait satu order).
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  order_id uuid references public.orders (id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists audit_log_order_idx on public.audit_log (order_id);
create index if not exists audit_log_created_idx on public.audit_log (created_at desc);
alter table public.audit_log enable row level security;
-- RLS: tidak ada policy untuk anon. Baca/tulis hanya lewat
-- server (service_role). Admin membaca log lewat API server.

-- ---------- 3) Jejak penghapusan ----------
alter table public.orders
  add column if not exists deleted_at timestamptz;

-- ---------- 4) cleanup_expired_drafts() versi 2 ----------
-- Sama seperti versi Tahap 2 (hapus draft/preview/
-- pending_payment yang tidak dibayar setelah 14 hari,
-- idempoten), DITAMBAH: hapus juga file upload di
-- Supabase Storage (bucket portfolio-uploads) milik
-- order yang dihapus, supaya tidak ada file yatim.
-- Dipanggil cron GET /api/cron/cleanup-drafts.
create or replace function public.cleanup_expired_drafts()
returns integer language plpgsql security definer as $$
declare
  deleted_count integer := 0;
  v_order_id uuid;
begin
  for v_order_id in
    select o.id from public.orders o
    where o.status in ('draft', 'preview', 'pending_payment')
      and o.draft_expires_at is not null
      and o.draft_expires_at < now()
      and not exists (
        select 1 from public.payments p
        where p.order_id = o.id and p.internal_status = 'paid'
      )
  loop
    -- Hapus file upload milik order ini (kalau bucket ada).
    delete from storage.objects
    where bucket_id = 'portfolio-uploads'
      and name like v_order_id::text || '/%';
    delete from public.orders where id = v_order_id;
    deleted_count := deleted_count + 1;
  end loop;
  return deleted_count;
end;
$$;
