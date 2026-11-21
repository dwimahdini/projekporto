import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portofolio Murah — group.portofolio.my.id",
  description: "Jasa pembuatan website portofolio murah. Isi biodata, pilih template, bayar, lalu aktif di subdomain sendiri.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
        <footer className="border-t px-4 py-6 text-center text-sm text-gray-500">
          <a href="/kebijakan-privasi" className="underline">Kebijakan Privasi</a>
          {" · "}
          <a href="/syarat-layanan" className="underline">Syarat Layanan</a>
        </footer>
      </body>
    </html>
  );
}
