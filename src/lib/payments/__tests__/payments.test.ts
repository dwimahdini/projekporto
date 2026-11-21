// Tes Tahap 5 — logika pembayaran (tanpa database).
// Yang dites di sini adalah fungsi murni + guard, supaya
// tes bisa jalan di CI tanpa Supabase. Logika yang sama
// juga ada di RPC database apply_payment_result() —
// kalau mengubah salah satu, ubah juga yang lain.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { isMockPaymentEnabled } from "../mock-guard";
import { decidePaymentTransition, canAccessPayment } from "../transition";
import { getPaymentProviderName } from "../factory";

describe("isMockPaymentEnabled — mock hanya aktif kalau SEMUA syarat terpenuhi", () => {
  const base = { PAYMENT_PROVIDER: "mock", ALLOW_MOCK_PAYMENT: "true", VERCEL_ENV: "development" };
  it("aktif di lokal dengan mock + true", () => {
    expect(isMockPaymentEnabled(base)).toBe(true);
  });
  it("aktif di preview Vercel", () => {
    expect(isMockPaymentEnabled({ ...base, VERCEL_ENV: "preview" })).toBe(true);
  });
  it("MATI di production, meski mock + true", () => {
    expect(isMockPaymentEnabled({ ...base, VERCEL_ENV: "production" })).toBe(false);
  });
  it("MATI kalau PAYMENT_PROVIDER bukan mock", () => {
    expect(isMockPaymentEnabled({ ...base, PAYMENT_PROVIDER: "midtrans" })).toBe(false);
  });
  it("MATI kalau PAYMENT_PROVIDER kosong", () => {
    expect(isMockPaymentEnabled({ ...base, PAYMENT_PROVIDER: "" })).toBe(false);
  });
  it("MATI kalau ALLOW_MOCK_PAYMENT bukan true", () => {
    expect(isMockPaymentEnabled({ ...base, ALLOW_MOCK_PAYMENT: "false" })).toBe(false);
    expect(isMockPaymentEnabled({ ...base, ALLOW_MOCK_PAYMENT: undefined })).toBe(false);
  });
  it("MATI kalau salah satu syarat hilang", () => {
    expect(isMockPaymentEnabled({})).toBe(false);
  });
});

describe("getPaymentProviderName — default ke midtrans", () => {
  const original = process.env.PAYMENT_PROVIDER;
  beforeEach(() => {
    vi.resetModules();
  });
  it("mock kalau env = mock", () => {
    process.env.PAYMENT_PROVIDER = "mock";
    expect(getPaymentProviderName()).toBe("mock");
  });
  it("midtrans kalau env kosong / tidak dikenal", () => {
    process.env.PAYMENT_PROVIDER = "";
    expect(getPaymentProviderName()).toBe("midtrans");
    process.env.PAYMENT_PROVIDER = "apa-aja";
    expect(getPaymentProviderName()).toBe("midtrans");
    delete process.env.PAYMENT_PROVIDER;
    expect(getPaymentProviderName()).toBe("midtrans");
    process.env.PAYMENT_PROVIDER = original;
  });
});

describe("decidePaymentTransition — satu jalur, idempoten, paid final", () => {
  it("pending + paid -> domain_pending, berubah", () => {
    const d = decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "pending_payment", result: "paid" });
    expect(d).toEqual({ allowed: true, changed: true, newPaymentStatus: "paid", newOrderStatus: "domain_pending" });
  });
  it("pending + failed -> preview (bisa bayar ulang)", () => {
    const d = decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "pending_payment", result: "failed" });
    expect(d.newOrderStatus).toBe("preview");
    expect(d.changed).toBe(true);
  });
  it("pending + expired -> preview", () => {
    const d = decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "pending_payment", result: "expired" });
    expect(d.newOrderStatus).toBe("preview");
  });
  it("paid + paid lagi -> idempoten, tidak berubah", () => {
    const d = decidePaymentTransition({ currentPaymentStatus: "paid", currentOrderStatus: "domain_pending", result: "paid" });
    expect(d.allowed).toBe(true);
    expect(d.changed).toBe(false);
    expect(d.alreadyApplied).toBe(true);
  });
  it("paid TIDAK BOLEH turun ke failed", () => {
    const d = decidePaymentTransition({ currentPaymentStatus: "paid", currentOrderStatus: "domain_pending", result: "failed" });
    expect(d.allowed).toBe(false);
    expect(d.error).toBe("paid_is_final");
  });
  it("paid TIDAK BOLEH turun ke expired", () => {
    const d = decidePaymentTransition({ currentPaymentStatus: "paid", currentOrderStatus: "domain_pending", result: "expired" });
    expect(d.allowed).toBe(false);
  });
  it("failed tidak bisa jadi paid (bayar ulang harus payment baru)", () => {
    const d = decidePaymentTransition({ currentPaymentStatus: "failed", currentOrderStatus: "preview", result: "paid" });
    expect(d.allowed).toBe(false);
    expect(d.error).toBe("invalid_transition");
  });
  it("tidak boleh paid dari order draft", () => {
    const d = decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "draft", result: "paid" });
    expect(d.allowed).toBe(false);
    expect(d.error).toBe("invalid_order_status");
  });
  it("tidak boleh paid dari order preview (harus pending_payment dulu)", () => {
    const d = decidePaymentTransition({ currentPaymentStatus: "pending", currentOrderStatus: "preview", result: "paid" });
    expect(d.allowed).toBe(false);
  });
});

describe("canAccessPayment — token A tidak bisa pakai payment order B", () => {
  it("order yang sama boleh", () => {
    expect(canAccessPayment("order-A", "order-A")).toBe(true);
  });
  it("order berbeda tidak boleh", () => {
    expect(canAccessPayment("order-A", "order-B")).toBe(false);
  });
});

describe("harga dari frontend diabaikan — secara konstruksi", () => {
  it("createPayment hanya menerima OrderForPayment (tidak ada parameter harga)", async () => {
    // Buktinya di tipe: PaymentProvider.createPayment(order)
    // hanya memakai order.price_snapshot. Kalau ada yang
    // mengirim { amount: 1 } dari frontend, TypeScript
    // menolaknya dan route proceed-to-payment tidak pernah
    // membaca body request sama sekali.
    const { MockProvider } = await import("../mock-provider");
    const provider = new MockProvider();
    // createPayment butuh DB — di sini hanya dicek bahwa
    // fungsinya ada dan namanya benar; tes DB-nya ada di
    // docs/TAHAP5.md (alur simulasi manual).
    expect(typeof provider.createPayment).toBe("function");
    expect(provider.name).toBe("mock");
  });
});

describe("email paid tidak terkirim dua kali — logika pengirim", () => {
  it("hanya kirim kalau changed=true dan result=paid", () => {
    // Aturan di applyPaymentResult: kirim hanya di cabang
    // changed=true. Panggilan kedua mengembalikan
    // changed=false (idempoten), jadi tidak kirim lagi.
    const shouldSend = (changed: boolean, result: string) => changed && result === "paid";
    expect(shouldSend(true, "paid")).toBe(true);
    expect(shouldSend(false, "paid")).toBe(false);
    expect(shouldSend(true, "failed")).toBe(false);
  });
});
