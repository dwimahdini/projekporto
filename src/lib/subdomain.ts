// Aturan subdomain + status publik — fungsi MURNI
// (tanpa database) supaya bisa dites otomatis.
// Aturan yang sama juga ditegakkan di tempat lain:
//  - subdomain terlarang: Zod (validation.ts) + daftar ini.
//  - keunikan: UNIQUE di database + cek di POST /api/orders
//    + cek ulang di proceed-to-payment.
//  - hanya published yang tampil: view public_portfolio
//    (SQL, 0001) + halaman /s/[subdomain] (404 kalau tidak ada).
import { FORBIDDEN_SUBDOMAINS } from "./types";

export function isForbiddenSubdomain(subdomain: string): boolean {
  return (FORBIDDEN_SUBDOMAINS as readonly string[]).includes(subdomain.trim().toLowerCase());
}

// Middleware / halaman subdomain hanya merender order
// berstatus published. Semua status lain — termasuk
// domain_pending — mendapat 404 yang rapi.
export function canRenderPublicPortfolio(orderStatus: string): boolean {
  return orderStatus === "published";
}

// Subdomain dikunci setelah status paid: tidak ada API
// yang boleh mengubah subdomain kalau order sudah paid /
// domain_pending / published. PATCH /api/orders menolak
// field subdomain apa pun; form tidak pernah menampilkannya.
export function isSubdomainLocked(orderStatus: string): boolean {
  return ["paid", "domain_pending", "published"].includes(orderStatus);
}

// Cek keunikan saat masuk pending_payment (lapisan kedua
// setelah cek di pembuatan order + UNIQUE database).
// existing: subdomain order lain yang masih hidup
// (bukan deleted/cancelled/expired), tanpa order sendiri.
export function hasSubdomainConflict(input: {
  subdomain: string;
  selfOrderId: string;
  otherLiveOrders: { id: string; subdomain: string }[];
}): boolean {
  const wanted = input.subdomain.trim().toLowerCase();
  return input.otherLiveOrders.some(
    (o) => o.id !== input.selfOrderId && o.subdomain.toLowerCase() === wanted
  );
}
