-- ============================================================
-- Tahap 5: Pembayaran — antarmuka provider + Mock
-- Jalankan SETELAH 0003_templates.sql.
-- JANGAN ubah migrasi lama. File ini hanya MENAMBAH.
--
-- Catatan soal nama kolom (penting, baca dulu):
-- Tabel payments di 0001 sudah punya kolom `status` bertipe
-- enum payment_status (pending/settlement/capture/deny/
-- cancel/expire/refund/failure) untuk status MENTAH Midtrans,
-- dan `raw_notification` untuk payload mentah.
-- Spesifikasi Tahap 5 meminta status terpadu
-- pending | paid | failed | expired. Supaya tidak merusak
-- 0001, status terpadu itu disimpan di kolom BARU
-- `internal_status`, dan payload terpadu di `raw_payload`.
-- applyPaymentResult() memperbarui KEDUANYA sekaligus
-- (internal_status + status mentah yang dipetakan), jadi
-- webhook Midtrans nanti tetap bisa membaca kolom lamanya.
-- ============================================================

-- ---------- 1) Kolom baru di payments ----------
alter table public.payments
  add column if not exists provider text not null default 'midtrans'
    check (provider in ('mock', 'midtrans')),
  add column if not exists provider_ref text,
  add column if not exists amount integer check (amount is null or amount >= 0),
  add column if not exists raw_payload jsonb not null default '{}'::jsonb,
  add column if not exists internal_status text not null default 'pending'
    check (internal_status in ('pending', 'paid', 'failed', 'expired')),
  add column if not exists paid_email_sent_at timestamptz;

-- Isi kolom baru untuk baris lama (kalau ada):
-- provider dari midtrans_order_id, amount dari gross_amount,
-- internal_status dipetakan dari status mentah.
update public.payments
set
  provider = 'midtrans',
  provider_ref = midtrans_order_id,
  amount = gross_amount,
  raw_payload = coalesce(raw_notification, '{}'::jsonb),
  internal_status = case status
    when 'settlement' then 'paid'
    when 'capture' then 'paid'
    when 'expire' then 'expired'
    when 'deny' then 'failed'
    when 'cancel' then 'failed'
    when 'failure' then 'failed'
    else 'pending'
  end
where internal_status = 'pending' and status is not null;

create index if not exists payments_order_internal_idx
  on public.payments (order_id, internal_status);
create index if not exists payments_provider_ref_idx
  on public.payments (provider_ref) where provider_ref is not null;

-- RLS tetap seperti 0001: hanya admin yang boleh SELECT,
-- tidak ada policy untuk anon. Insert/update hanya lewat
-- server (service_role). Tidak ada policy baru di sini —
-- itu sengaja, supaya tidak ada celah baru.

-- ---------- 2) Fungsi atomik apply_payment_result ----------
-- SATU jalur transisi untuk Mock sekarang dan webhook
-- Midtrans nanti. Dipanggil dari TypeScript lewat RPC.
-- Sifatnya:
--  - Atomik: payment + order diubah dalam satu transaksi.
--  - Idempoten: hasil yang sama dipanggil dua kali
--    mengembalikan changed=false dan tidak mengubah apa pun.
--  - Paid bersifat final: paid tidak boleh turun ke
--    failed/expired.
--  - Hanya dari pending: failed/expired/paid yang sudah
--    final tidak bisa berubah lagi (bayar ulang harus
--    membuat payment BARU, bukan mengubah yang lama).
--  - Order harus pending_payment saat hasil diterapkan;
--    kalau tidak, transisi ditolak dan dicatat (return error).
create or replace function public.apply_payment_result(
  p_payment_id uuid,
  p_result text
)
returns jsonb language plpgsql security definer as $$
declare
  v_payment public.payments%rowtype;
  v_order public.orders%rowtype;
  v_new_order_status order_status;
  v_midtrans_status payment_status;
begin
  if p_result not in ('paid', 'failed', 'expired') then
    return jsonb_build_object('ok', false, 'error', 'invalid_result');
  end if;

  select * into v_payment from public.payments
  where id = p_payment_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'payment_not_found');
  end if;

  -- Idempoten: hasil yang sama -> tidak ada perubahan.
  if v_payment.internal_status = p_result then
    return jsonb_build_object(
      'ok', true, 'changed', false, 'already', true,
      'payment_id', v_payment.id, 'order_id', v_payment.order_id,
      'internal_status', v_payment.internal_status
    );
  end if;

  -- Paid bersifat final.
  if v_payment.internal_status = 'paid' then
    return jsonb_build_object('ok', false, 'error', 'paid_is_final', 'changed', false);
  end if;

  -- Hanya dari pending yang boleh berubah.
  if v_payment.internal_status <> 'pending' then
    return jsonb_build_object('ok', false, 'error', 'invalid_transition', 'changed', false);
  end if;

  select * into v_order from public.orders
  where id = v_payment.order_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'order_not_found');
  end if;

  -- Order harus sedang menunggu pembayaran.
  if v_order.status <> 'pending_payment' then
    return jsonb_build_object(
      'ok', false, 'error', 'invalid_order_status',
      'changed', false, 'order_status', v_order.status
    );
  end if;

  if p_result = 'paid' then
    v_new_order_status := 'domain_pending';
    v_midtrans_status := 'settlement';
  elsif p_result = 'failed' then
    -- Kembali ke preview supaya bisa bayar ulang.
    v_new_order_status := 'preview';
    v_midtrans_status := 'failure';
  else -- expired
    v_new_order_status := 'preview';
    v_midtrans_status := 'expire';
  end if;

  update public.payments
  set
    internal_status = p_result,
    status = v_midtrans_status,
    paid_at = case when p_result = 'paid' then now() else paid_at end,
    raw_payload = raw_payload || jsonb_build_object(
      'applied_result', p_result, 'applied_at', now()
    ),
    updated_at = now()
  where id = v_payment.id;

  update public.orders
  set status = v_new_order_status, updated_at = now()
  where id = v_order.id;

  return jsonb_build_object(
    'ok', true, 'changed', true,
    'payment_id', v_payment.id, 'order_id', v_payment.order_id,
    'internal_status', p_result, 'new_order_status', v_new_order_status
  );
end;
$$;
