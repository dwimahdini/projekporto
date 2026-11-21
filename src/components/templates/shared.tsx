"use client";
// Helper bersama kelima template.
// Aturan utama: JANGAN tampilkan field yang kosong.
// Semua helper di sini mengembalikan null kalau datanya
// tidak ada, jadi template tidak perlu menulis if di mana-mana.
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { PortfolioData } from "@/lib/types";
import { safeHttpUrl } from "@/lib/sanitize";

export function formatDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

export function formatRange(start: string | null, end: string | null, isCurrent = false): string {
  const s = formatDate(start);
  const e = isCurrent ? "Sekarang" : formatDate(end);
  if (!s && !e) return "";
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

export function initials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// Animasi muncul saat scroll — halus, sekali saja, dan
// mati total kalau user mengaktifkan prefers-reduced-motion
// (Framer Motion menghormati pengaturan itu lewat CSS media
// query di bawah, plus animasi ini ringan: opacity + geser 16px).
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Foto profil: kalau ada photo_url pakai gambar itu,
// kalau tidak pakai inisial — tanpa aset berlisensi.
export function Avatar({ data, className }: { data: PortfolioData; className?: string }) {
  if (data.photo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={data.photo_url} alt={data.full_name ?? "Foto profil"} className={className} loading="lazy" />;
  }
  return (
    <div className={className} aria-label={data.full_name ?? "Foto profil"}>
      <span className="flex h-full w-full items-center justify-center font-bold">{initials(data.full_name)}</span>
    </div>
  );
}

// Tautan kontak — hanya yang terisi yang dirender.
export function ContactLinks({ data, className = "" }: { data: PortfolioData; className?: string }) {
  const links: { label: string; href: string }[] = [];
  // Email/telepon hanya tampil kalau datanya berupa alamat
  // yang masuk akal; URL website/sosial HARUS http/https
  // (safeHttpUrl menolak javascript:, data:, dan sejenisnya).
  if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) links.push({ label: "Email", href: `mailto:${data.email}` });
  if (data.phone && /^\+?[0-9\s-]+$/.test(data.phone)) links.push({ label: "Telepon", href: `tel:${data.phone.replace(/[\s-]/g, "")}` });
  if (data.whatsapp) links.push({ label: "WhatsApp", href: `https://wa.me/${data.whatsapp.replace(/[^0-9]/g, "")}` });
  const website = safeHttpUrl(data.website_url);
  if (website) links.push({ label: "Website", href: website });
  const linkedin = safeHttpUrl(data.linkedin_url);
  if (linkedin) links.push({ label: "LinkedIn", href: linkedin });
  const github = safeHttpUrl(data.github_url);
  if (github) links.push({ label: "GitHub", href: github });
  const instagram = safeHttpUrl(data.instagram_url);
  if (instagram) links.push({ label: "Instagram", href: instagram });
  if (links.length === 0) return null;
  return (
    <div className={className}>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="underline underline-offset-4">
          {l.label}
        </a>
      ))}
    </div>
  );
}
