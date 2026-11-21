import { defineConfig } from "@playwright/test";

// E2E Tahap 8. Jalankan: npx playwright test
// Server dev otomatis dinyalakan di port 3100.
// Tes alur penuh (form -> published) butuh Supabase +
// Resend terkonfigurasi dan dijalankan dengan:
//   E2E_FULL=1 npx playwright test -g "alur penuh"
// Tanpa itu, tes alur penuh di-skip dan hanya tes statis
// (landing, demo, lebar layar, reduced-motion) yang jalan.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100/",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
