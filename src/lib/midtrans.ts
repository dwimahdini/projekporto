// Helper Midtrans — hanya dipakai di server.
// Kunci: signature webhook dicek dengan SHA-512:
//   sha512(order_id + status_code + gross_amount + SERVER_KEY)
// Kalau tidak cocok, webhook DITOLAK. Ini yang mencegah
// orang pura-pura lunas dengan request palsu.
import crypto from "crypto";

export function verifyMidtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const raw = input.orderId + input.statusCode + input.grossAmount + serverKey;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(input.signatureKey)
  );
}
