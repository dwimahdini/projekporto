-- ============================================================
-- Tahap 3: Lima template final
-- Jalankan SETELAH 0002_tahap2.sql.
-- Mengganti 5 template Tahap 1 (minimal/modern/bold/
-- classic/creative) dengan 5 template final:
-- minimalis, gelap-futuristik, kreatif, profesional, visual.
-- Harga contoh: Rp49.000 semua.
-- ============================================================

-- Hapus template lama yang tidak dipakai order published
-- (order seed memakai 'minimal' — diubah dulu ke 'minimalis').
update public.orders set template_id = 'minimalis' where template_id = 'minimal';

insert into public.templates (id, name, slug, description, price) values
  ('minimalis', 'Minimalis', 'minimalis', 'Putih bersih, tipografi besar, banyak ruang kosong.', 49000),
  ('gelap-futuristik', 'Gelap Futuristik', 'gelap-futuristik', 'Tema gelap, efek glow, background partikel ringan.', 49000),
  ('kreatif', 'Kreatif', 'kreatif', 'Warna-warni, kartu miring saat hover, animasi playful.', 49000),
  ('profesional', 'Profesional', 'profesional', 'Rapi dan formal, cocok untuk melamar kerja kantoran.', 49000),
  ('visual', 'Visual', 'visual', 'Hero foto besar, galeri proyek dengan lightbox.', 49000)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price = excluded.price,
  is_active = true;

-- Nonaktifkan template lama supaya tidak muncul di form.
update public.templates set is_active = false
where id in ('modern', 'bold', 'classic', 'creative');
