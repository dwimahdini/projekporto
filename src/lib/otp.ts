// OTP 6 digit untuk edit data pribadi.
// Kode asli hanya ada di email klien + di memori sesaat.
// Di database hanya hash SHA-256-nya yang disimpan.
import { hashToken } from "./validation";

export function createOtpCode(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

export async function hashOtp(code: string): Promise<string> {
  return hashToken(`otp:${code}`);
}

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 menit
export const OTP_MAX_ATTEMPTS = 5;
