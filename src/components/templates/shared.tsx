"use client";
// Helper bersama kelima template.
// Aturan utama: JANGAN tampilkan field yang kosong.
// Semua helper di sini mengembalikan null kalau datanya
// tidak ada, jadi template tidak perlu menulis if di mana-mana.
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

// Animasi muncul saat di-scroll — IntersectionObserver +
// class CSS (.reveal), BUKAN framer-motion.
//
// ATURAN KEAMANAN (pelajaran lama proyek ini): konten TIDAK
// BOLEH dikirim dalam keadaan tersembunyi yang hanya dibuka
// JavaScript. .reveal terlihat penuh secara default; baru
// ketika <html> punya class "js" (skrip inline di layout)
// CSS menyembunyikannya sampai .is-visible ditambahkan.
// Kalau IntersectionObserver tidak ada, langsung terlihat.
// Pengaman timeout 1,5 detik: kalau observer entah kenapa
// tidak pernah memicu, konten tetap dimunculkan. Jadi tidak
// ada jalan bagi konten untuk macet tak terlihat.
// prefers-reduced-motion sudah ditangani aturan global di
// globals.css (durasi transisi dipendekkan sampai tidak terasa).
import { useEffect, useRef, useState } from "react";

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    // Pengaman: jangan pernah biarkan konten tersembunyi
    // lebih dari 1,5 detik walau observer bermasalah.
    const t = setTimeout(() => setVisible(true), 1500);
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);
  const cls = `reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`;
  return (
    <div ref={ref} className={cls} style={delay ? { transitionDelay: `${delay * 1000}ms` } : undefined}>
      {children}
    </div>
  );
}

// Angka menghitung naik saat terlihat — dipakai statistik
// (mis. Picto, strip statistik landing). Angka AKHIR dirender
// dulu di server, jadi tanpa JS pun angkanya benar; JS hanya
// menganimasikannya dari 0 saat elemen masuk layar. Kalau
// pengguna meminta reduced-motion, angka langsung final.
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const t0 = performance.now();
      const dur = 900;
      setN(0);
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
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
