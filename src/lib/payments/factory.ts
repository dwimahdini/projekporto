// Pilihan provider dibaca dari env PAYMENT_PROVIDER.
// - "mock" -> MockProvider (hanya kalau mock guard lolos,
//   dicek lagi di MockProvider + route simulasi).
// - "midtrans" / kosong / tidak dikenal -> MidtransProvider.
//   Default sengaja "midtrans", supaya mock TIDAK aktif
//   secara default kalau env lupa diisi.
import { MockProvider } from "./mock-provider";
import { MidtransProvider } from "./midtrans-provider";
import type { PaymentProvider } from "./types";

export function getPaymentProviderName(): "mock" | "midtrans" {
  return process.env.PAYMENT_PROVIDER === "mock" ? "mock" : "midtrans";
}

export function getPaymentProvider(): PaymentProvider {
  return getPaymentProviderName() === "mock" ? new MockProvider() : new MidtransProvider();
}
