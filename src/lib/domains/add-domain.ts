// Penambahan domain MASIH MANUAL (Vercel + Cloudflare).
// Fungsi ini sengaja hanya mencatat log, supaya Tahap 4
// nanti tinggal mengganti isi fungsi ini dengan panggilan
// API Vercel + Cloudflare — tanpa mengubah pemanggilnya.
//
// Nanti (bukan sekarang):
//  1. Vercel: POST /v9/projects/{project}/domains
//  2. Cloudflare: POST /zones/{zone}/dns_records (CNAME -> cname.vercel-dns.com, proxied=false)
export async function addDomain(subdomain: string): Promise<void> {
  const domain = `${subdomain}.portofolio.my.id`;
  // TODO (Tahap 4): ganti console.info ini dengan API Vercel + Cloudflare.
  console.info(
    `[addDomain] MANUAL: tambahkan ${domain} di Vercel (Project > Domains) ` +
      `dan CNAME di Cloudflare ke cname.vercel-dns.com (DNS only).`
  );
}
