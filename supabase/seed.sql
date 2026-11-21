-- ============================================================
-- Seed contoh — Dwi Mahdini, Fullstack Web Developer
-- HANYA untuk development. JANGAN jalankan di production
-- tanpa mengganti token contoh di bawah.
--
-- Token contoh (hanya untuk tes lokal):
--   dwi-seed-token-1234567890abcdef
-- Link lokal: http://localhost:3000/pesanan/dwi-seed-token-1234567890abcdef
-- Hash di bawah dihitung dari token itu. Di aplikasi nyata,
-- token dibuat dengan crypto.randomBytes(32) lalu di-hash
-- dengan SHA-256 sebelum disimpan.
-- ============================================================

-- 5 template. Harga contoh: Rp49.000 semua.
-- Ubah di tabel templates kalau hargamu beda.
insert into public.templates (id, name, slug, description, price) values
  ('minimalis', 'Minimalis', 'minimalis', 'Putih bersih, tipografi besar, banyak ruang kosong.', 49000),
  ('gelap-futuristik', 'Gelap Futuristik', 'gelap-futuristik', 'Tema gelap, efek glow, background partikel ringan.', 49000),
  ('kreatif', 'Kreatif', 'kreatif', 'Warna-warni, kartu miring saat hover, animasi playful.', 49000),
  ('profesional', 'Profesional', 'profesional', 'Rapi dan formal, cocok untuk melamar kerja kantoran.', 49000),
  ('visual', 'Visual', 'visual', 'Hero foto besar, galeri proyek dengan lightbox.', 49000)
on conflict (id) do nothing;

-- Order contoh: sudah published, subdomain dwimahdini
insert into public.orders
  (id, template_id, email, subdomain, token_hash, token_expires_at, status, email_verified_at, price_snapshot)
values (
  '11111111-1111-1111-1111-111111111111',
  'minimalis',
  'dwimahdini12@gmail.com',
  'dwimahdini',
  encode(digest('dwi-seed-token-1234567890abcdef', 'sha256'), 'hex'),
  now() + interval '30 days',
  'published',
  now(),
  49000
) on conflict (id) do nothing;

-- Profile Dwi Mahdini (dari CV)
insert into public.profiles
  (id, order_id, role, full_name, headline, bio, email, phone, whatsapp, location, address, photo_url, website_url, github_url)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'client',
  'Dwi Mahdini',
  'Fullstack Web Developer',
  'Lulusan S1 Teknik Informatika UIN Suska Riau. Membangun website dengan Laravel, Next.js, dan MySQL/PostgreSQL. Fokus ke website yang cepat, rapi, dan mudah dipakai.',
  'dwimahdini12@gmail.com',
  '081215660192',
  '081215660192',
  'Pekanbaru, Riau',
  'Jl. Rawa Indah, Pekanbaru', -- privat, tidak tampil di view
  null,
  'https://porto.mahdini.my.id/',
  'https://github.com/dwimahdini'
) on conflict (id) do nothing;

-- Visibility: email & telepon SEMBUNYI secara default.
-- Klien bisa mengubahnya dari form nanti.
insert into public.profile_visibility (profile_id, field_name, is_visible) values
  ('22222222-2222-2222-2222-222222222222', 'email', false),
  ('22222222-2222-2222-2222-222222222222', 'phone', false),
  ('22222222-2222-2222-2222-222222222222', 'whatsapp', false),
  ('22222222-2222-2222-2222-222222222222', 'full_name', true),
  ('22222222-2222-2222-2222-222222222222', 'headline', true),
  ('22222222-2222-2222-2222-222222222222', 'bio', true),
  ('22222222-2222-2222-2222-222222222222', 'location', true)
on conflict do nothing;

insert into public.education
  (profile_id, institution, degree, field_of_study, start_date, end_date, gpa, sort_order)
values (
  '22222222-2222-2222-2222-222222222222',
  'UIN Suska Riau', 'S1', 'Teknik Informatika',
  '2022-08-01', '2026-06-01', 3.58, 0
) on conflict do nothing;

