import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portofolio Murah — group.portofolio.my.id",
  description: "Buat website portofolio dari biodata kamu. Isi biodata, konfirmasi, pilih template, lalu bagikan — gratis, tanpa daftar dan tanpa bayar.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        {/* Font Genesis: DM Sans (body) + JetBrains Mono (kode)
            via link Google Fonts, General Sans via Fontshare
            diimpor di globals.css. Sengaja pakai link, bukan
            next/font/google — next/font gagal di build Vercel
            (loader-nya tidak bisa mengambil CSS Google Fonts di
            sana, error "Cannot read properties of null").
            Kalau font tidak termuat, fallback system-ui jalan. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Skrip kecil ini menandai <html> dengan class "js"
            SEBELUM halaman dicat. Class itu yang mengaktifkan
            penyembunyian awal .reveal di globals.css — tanpa
            class ini (JS mati) semua konten tetap terlihat
            penuh. Jangan hapus: tanpanya reveal tidak jalan,
            dan tanpanya pun konten tidak pernah tersembunyi. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js');" }} />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        {children}
        <footer className="border-t border-line px-4 py-6 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} Portofolio Murah</p>
          <p className="mt-2">
            <a href="/kebijakan-privasi" className="text-brand-500 underline underline-offset-4 hover:text-brand-600">Kebijakan Privasi</a>
            {" · "}
            <a href="/syarat-layanan" className="text-brand-500 underline underline-offset-4 hover:text-brand-600">Syarat Layanan</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
