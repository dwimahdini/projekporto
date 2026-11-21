import { NextResponse, type NextRequest } from "next/server";

// Middleware: membaca host, lalu memutuskan aplikasi mana
// yang ditampilkan. Satu aplikasi, dua wajah:
//   group.portofolio.my.id  -> aplikasi utama (landing, form, admin)
//   {subdomain}.portofolio.my.id -> portofolio publik klien
//   localhost               -> aplikasi utama (development)
//   ?__subdomain=wirza di localhost -> tes tampilan subdomain
//
// Middleware TIDAK memutuskan published/tidak. Itu tugas
// halaman subdomain: query public_portfolio_by_subdomain,
// kalau tidak ada baris -> 404 yang rapi.
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "portofolio.my.id";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const url = req.nextUrl.clone();

  // --- Development: localhost ---
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    const testSubdomain = url.searchParams.get("__subdomain");
    if (testSubdomain) {
      url.pathname = `/s/${testSubdomain}${url.pathname === "/" ? "" : url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Buang port kalau ada, contoh: group.portofolio.my.id:3000
  const hostname = host.split(":")[0].toLowerCase();

  // Bukan domain kita (misal preview Vercel) -> biarkan lewat.
  if (!hostname.endsWith(ROOT_DOMAIN)) return NextResponse.next();

  const subdomain = hostname.slice(0, -(ROOT_DOMAIN.length + 1));

  // Aplikasi utama
  if (subdomain === "" || subdomain === "group" || subdomain === "www") {
    return NextResponse.next();
  }

  // Subdomain klien -> rewrite ke /s/[subdomain]
  url.pathname = `/s/${subdomain}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Jangan jalankan middleware untuk file statis / API internal
  // yang tidak butuh routing subdomain.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)"],
};