insert into public.experiences
  (profile_id, company, position, start_date, end_date, is_current, description, sort_order)
values
  ('22222222-2222-2222-2222-222222222222',
   'Freelance', 'Web Developer',
   '2024-12-01', null, true,
   'Membangun website portofolio, toko digital, dan aplikasi gudang untuk klien.', 0),
  ('22222222-2222-2222-2222-222222222222',
   'Lab Inkubator Bisnis TI UIN Suska Riau', 'Web Developer',
   '2025-02-01', '2025-07-31', false,
   'Mengembangkan aplikasi web untuk kebutuhan lab dan mahasiswa.', 1)
on conflict do nothing;

insert into public.projects
  (profile_id, title, description, url, tech_stack, sort_order)
values
  ('22222222-2222-2222-2222-222222222222',
   'Toko Digital Lynk.id', 'Storefront untuk produk digital: kelas PHP, source code Laravel, dan e-book.',
   'https://lynk.id/wikithey', ARRAY['Next.js','Tailwind CSS'], 0),
  ('22222222-2222-2222-2222-222222222222',
   'Website Gempa Global (USGS)', 'Peta gempa global interaktif, refresh tiap menit, data USGS.',
   'https://github.com/dwimahdini/gempa-global', ARRAY['Next.js','Leaflet'], 1),
  ('22222222-2222-2222-2222-222222222222',
   'Peminjaman Alat Gudang', 'Aplikasi peminjaman alat untuk 12 teknisi gudang.',
   null, ARRAY['Next.js','Supabase'], 2),
  ('22222222-2222-2222-2222-222222222222',
   'Pembuat CV ATS', 'Website pembuat CV ATS: isi biodata, unduh PDF, tanpa login.',
   null, ARRAY['Next.js','Tailwind CSS'], 3)
on conflict do nothing;

insert into public.skills
  (profile_id, name, category, level, sort_order)
values
  ('22222222-2222-2222-2222-222222222222', 'Laravel', 'Backend', 4, 0),
  ('22222222-2222-2222-2222-222222222222', 'Next.js', 'Frontend', 4, 1),
  ('22222222-2222-2222-2222-222222222222', 'JavaScript', 'Bahasa', 4, 2),
  ('22222222-2222-2222-2222-222222222222', 'TypeScript', 'Bahasa', 3, 3),
  ('22222222-2222-2222-2222-222222222222', 'MySQL', 'Database', 4, 4),
  ('22222222-2222-2222-2222-222222222222', 'PostgreSQL', 'Database', 3, 5),
  ('22222222-2222-2222-2222-222222222222', 'Android Studio', 'Mobile', 3, 6)
on conflict do nothing;

insert into public.certifications
  (profile_id, name, issuer, issue_date, credential_id, sort_order)
values
  ('22222222-2222-2222-2222-222222222222',
   'Intro to Front-End Development', 'Meta (Coursera)', '2026-08-18', 'DXIP03SSFWK2', 0),
  ('22222222-2222-2222-2222-222222222222',
   'Technical Support Fundamentals', 'Google (Coursera)', '2026-10-31', 'PKE6GST0YQZH', 1),
  ('22222222-2222-2222-2222-222222222222',
   'Implementing the Application Front End Using React Components', 'IBM', '2026-09-04', null, 2),
  ('22222222-2222-2222-2222-222222222222',
   'Responsive Web Design', 'freeCodeCamp', '2025-09-25', null, 3)
on conflict do nothing;

insert into public.publications
  (profile_id, title, publisher, url, description, sort_order)
values (
  '22222222-2222-2222-2222-222222222222',
  'Chatbot Generative AI Berbasis Hybrid RAG dengan Integrasi RIASEC untuk Rekomendasi Jurusan',
  'JUPTIK',
  'https://ejournal.ummuba.ac.id/index.php/JUPTIK/en/article/view/4373',
  'Skripsi: perancangan chatbot Hybrid RAG untuk rekomendasi jurusan.', 0
) on conflict do nothing;

-- Cek hasil (jalankan setelah seed):
-- select * from public.public_portfolio_by_subdomain('dwimahdini');
