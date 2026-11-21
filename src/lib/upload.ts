// Upload lewat server ke Supabase Storage.
// File TIDAK PERNAH di-upload langsung dari browser dengan
// service_role key. Browser kirim FormData ke /api/upload,
// server yang memvalidasi lalu meng-upload.
// Batas: 2 MB, hanya jpg/png/webp. Nama file acak supaya
// tidak bisa ditebak dan tidak menimpa file orang lain.
export const UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
export const UPLOAD_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function validateUploadFile(file: File): string | null {
  if (!UPLOAD_ALLOWED_TYPES.includes(file.type as (typeof UPLOAD_ALLOWED_TYPES)[number])) {
    return "Tipe file harus JPG, PNG, atau WebP";
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return "Ukuran file maksimal 2 MB";
  }
  return null;
}

export function randomUploadPath(orderId: string, fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
  return `${orderId}/${rand}.${safeExt}`;
}
