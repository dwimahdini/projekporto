// Sanitasi untuk data yang dirender ke halaman publik.
// React (JSX) SUDAH meng-escape teks secara otomatis —
// tidak ada dangerouslySetInnerHTML di proyek ini — jadi
// "<script>alert(1)</script>" di bio/proyek dirender
// sebagai teks, bukan dieksekusi. Fungsi di sini menutup
// celah yang tersisa: URL tautan (href) dan magic bytes
// file upload.

// Hanya http/https yang boleh jadi tautan. javascript:,
// data:, vbscript:, dan skema lain ditolak (kembalikan null).
export function safeHttpUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!/^https?:\/\//i.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

// Validasi isi file berdasarkan magic bytes, bukan hanya
// ekstensi atau MIME dari browser (keduanya bisa dipalsukan).
// JPEG: FF D8 FF · PNG: 89 50 4E 47 · WebP: RIFF....WEBP
export function validateImageMagicBytes(bytes: Uint8Array, mime: string): string | null {
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isWebp =
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  if (mime === "image/jpeg" && isJpeg) return null;
  if (mime === "image/png" && isPng) return null;
  if (mime === "image/webp" && isWebp) return null;
  return "Isi file tidak cocok dengan tipe gambar yang dinyatakan";
}

// Otorisasi cron — fungsi murni supaya bisa dites.
// Aturan: kalau CRON_SECRET diisi, header harus sama persis.
// Kalau belum diisi, hanya diizinkan di development
// (fail-closed di production).
export function isCronAuthorized(input: { secret?: string; authorizationHeader: string; nodeEnv?: string }): boolean {
  if (input.secret) return input.authorizationHeader === `Bearer ${input.secret}`;
  return input.nodeEnv !== "production";
}
