// Antarmuka PaymentProvider — SATU bentuk untuk semua
// provider pembayaran. Mock sekarang, Midtrans nanti.
// Harga TIDAK PERNAH datang dari frontend: createPayment
// hanya menerima order (yang harga servernya ada di
// order.price_snapshot). Kalau ada yang mengirim harga
// dari frontend, abaikan.
import type { PaymentResult } from "./transition";

export interface OrderForPayment {
  id: string;
  template_id: string;
  email: string;
  subdomain: string | null;
  status: string;
  price_snapshot: number;
}

export interface CreatedPayment {
  paymentId: string;
  providerRef: string;
  amount: number;
  // Ke mana klien harus diarahkan setelah payment dibuat.
  nextUrl: string;
}

export interface PaymentProvider {
  readonly name: "mock" | "midtrans";
  createPayment(order: OrderForPayment): Promise<CreatedPayment>;
  getStatus(paymentId: string): Promise<{ status: string }>;
  // Dipanggil webhook / notifikasi provider. Mengembalikan
  // hasil yang sudah diterapkan lewat applyPaymentResult.
  handleNotification(request: Request): Promise<{ ok: boolean; changed: boolean }>;
}

export type { PaymentResult };

export class PaymentUnavailableError extends Error {
  status = 503;
  constructor(message = "Pembayaran belum tersedia.") {
    super(message);
  }
}
