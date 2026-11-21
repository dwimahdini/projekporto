import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portofolio Murah — group.portofolio.my.id",
  description: "Jasa pembuatan website portofolio murah. Isi biodata, pilih template, bayar, lalu aktif di subdomain sendiri.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
