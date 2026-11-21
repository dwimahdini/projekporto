// Rate limiting sederhana, in-memory.
// Cukup untuk awal. Kalau traffic naik, ganti dengan
// Upstash Redis / database — antarmukanya tetap sama:
// panggil checkRateLimit() di awal route, kalau tidak
// diizinkan kembalikan 429.
//
// Catatan: di serverless, memori tidak dibagikan antar
// instance. Jadi ini membatasi per instance, bukan global.
// Itu masih jauh lebih baik daripada tanpa batas sama sekali.
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = hits.get(input.key);
  if (!entry || entry.resetAt <= now) {
    hits.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (entry.count >= input.limit) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

// Batas yang dipakai di Tahap 2:
// - Buat order: 5x per jam per IP
// - Kirim ulang link / OTP: 3x per jam per email, 10x per jam per IP
// - Upload: 20x per jam per token
export const RATE_LIMITS = {
  createOrder: { limit: 5, windowMs: 60 * 60 * 1000 },
  otpPerEmail: { limit: 3, windowMs: 60 * 60 * 1000 },
  otpPerIp: { limit: 10, windowMs: 60 * 60 * 1000 },
  lookupPerIp: { limit: 10, windowMs: 60 * 60 * 1000 },
  uploadPerToken: { limit: 20, windowMs: 60 * 60 * 1000 },
} as const;
