// Email transaksional (Resend).
// Kalau RESEND_API_KEY belum diisi (development), email TIDAK
// dikirim — linknya dicatat di log server supaya kamu tetap
// bisa lanjut mengetes. Jangan pernah menganggap email
// terkirim kalau kuncinya belum diisi.
import { Resend } from "resend";

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function orderLink(token: string): string {
  return `${appUrl()}/pesanan/${token}`;
}

export async function sendOrderLinkEmail(input: {
  to: string;
  token: string;
  subdomain: string;
}): Promise<{ sent: boolean; devLink?: string }> {
  const link = orderLink(input.token);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:dev] Link pesanan untuk ${input.to}: ${link}`);
    return { sent: false, devLink: link };
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Portofolio <noreply@group.portofolio.my.id>",
    to: input.to,
    subject: `Link pesanan portofolio ${input.subdomain}.portofolio.my.id`,
    html: `<p>Halo,</p><p>Ini link pesanan portofolio kamu. Simpan baik-baik, jangan dibagikan ke orang lain:</p><p><a href="${link}">${link}</a></p><p>Link ini berlaku 14 hari untuk draft yang belum dibayar. Setelah verifikasi email, kamu bisa melengkapi biodata dan melihat pratinjau.</p>`,
  });
  return { sent: true };
}

export async function sendOtpEmail(input: { to: string; code: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:dev] OTP untuk ${input.to}: ${input.code}`);
    return false;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Portofolio <noreply@group.portofolio.my.id>",
    to: input.to,
    subject: "Kode OTP edit data portofolio kamu",
    html: `<p>Kode OTP kamu: <strong>${input.code}</strong></p><p>Berlaku 10 menit, maksimal 5 kali coba. Jangan bagikan kode ini ke siapa pun.</p>`,
  });
  return true;
}

export async function sendPaidEmail(input: {
  to: string;
  subdomain: string;
  templateId: string;
  amount: number;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(
      `[email:dev] Pembayaran lunas untuk ${input.subdomain}.portofolio.my.id (Rp${input.amount.toLocaleString("id-ID")}, template ${input.templateId}) — email ke ${input.to} tidak dikirim karena RESEND_API_KEY belum diisi. Situs sedang diaktifkan, maks. 1x24 jam.`
    );
    return false;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Portofolio <noreply@group.portofolio.my.id>",
    to: input.to,
    subject: `Pembayaran lunas — portofolio ${input.subdomain}.portofolio.my.id sedang diaktifkan`,
    html: `<p>Pembayaran kamu sudah lunas.</p><ul><li>Subdomain: ${input.subdomain}.portofolio.my.id</li><li>Template: ${input.templateId}</li><li>Jumlah: Rp${input.amount.toLocaleString("id-ID")}</li></ul><p>Situs kamu sedang diaktifkan oleh admin, maks. 1x24 jam. Kami kirim email lagi saat situs sudah bisa dibuka.</p>`,
  });
  return true;
}

export async function sendDeleteConfirmationEmail(input: {
  to: string;
  subdomain: string;
  link: string;
}): Promise<{ sent: boolean; devLink?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:dev] Link hapus data untuk ${input.to} (${input.subdomain}): ${input.link}`);
    return { sent: false, devLink: input.link };
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Portofolio <noreply@group.portofolio.my.id>",
    to: input.to,
    subject: `Konfirmasi hapus data portofolio ${input.subdomain}.portofolio.my.id`,
    html: `<p>Kamu meminta menghapus semua data portofolio ${input.subdomain}.portofolio.my.id.</p><p>Kalau memang kamu yang meminta, klik link ini dalam 24 jam untuk menghapus data secara permanen:</p><p><a href="${input.link}">${input.link}</a></p><p>Kalau bukan kamu yang meminta, abaikan email ini — data kamu tetap aman.</p>`,
  });
  return { sent: true };
}

export async function sendPublishedEmail(input: { to: string; subdomain: string }): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:dev] Portofolio ${input.subdomain} aktif, email ke ${input.to} tidak dikirim (dev).`);
    return false;
  }
  const resend = new Resend(apiKey);
  const url = `https://${input.subdomain}.portofolio.my.id`;
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Portofolio <noreply@group.portofolio.my.id>",
    to: input.to,
    subject: `Portofolio kamu sudah aktif: ${url}`,
    html: `<p>Portofolio kamu sudah aktif dan bisa dibuka di <a href="${url}">${url}</a></p>`,
  });
  return true;
}
