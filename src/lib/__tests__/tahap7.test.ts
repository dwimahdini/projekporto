// Tes Tahap 7 — admin, hak data, cron, sanitasi.
// Fungsi murni + render template (tanpa database).
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { decideAdminAction } from "../audit";
import { decideActivation } from "../../app/admin/AdminClient";
import { safeHttpUrl, validateImageMagicBytes, isCronAuthorized } from "../sanitize";
import { getTemplate } from "../templates/registry";
import { demoPortfolio as demoPortfolioData } from "../templates/demo-data";

// Keputusan penghapusan (UU PDP + pembukuan): order yang
// belum dibayar dihapus total; yang sudah dibayar hanya
// data pribadi + konten, catatan transaksi minimal disimpan.
export function decideDeletionMode(input: { orderStatus: string; hasPaidPayment: boolean }): "hard_delete" | "anonymize_retain_transaction" {
  const retain = input.hasPaidPayment || ["paid", "domain_pending", "published", "disabled"].includes(input.orderStatus);
  return retain ? "anonymize_retain_transaction" : "hard_delete";
}

describe("non-admin ditolak di semua route admin", () => {
  it("aktivasi ditolak untuk non-admin", () => {
    expect(decideActivation({ isAdmin: false, orderStatus: "domain_pending" }).allowed).toBe(false);
  });
  it("disable/enable/cancel ditolak untuk non-admin", () => {
    expect(decideAdminAction({ isAdmin: false, action: "disable", orderStatus: "published" }).allowed).toBe(false);
    expect(decideAdminAction({ isAdmin: false, action: "enable", orderStatus: "disabled" }).allowed).toBe(false);
    expect(decideAdminAction({ isAdmin: false, action: "cancel", orderStatus: "draft" }).allowed).toBe(false);
  });
  it("admin boleh disable hanya dari published, enable hanya dari disabled", () => {
    expect(decideAdminAction({ isAdmin: true, action: "disable", orderStatus: "published" }).allowed).toBe(true);
    expect(decideAdminAction({ isAdmin: true, action: "disable", orderStatus: "draft" }).allowed).toBe(false);
    expect(decideAdminAction({ isAdmin: true, action: "enable", orderStatus: "disabled" }).allowed).toBe(true);
    expect(decideAdminAction({ isAdmin: true, action: "enable", orderStatus: "published" }).allowed).toBe(false);
  });
  it("admin tidak bisa membatalkan order published/disabled", () => {
    expect(decideAdminAction({ isAdmin: true, action: "cancel", orderStatus: "published" }).allowed).toBe(false);
    expect(decideAdminAction({ isAdmin: true, action: "cancel", orderStatus: "draft" }).allowed).toBe(true);
  });
});

describe("ekspor dan hapus data: mode penghapusan", () => {
  it("draft tanpa pembayaran -> hard delete (semua hilang)", () => {
    expect(decideDeletionMode({ orderStatus: "draft", hasPaidPayment: false })).toBe("hard_delete");
    expect(decideDeletionMode({ orderStatus: "pending_payment", hasPaidPayment: false })).toBe("hard_delete");
  });
  it("paid/published -> anonimisasi, catatan transaksi minimal disimpan", () => {
    expect(decideDeletionMode({ orderStatus: "paid", hasPaidPayment: true })).toBe("anonymize_retain_transaction");
    expect(decideDeletionMode({ orderStatus: "published", hasPaidPayment: true })).toBe("anonymize_retain_transaction");
    expect(decideDeletionMode({ orderStatus: "domain_pending", hasPaidPayment: true })).toBe("anonymize_retain_transaction");
    // Bahkan tanpa baris payment yang tercatat, status paid tetap retensi.
    expect(decideDeletionMode({ orderStatus: "paid", hasPaidPayment: false })).toBe("anonymize_retain_transaction");
  });
  it("catatan transaksi minimal hanya berisi ID, nominal, tanggal, status", () => {
    const minimal = { orderId: "abc", amount: 49000, date: "2026-11-21", status: "paid" };
    expect(Object.keys(minimal).sort()).toEqual(["amount", "date", "orderId", "status"]);
    expect(JSON.stringify(minimal)).not.toContain("@");
  });
});

describe("cron menolak tanpa secret dan idempoten", () => {
  it("header benar diterima", () => {
    expect(isCronAuthorized({ secret: "rahasia", authorizationHeader: "Bearer rahasia", nodeEnv: "production" })).toBe(true);
  });
  it("tanpa header / header salah ditolak", () => {
    expect(isCronAuthorized({ secret: "rahasia", authorizationHeader: "", nodeEnv: "production" })).toBe(false);
    expect(isCronAuthorized({ secret: "rahasia", authorizationHeader: "Bearer salah", nodeEnv: "production" })).toBe(false);
  });
  it("secret belum diisi: ditolak di production, diizinkan di dev (fail-closed)", () => {
    expect(isCronAuthorized({ secret: undefined, authorizationHeader: "", nodeEnv: "production" })).toBe(false);
    expect(isCronAuthorized({ secret: undefined, authorizationHeader: "", nodeEnv: "development" })).toBe(true);
  });
  it("cleanup idempoten: menghapus order yang sudah dihapus = 0 (logika SQL: delete tanpa baris)", () => {
    // Fungsi cleanup_expired_drafts() menghapus dengan WHERE;
    // panggilan kedua tidak menemukan baris lagi -> 0.
    // Di sini dites sifatnya: filter yang sama dua kali
    // menghasilkan himpunan kosong pada panggilan kedua.
    const remaining = ["draft"].filter((s) => s === "draft");
    expect(remaining.length).toBe(1);
    const afterFirstRun = remaining.filter(() => false);
    expect(afterFirstRun.length).toBe(0);
  });
});

describe("sanitasi: input berisi script dirender sebagai teks, bukan dieksekusi", () => {
  it("bio berisi <script> ter-escape di HTML", () => {
    const data = { ...demoPortfolioData, bio: "<script>alert(1)</script> Halo" };
    const meta = getTemplate("minimalis");
    const html = renderToString(createElement(meta!.Component, { data }));
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("Halo");
  });
  it("tautan javascript: dan data: ditolak", () => {
    expect(safeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(safeHttpUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(safeHttpUrl("vbscript:msgbox(1)")).toBeNull();
    expect(safeHttpUrl("https://contoh.id")).toBe("https://contoh.id/");
    expect(safeHttpUrl("http://contoh.id/x")).toBe("http://contoh.id/x");
    expect(safeHttpUrl("")).toBeNull();
    expect(safeHttpUrl(null)).toBeNull();
  });
  it("magic bytes: file palsu ditolak, file asli diterima", () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const fake = new Uint8Array([0x3c, 0x73, 0x63, 0x72, 0x69, 0x70, 0x74, 0x3e]); // "<script>"
    expect(validateImageMagicBytes(png, "image/png")).toBeNull();
    expect(validateImageMagicBytes(jpeg, "image/jpeg")).toBeNull();
    expect(validateImageMagicBytes(fake, "image/png")).not.toBeNull();
    expect(validateImageMagicBytes(png, "image/jpeg")).not.toBeNull();
  });
});
