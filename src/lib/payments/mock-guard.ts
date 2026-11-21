// PENJAGA MODE MOCK — SATU fungsi bersama, dipakai semua
// route dan halaman simulasi. Pengecekan di SERVER saja,
// jangan pernah di frontend.
//
// Mock HANYA aktif kalau SEMUA syarat terpenuhi:
//   1. PAYMENT_PROVIDER === "mock"
//   2. ALLOW_MOCK_PAYMENT === "true"
//   3. VERCEL_ENV !== "production"
// Artinya: hanya di lokal dan deployment preview Vercel.
// Di production, mock mati total — halaman dan route
// simulasi mengembalikan 404.
//
// Fungsi ini menerima env sebagai parameter supaya bisa
// dites tanpa mengubah process.env asli.
export interface MockEnv {
  PAYMENT_PROVIDER?: string;
  ALLOW_MOCK_PAYMENT?: string;
  VERCEL_ENV?: string;
}

export function isMockPaymentEnabled(
  env: MockEnv = {
    PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER,
    ALLOW_MOCK_PAYMENT: process.env.ALLOW_MOCK_PAYMENT,
    VERCEL_ENV: process.env.VERCEL_ENV,
  }
): boolean {
  return (
    env.PAYMENT_PROVIDER === "mock" &&
    env.ALLOW_MOCK_PAYMENT === "true" &&
    env.VERCEL_ENV !== "production"
  );
}

// Dipakai route simulasi: kalau mock tidak aktif, lempar
// error 404. Route menangkapnya dan mengembalikan 404.
export class MockNotAvailableError extends Error {
  status = 404;
  constructor() {
    super("Halaman simulasi tidak tersedia.");
  }
}

export function assertMockPaymentEnabled(env?: MockEnv): void {
  if (!isMockPaymentEnabled(env)) throw new MockNotAvailableError();
}
