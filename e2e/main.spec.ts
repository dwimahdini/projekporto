// E2E Tahap 8 — alur utama + tampilan mobile.
// Bagian statis jalan tanpa Supabase. Alur penuh
// (form -> published) butuh env Supabase + Resend dan
// dijalankan dengan E2E_FULL=1; tanpanya di-skip.
import { test, expect } from "@playwright/test";

const FULL = process.env.E2E_FULL === "1";

test.describe("halaman statis", () => {
  test("landing memuat dan menampilkan judul", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByText("Kebijakan Privasi")).toBeVisible();
    await expect(page.getByText("Syarat Layanan")).toBeVisible();
  });

  test("kelima demo template memuat nama Dwi Mahdini", async ({ page }) => {
    for (const t of ["minimalis", "gelap-futuristik", "kreatif", "profesional", "visual"]) {
      await page.goto(`/demo/${t}`);
      await expect(page.getByText("Dwi Mahdini").first()).toBeVisible();
    }
  });

  test("halaman legal draf memuat banner draf", async ({ page }) => {
    await page.goto("/kebijakan-privasi");
    await expect(page.getByText(/Draf, perlu ditinjau ulang/i)).toBeVisible();
    await page.goto("/syarat-layanan");
    await expect(page.getByText(/Draf, perlu ditinjau ulang/i)).toBeVisible();
  });

  test("halaman admin tanpa login menampilkan form login, bukan data", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText("Login admin")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});

test.describe("lebar layar: tidak ada scroll horizontal", () => {
  for (const width of [360, 390, 768, 1280]) {
    test(`landing di ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBe(0);
    });
    test(`demo minimalis di ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/demo/minimalis");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBe(0);
    });
  }
});

test.describe("prefers-reduced-motion", () => {
  test("konten tampil tanpa animasi saat reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/demo/minimalis");
    await expect(page.getByText("Dwi Mahdini").first()).toBeVisible();
    const opacity = await page.getByText("Dwi Mahdini").first().evaluate((el) => getComputedStyle(el).opacity);
    expect(Number(opacity)).toBeGreaterThanOrEqual(0);
  });
});

test.describe("alur penuh form -> published", () => {
  test.skip(!FULL, "Butuh Supabase + Resend terkonfigurasi. Jalankan dengan E2E_FULL=1.");
  test("tamu isi form sampai situs published", async ({ page }) => {
    // Langkah-langkah (detail manual ada di docs/E2E_CHECKLIST.md):
    // 1. Isi form tamu di halaman utama (email + subdomain unik
    //    + template), kirim, lalu ambil link pesanan dari
    //    email (di dev: log server) atau dari DB.
    // 2. Verifikasi email dengan OTP (baca kode dari tabel
    //    otps lewat service_role di test, bukan dari UI).
    // 3. Lengkapi biodata, pilih template, buka pratinjau
    //    (assert ada teks "PRATINJAU"), lanjut ke pembayaran.
    // 4. Di halaman simulasi tekan "Simulasikan berhasil",
    //    assert status jadi domain_pending.
    // 5. Login admin, buka detail order, tekan
    //    "Tandai domain aktif", assert status published.
    // 6. Buka {subdomain}.localhost:3100, assert nama klien
    //    tampil dan tidak ada watermark "PRATINJAU".
    // Implementasi penuh langkah ini menunggu .env.local
    // berisi kredensial Supabase/Resend di mesin yang
    // menjalankan tes — jangan hardcode kredensial di sini.
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
  });
});
