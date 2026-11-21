-- ============================================================
-- Tahap 6: Dashboard klien, hapus data, admin "Menunggu domain"
-- Jalankan SETELAH 0004_payments.sql.
-- JANGAN ubah migrasi lama. File ini hanya MENAMBAH.
-- ============================================================

-- ---------- 1) Permintaan hapus data (konfirmasi lewat email) ----------
-- Alur: klien tekan "Hapus data saya" -> server buat token acak,
-- kirim link /pesanan/[token]/hapus?code=... ke email klien.
-- Link berlaku 24 jam, sekali pakai. Tanpa link itu, data
-- TIDAK bisa dihapus — tombol di dashboard saja tidak cukup.
create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists deletion_requests_order_idx
  on public.deletion_requests (order_id);
alter table public.deletion_requests enable row level security;
-- RLS: tidak ada policy untuk anon. Akses hanya lewat server
-- (service_role), seperti otps.

-- ---------- 2) Jejak aktivasi domain (idempoten) ----------
-- published_at: kapan order berubah menjadi published.
-- published_email_sent_at: kapan email "situs aktif" dikirim.
-- Keduanya dipakai tombol "Tandai domain aktif" supaya
-- klik kedua tidak mengirim email dua kali.
-- domain_status: cerminan admin untuk status domain saja
-- ('pending' saat domain_pending, 'active' saat published,
-- 'inactive' untuk sisanya). Sumber kebenaran status order
-- TETAP orders.status — kolom ini hanya label operasional,
-- diisi dari kode (applyPaymentResult / activate), bukan
-- dari SQL, supaya tidak ada jalur status kedua di database.
alter table public.orders
  add column if not exists published_at timestamptz,
  add column if not exists published_email_sent_at timestamptz,
  add column if not exists domain_status text not null default 'inactive'
    check (domain_status in ('inactive', 'pending', 'active')),
  add column if not exists domain_status_updated_at timestamptz;
