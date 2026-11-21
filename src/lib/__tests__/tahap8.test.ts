// Tes Tahap 8 — melengkapi cakupan kritis yang belum ada
// di tes Tahap 5–7 (semua fungsi murni, tanpa database).
// Yang SUDAH teruji di file lain dan tidak diulang di sini:
// - isMockPaymentEnabled semua kombinasi env (payments.test.ts)
// - decidePaymentTransition idempoten + paid final (payments.test.ts)
// - canAccessPayment token A vs B (payments.test.ts, tahap6.test.ts)
// - validasi subdomain + public_portfolio + aktivasi (tahap6.test.ts)
// - aksi admin + mode hapus + cron + sanitasi (tahap7.test.ts)
import { describe, it, expect } from "vitest";
import { assertMockPaymentEnabled, MockNotAvailableError, isMockPaymentEnabled } from "../payments/mock-guard";
import { decidePaymentTransition } from "../payments/transition";
import { checkRateLimit } from "../rate-limit";
import { subdomainSchema } from "../validation";
import { canRenderPublicPortfolio } from "../subdomain";
import { hashToken } from "../validation";

describe("penjaga mock: 404 saat syarat tidak terpenuhi", () => {
  it.each([
    { PAYMENT_PROVIDER: "midtrans", ALLOW_MOCK_PAYMENT: "true", VERCEL_ENV: "development" },
    { PAYMENT_PROVIDER: "mock", ALLOW_MOCK_PAYMENT: "false", VERCEL_ENV: "development" },
    { PAYMENT_PROVIDER: "mock", ALLOW_MOCK_PAYMENT: "true", VERCEL_ENV: "production" },
    { PAYMENT_PROVIDER: undefined, ALLOW_MOCK_PAYMENT: "true", VERCEL_ENV: "development" },
  ])("assert melempar MockNotAvailableError (404) untuk %j", (env) => {
    expect(isMockPaymentEnabled(env)).toBe(false);
    try {
      assertMockPaymentEnabled(env);
      expect.unreachable("seharusnya melempar");
    } catch (e) {
      expect(e).toBeInstanceOf(MockNotAvailableError);
      expect((e as MockNotAvailableError).status).toBe(404);
    }
  });
  it("assert lolos saat mock aktif", () => {
    expect(() => assertMockPaymentEnabled({ PAYMENT_PROVIDER: "mock", ALLOW_MOCK_PAYMENT: "true", VERCEL_ENV: "development" })).not.toThrow();
  });
});

describe("applyPaymentResult — logika transisi (cerminan RPC SQL 0004)", () => {
  it("notifikasi paid yang sama datang dua kali -> idempoten", () => {
    const first = decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "pending_payment", result: "paid" });
    expect(first).toEqual({ allowed: true, changed: true, newPaymentStatus: "paid", newOrderStatus: "domain_pending" });
    const second = decidePaymentTransition({ currentPaymentStatus: "paid", currentOrderStatus: "domain_pending", result: "paid" });
    expect(second.changed).toBe(false);
    expect(second.alreadyApplied).toBe(true);
  });
  it("paid tidak turun status apa pun yang terjadi setelahnya", () => {
    for (const result of ["failed", "expired"] as const) {
      const d = decidePaymentTransition({ currentPaymentStatus: "paid", currentOrderStatus: "domain_pending", result });
      expect(d.allowed).toBe(false);
      expect(d.error).toBe("paid_is_final");
    }
  });
  it("transisi tidak sah ditolak: paid dari draft/preview, failed tanpa pending", () => {
    expect(decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "draft", result: "paid" }).allowed).toBe(false);
    expect(decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "preview", result: "paid" }).allowed).toBe(false);
    expect(decidePaymentTransition({ currentPaymentStatus: "failed", currentOrderStatus: "preview", result: "paid" }).allowed).toBe(false);
  });
  it("failed/expired -> kembali ke preview (bisa bayar ulang)", () => {
    expect(decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "pending_payment", result: "failed" }).newOrderStatus).toBe("preview");
    expect(decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "pending_payment", result: "expired" }).newOrderStatus).toBe("preview");
  });
});

describe("akses berbasis token: hash deterministik, token beda = hash beda", () => {
  it("hashToken deterministik dan tidak menyimpan token polos", async () => {
    const a = await hashToken("token-rahasia-12345678901234567890");
    const b = await hashToken("token-rahasia-12345678901234567890");
    const c = await hashToken("token-lain-12345678901234567890123");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).not.toContain("token-rahasia");
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("validasi subdomain: batas panjang", () => {
  it("30 karakter diterima, 31 ditolak", () => {
    expect(subdomainSchema.safeParse("a".repeat(30)).success).toBe(true);
    expect(subdomainSchema.safeParse("a".repeat(31)).success).toBe(false);
  });
  it("3 karakter diterima, 2 ditolak", () => {
    expect(subdomainSchema.safeParse("abc").success).toBe(true);
    expect(subdomainSchema.safeParse("ab").success).toBe(false);
  });
});

describe("filter public_portfolio: hanya published", () => {
  it.each(["published"])("'%s' tampil", (s) => expect(canRenderPublicPortfolio(s)).toBe(true));
  it.each(["disabled", "draft", "domain_pending"])("'%s' 404", (s) => expect(canRenderPublicPortfolio(s)).toBe(false));
});

describe("rate limit: mengizinkan sampai batas, lalu menolak", () => {
  it("batas 3x per jendela, percobaan ke-4 ditolak", () => {
    const key = `tahap8-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit({ key, limit: 3, windowMs: 60000 }).allowed).toBe(true);
    }
    const fourth = checkRateLimit({ key, limit: 3, windowMs: 60000 });
    expect(fourth.allowed).toBe(false);
    expect(fourth.retryAfterSec).toBeGreaterThan(0);
  });
});
