// MidtransProvider — KERANGKA KOSONG, belum diimplementasi.
// JANGAN diisi logika apa pun di tahap ini, dan JANGAN
// menambah dependensi midtrans-client.
// File ini ada supaya pergantian provider nanti hanya
// mengganti isi file ini + env PAYMENT_PROVIDER, tanpa
// mengubah route, halaman, atau applyPaymentResult.
//
// Checklist integrasi Midtrans (untuk nanti):
//  1. Pasang dependensi midtrans-client (atau panggil REST
//     Midtrans langsung dengan fetch + Basic Auth server key).
//  2. createPayment():
//     - Buat Snap transaction dengan order_id unik
//       (pakai provider_ref yang sudah dibuat), gross_amount
//       dari order.price_snapshot, dan item_details.
//     - Simpan Snap token di payments.raw_payload.
//     - Kembalikan nextUrl berupa URL Snap / token untuk
//       dibuka sebagai popup Snap di frontend.
//  3. getStatus():
//     - Panggil Midtrans Status API:
//       GET https://api.sandbox.midtrans.com/v2/{order_id}/status
//       dengan Basic Auth server key.
//     - Petakan transaction_status Midtrans ke
//       paid/failed/expired (settlement/capture -> paid,
//       deny/cancel/failure -> failed, expire -> expired).
//  4. handleNotification():
//     - Baca body webhook, verifikasi signature_key dengan
//       SHA-512: sha512(order_id + status_code +
//       gross_amount + SERVER_KEY) — lihat src/lib/midtrans.ts.
//     - Tolak (401) kalau signature tidak cocok.
//     - Petakan status, lalu panggil applyPaymentResult()
//       (SATU jalur yang sama dengan Mock). Jangan ubah
//       status order langsung dari webhook.
//     - Idempoten: notifikasi yang sama dua kali harus
//       mengembalikan changed=false (sudah ditangani
//       applyPaymentResult + RPC database).
//  5. Ubah env PAYMENT_PROVIDER=midtrans dan HAPUS
//     ALLOW_MOCK_PAYMENT (atau set false). Mock mati total
//     di production karena isMockPaymentEnabled() menolak
//     VERCEL_ENV=production.
import type { CreatedPayment, OrderForPayment, PaymentProvider } from "./types";
import { PaymentUnavailableError } from "./types";

export class MidtransProvider implements PaymentProvider {
  readonly name = "midtrans" as const;

  async createPayment(_order: OrderForPayment): Promise<CreatedPayment> {
    // TODO (integrasi Midtrans): buat Snap transaction, lihat checklist di atas.
    throw new PaymentUnavailableError("Pembayaran belum tersedia.");
  }

  async getStatus(_paymentId: string): Promise<{ status: string }> {
    // TODO (integrasi Midtrans): panggil Midtrans Status API.
    throw new PaymentUnavailableError("Pembayaran belum tersedia.");
  }

  async handleNotification(_request: Request): Promise<{ ok: boolean; changed: boolean }> {
    // TODO (integrasi Midtrans): verifikasi signature_key lalu applyPaymentResult().
    throw new PaymentUnavailableError("Pembayaran belum tersedia.");
  }
}
