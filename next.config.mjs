/** @type {import('next').NextConfig} */
// Header keamanan (Tahap 7).
// CSP disesuaikan dengan yang dipakai aplikasi:
//  - Turnstile Cloudflare (script + frame challenges.cloudflare.com)
//  - Supabase (connect ke *.supabase.co)
//  - Next.js butuh 'unsafe-inline' untuk script/style inline-nya
//    (ini kelemahan yang diketahui — lihat docs/SECURITY_AUDIT.md).
//  - Gambar upload dari Supabase Storage (https:) dan data: untuk
//    avatar inisial (tidak ada gambar eksternal lain).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const commonHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  async headers() {
    // Urutan penting: Next menggabungkan header dari semua
    // source yang cocok, aturan yang ditulis BELAKANGAN yang
    // menang untuk kunci yang sama. Jadi /pesanan ditulis
    // setelah aturan umum supaya no-referrer-nya menang.
    return [
      {
        source: "/:path*",
        headers: [
          ...commonHeaders,
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/pesanan/:path*",
        headers: [
          ...commonHeaders,
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};
export default nextConfig;
