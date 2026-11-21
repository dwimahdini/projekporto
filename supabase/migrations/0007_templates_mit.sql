-- ============================================================
-- Tahap 9: Tiga template MIT baru (dari 100-free-html-templates)
-- Jalankan SETELAH 0006_tahap7.sql.
-- Menambah 3 template: developer, desainer, resume-cv.
-- Kelima template lama TETAP aktif (order yang sudah ada
-- memakai minimalis/kreatif — jangan dinonaktifkan).
-- Harga contoh: Rp49.000 semua, sama seperti yang lain.
-- Desain asli oleh mmrahmanbappi, lisensi MIT
-- (lihat docs/LICENSES.md).
-- ============================================================

insert into public.templates (id, name, slug, description, price) values
  ('developer', 'Developer', 'developer', 'Gaya terminal dan kode, filter proyek per teknologi, garis waktu pengalaman.', 49000),
  ('desainer', 'Desainer', 'desainer', 'Hero serif besar, studi kasus warna-warni, proses kerja 4 langkah.', 49000),
  ('resume-cv', 'Resume & CV', 'resume-cv', 'CV dua kolom navy-putih yang rapi, bisa di-print jadi PDF.', 49000)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price = excluded.price,
  is_active = true;
