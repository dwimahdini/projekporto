import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Font Genesis: DM Sans (body) + JetBrains Mono (kode) via
// next/font (diunduh saat build, tanpa link eksternal).
// General Sans (display) via Fontshare diimpor di globals.css
// karena next/font tidak mendukung Fontshare.
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-dm-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Portofolio Murah — group.portofolio.my.id",
  description: "Jasa pembuatan website portofolio murah. Isi biodata, pilih template, bayar, lalu aktif di subdomain sendiri.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">
        {children}
        <footer className="border-t border-line px-4 py-6 text-center text-sm text-muted">
          <a href="/kebijakan-privasi" className="text-brand-500 underline underline-offset-4 hover:text-brand-600">Kebijakan Privasi</a>
          {" · "}
          <a href="/syarat-layanan" className="text-brand-500 underline underline-offset-4 hover:text-brand-600">Syarat Layanan</a>
        </footer>
      </body>
    </html>
  );
}
