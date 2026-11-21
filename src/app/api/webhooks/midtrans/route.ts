import { NextResponse } from "next/server";
import { verifyMidtransSignature } from "@/lib/midtrans";
import { createAdminClient } from "@/lib/supabase/server";

// Webhook Midtrans — SATU-SATUNYA yang boleh mengubah
// status pembayaran. Frontend tidak boleh.
// Alur di Tahap 3: verifikasi signature -> simpan ke
// payments (raw_notification utuh) -> kalau settlement/
// capture, ubah order jadi 'domain_pending' (BUKAN published).
export async function POST(req: Request) {
  const body = await req.json();

  const ok = verifyMidtransSignature({
    orderId: String(body.order_id ?? ""),
    statusCode: String(body.status_code ?? ""),
    grossAmount: String(body.gross_amount ?? ""),
    signatureKey: String(body.signature_key ?? ""),
  });
  if (!ok) return NextResponse.json({ error: "signature tidak valid" }, { status: 401 });

  // TODO Tahap 3: simpan payments + update orders.status = 'domain_pending'
  void createAdminClient;
  return NextResponse.json({ ok: true });
}
