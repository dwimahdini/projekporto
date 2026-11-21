import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { getOrderByToken } from "@/lib/order";
import { createAdminClient } from "@/lib/supabase/server";
import { sendDeleteConfirmationEmail } from "@/lib/email";

// POST /api/orders/[token]/delete-request
// "Hapus data saya" — langkah 1: kirim link konfirmasi ke email.
// Menekan tombol di dashboard SAJA tidak menghapus apa pun.
// Token hapus: 32 byte acak, disimpan sebagai hash, berlaku 24 jam.
export async function POST(_req: Request, { params }: { params: { token: string } }) {
  const order = await getOrderByToken(params.token);
  if (!order) return NextResponse.json({ error: "Link tidak valid." }, { status: 401 });

  const supabase = createAdminClient();
  const raw = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("deletion_requests").insert({
    order_id: order.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });
  if (error) {
    console.error("[delete-request] insert gagal", error);
    return NextResponse.json({ error: "Gagal membuat permintaan hapus." }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = `${appUrl}/pesanan/${params.token}/hapus?code=${raw}`;
  const result = await sendDeleteConfirmationEmail({
    to: order.email,
    subdomain: order.subdomain ?? "",
    link,
  });

  return NextResponse.json({
    ok: true,
    message: "Link konfirmasi sudah dikirim ke email kamu. Cek inbox (berlaku 24 jam).",
    ...(result.sent ? {} : { devLink: result.devLink }),
  });
}
