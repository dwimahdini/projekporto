// Verifikasi Cloudflare Turnstile — selalu di server.
// Token dari form dikirim ke Cloudflare, bukan dipercaya
// begitu saja dari browser.
export async function verifyTurnstile(token: string, ip?: string | null): Promise<boolean> {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET_KEY!,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    }),
  });
  const data = await res.json();
  return data.success === true;
}
