// Logika transisi pembayaran — fungsi MURNI (tanpa DB)
// supaya bisa dites otomatis. Fungsi SQL
// apply_payment_result() di migrasi 0004 MENIRU logika
// yang sama di database (atomik). Kalau mengubah salah
// satu, ubah juga yang lain.

export type PaymentResult = "paid" | "failed" | "expired";
export type InternalPaymentStatus = "pending" | "paid" | "failed" | "expired";

export interface TransitionDecision {
  allowed: boolean;
  changed: boolean;
  alreadyApplied?: boolean;
  error?: string;
  newPaymentStatus?: InternalPaymentStatus;
  newOrderStatus?: "domain_pending" | "preview";
}

// Aturan:
// - Hasil yang sama dengan status saat ini -> idempoten,
//   tidak ada perubahan.
// - Paid bersifat final: tidak boleh turun ke failed/expired.
// - Hanya dari pending yang boleh berubah.
// - Order harus pending_payment saat hasil diterapkan.
export function decidePaymentTransition(input: {
  currentPaymentStatus: InternalPaymentStatus;
  currentOrderStatus: string;
  result: PaymentResult;
}): TransitionDecision {
  const { currentPaymentStatus, currentOrderStatus, result } = input;

  if (currentPaymentStatus === result) {
    return { allowed: true, changed: false, alreadyApplied: true };
  }
  if (currentPaymentStatus === "paid") {
    return { allowed: false, changed: false, error: "paid_is_final" };
  }
  if (currentPaymentStatus !== "pending") {
    return { allowed: false, changed: false, error: "invalid_transition" };
  }
  if (currentOrderStatus !== "pending_payment") {
    return { allowed: false, changed: false, error: "invalid_order_status" };
  }
  return {
    allowed: true,
    changed: true,
    newPaymentStatus: result,
    newOrderStatus: result === "paid" ? "domain_pending" : "preview",
  };
}

// Token A tidak boleh membuat/melihat pembayaran order B.
// Satu baris ini dipakai di semua route pembayaran.
export function canAccessPayment(orderId: string, paymentOrderId: string): boolean {
  return orderId === paymentOrderId;
}
