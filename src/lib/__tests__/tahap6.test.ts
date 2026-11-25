// Tes Tahap 6 — middleware subdomain, validasi, aktivasi,
// dan privasi data publik. Fungsi murni + render template
// (tanpa database). Sumber kebenaran untuk situs publik
// tetap view SQL public_portfolio (hanya published).
import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import { subdomainSchema } from "../validation";
import { isForbiddenSubdomain, canRenderPublicPortfolio, isSubdomainLocked, hasSubdomainConflict } from "../subdomain";
import { applyVisibilityToPortfolio } from "../public-portfolio";
import { decideActivation } from "../../app/admin/AdminClient";
import { canAccessPayment } from "../payments/transition";
import { getTemplate } from "../templates/registry";
import { demoPortfolio as demoPortfolioData } from "../templates/demo-data";

describe("subdomain terlarang ditolak", () => {
  it.each(["group", "www", "admin", "api", "mail", "app", "dashboard", "preview", "pesanan", "login", "auth", "support", "help", "blog", "shop", "payment", "pay", "midtrans", "webhook"])(
    "'%s' terlarang",
    (name) => {
      expect(isForbiddenSubdomain(name)).toBe(true);
      expect(subdomainSchema.safeParse(name).success).toBe(false);
    }
  );
  it("subdomain valid diterima", () => {
    expect(isForbiddenSubdomain("wirza")).toBe(false);
    expect(subdomainSchema.safeParse("wirza").success).toBe(true);
    expect(subdomainSchema.safeParse("dwi-mahdini123").success).toBe(true);
  });
  it("format ditolak: terlalu pendek, strip di ujung, huruf besar/karakter lain", () => {
    expect(subdomainSchema.safeParse("ab").success).toBe(false);
    expect(subdomainSchema.safeParse("-wirza").success).toBe(false);
    expect(subdomainSchema.safeParse("wirza-").success).toBe(false);
    expect(subdomainSchema.safeParse("wirza_mahdini").success).toBe(false);
  });
  it("keunikan saat pending_payment: order lain dengan subdomain sama = konflik", () => {
    expect(
      hasSubdomainConflict({
        subdomain: "wirza",
        selfOrderId: "order-A",
        otherLiveOrders: [{ id: "order-B", subdomain: "wirza" }],
      })
    ).toBe(true);
    expect(
      hasSubdomainConflict({
        subdomain: "wirza",
        selfOrderId: "order-A",
        otherLiveOrders: [{ id: "order-A", subdomain: "wirza" }],
      })
    ).toBe(false);
    expect(
      hasSubdomainConflict({
        subdomain: "wirza",
        selfOrderId: "order-A",
        otherLiveOrders: [{ id: "order-B", subdomain: "lain" }],
      })
    ).toBe(false);
  });
  it("subdomain dikunci setelah paid", () => {
    expect(isSubdomainLocked("draft")).toBe(false);
    expect(isSubdomainLocked("preview")).toBe(false);
    expect(isSubdomainLocked("paid")).toBe(true);
    expect(isSubdomainLocked("domain_pending")).toBe(true);
    expect(isSubdomainLocked("published")).toBe(true);
  });
});

describe("middleware subdomain: hanya published yang tampil", () => {
  it("published tampil", () => {
    expect(canRenderPublicPortfolio("published")).toBe(true);
  });
  it.each(["draft", "preview", "pending_payment", "paid", "domain_pending", "expired", "cancelled", "deleted"])(
    "'%s' mendapat 404",
    (status) => {
      expect(canRenderPublicPortfolio(status)).toBe(false);
    }
  );
});

describe("subdomain published tampil tanpa watermark", () => {
  it("render template publik tidak mengandung PRATINJAU", () => {
    const meta = getTemplate("minimalis");
    expect(meta).toBeDefined();
    const html = renderToString(createElement(meta!.Component, { data: demoPortfolioData }));
    expect(html).toContain("John Alex");
    expect(html).not.toContain("PRATINJAU");
  });
});

describe("data privat yang tidak dicentang tidak muncul di HTML publik", () => {
  it("email/telepon tersembunyi tidak ada di HTML", () => {
    const data = {
      ...demoPortfolioData,
      email: "rahasia@contoh.id",
      phone: "0812000111222",
      whatsapp: "0812000111222",
    };
    const filtered = applyVisibilityToPortfolio(data, { email: false, phone: false, whatsapp: false });
    const meta = getTemplate("minimalis");
    const html = renderToString(createElement(meta!.Component, { data: filtered }));
    expect(html).not.toContain("rahasia@contoh.id");
    expect(html).not.toContain("0812000111222");
    expect(html).toContain("John Alex");
  });
  it("email/telepon yang dicentang BOLEH muncul", () => {
    const data = {
      ...demoPortfolioData,
      email: "tampil@contoh.id",
      phone: "0812000111222",
    };
    const filtered = applyVisibilityToPortfolio(data, { email: true, phone: true });
    const meta = getTemplate("minimalis");
    const html = renderToString(createElement(meta!.Component, { data: filtered }));
    expect(html).toContain("tampil@contoh.id");
  });
});

describe("'Tandai domain aktif' ditolak untuk non-admin dan idempoten", () => {
  it("non-admin ditolak, apa pun statusnya", () => {
    expect(decideActivation({ isAdmin: false, orderStatus: "domain_pending" }).allowed).toBe(false);
    expect(decideActivation({ isAdmin: false, orderStatus: "domain_pending" }).error).toBe("forbidden_non_admin");
  });
  it("admin + domain_pending boleh", () => {
    expect(decideActivation({ isAdmin: true, orderStatus: "domain_pending" })).toEqual({ allowed: true });
  });
  it("admin + status lain ditolak", () => {
    expect(decideActivation({ isAdmin: true, orderStatus: "draft" }).allowed).toBe(false);
    expect(decideActivation({ isAdmin: true, orderStatus: "paid" }).allowed).toBe(false);
  });
  it("admin + sudah published = idempoten (sudah aktif, tanpa aksi lagi)", () => {
    const d = decideActivation({ isAdmin: true, orderStatus: "published" });
    expect(d.allowed).toBe(true);
    expect(d.already).toBe(true);
  });
});

describe("token pesanan A tidak bisa membuka/mengubah pesanan B", () => {
  it("payment order B tidak bisa diakses dari order A", () => {
    expect(canAccessPayment("order-A", "order-B")).toBe(false);
    expect(canAccessPayment("order-A", "order-A")).toBe(true);
  });
});
