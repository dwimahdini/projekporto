"use client";
// Client pratinjau: watermark, blokir klik kanan/salin,
// tombol bayar yang baru muncul setelah render selesai.
//
// Jujur soal batasnya: blokir klik kanan/salin dan watermark
// CSS hanya pencegah ringan. Orang yang paham DevTools tetap
// bisa menyalin lewat inspect element atau screenshot.
// Yang benar-benar melindungi adalah: preview ini tidak
// diindeks (noindex), hanya pemilik token/admin yang bisa
// buka, dan situs asli baru aktif setelah lunas + admin.
import { useEffect, useRef, useState } from "react";
import { getTemplate, TEMPLATE_LIST } from "@/lib/templates/registry";
import type { PortfolioData } from "@/lib/types";

export default function PreviewClient({
  data,
  token,
  isAdmin,
}: {
  data: PortfolioData;
  token: string | null; // null kalau yang membuka adalah admin
  isAdmin: boolean;
}) {
  const [rendered, setRendered] = useState(false);
  const [templateId, setTemplateId] = useState(data.template_id);
  const [currentData, setCurrentData] = useState(data);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Anggap render selesai kalau: komponen template sudah
  // mount + semua gambar di dalamnya sudah load (atau
  // tidak ada gambar) + satu frame berikutnya. Ditambah
  // batas aman 3 detik supaya tombol tidak hilang selamanya
  // kalau ada gambar yang gagal load.
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        setRendered(true);
      }
    };
    const raf = requestAnimationFrame(() => {
      const imgs = Array.from(containerRef.current?.querySelectorAll("img") ?? []);
      const pending = imgs.filter((img) => !img.complete);
      if (pending.length === 0) {
        // Beri jeda singkat supaya animasi awal sempat jalan.
        setTimeout(finish, 400);
      } else {
        let remaining = pending.length;
        const onOne = () => {
          remaining -= 1;
          if (remaining <= 0) finish();
        };
        pending.forEach((img) => {
          img.addEventListener("load", onOne, { once: true });
          img.addEventListener("error", onOne, { once: true });
        });
      }
    });
    const fallback = setTimeout(finish, 3000);
    return () => {
      done = true;
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [templateId]);

  // Blokir klik kanan + salin di area pratinjau saja
  // (toolbar di atas tetap bisa dipakai normal).
  function blockContextMenu(e: React.MouseEvent) {
    e.preventDefault();
  }
  function blockCopy(e: React.ClipboardEvent) {
    e.preventDefault();
    setNotice("Menyalin konten pratinjau dinonaktifkan.");
  }

  async function changeTemplate(nextId: string) {
    if (!token) {
      setError("Ganti template hanya bisa dilakukan pemilik order (lewat link token).");
      return;
    }
    setBusy(true);
    setError("");
    setRendered(false);
    try {
      const res = await fetch(`/api/orders/${token}/change-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: nextId }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error ?? "Gagal mengganti template.");
      setTemplateId(nextId);
      setCurrentData((d) => ({ ...d, template_id: nextId }));
      setNotice("Template diganti. Data kamu tetap sama.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengganti template.");
      setRendered(true);
    } finally {
      setBusy(false);
    }
  }

  async function proceedToPayment() {
    if (!token) {
      setError("Lanjut ke pembayaran hanya bisa dilakukan pemilik order.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${token}/proceed-to-payment`, { method: "POST" });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error ?? "Gagal lanjut ke pembayaran.");
      window.location.href = out.next ?? `/pesanan/${token}/bayar`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal lanjut ke pembayaran.");
      setBusy(false);
    }
  }

  const meta = getTemplate(templateId);
  if (!meta) return <p className="p-8">Template tidak dikenal.</p>;
  const { Component } = meta;

  return (
    <div>
      {/* Toolbar pratinjau — di luar area yang diblokir salin */}
      <div className="sticky top-0 z-40 border-b bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2">
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold">PRATINJAU — BELUM AKTIF</span>
          <span className="text-sm text-gray-600">
            {currentData.subdomain}.portofolio.my.id · {meta.name}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label className="text-sm" htmlFor="template-select">Ganti template:</label>
            <select
              id="template-select"
              value={templateId}
              disabled={busy || !token}
              onChange={(e) => changeTemplate(e.target.value)}
              className="min-h-[44px] rounded-xl border px-2 py-1 text-sm"
            >
              {TEMPLATE_LIST.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {token ? (
              <a href={`/pesanan/${token}`} className="min-h-[44px] rounded-xl border px-3 py-2 text-sm font-medium">
                ← Edit data
              </a>
            ) : null}
          </div>
        </div>
        {!rendered ? (
          <p className="mx-auto mt-2 max-w-5xl text-xs text-gray-500">Merender pratinjau… tombol pembayaran muncul setelah render selesai.</p>
        ) : null}
        {error ? <p className="mx-auto mt-2 max-w-5xl text-sm text-red-600">{error}</p> : null}
        {notice ? <p className="mx-auto mt-2 max-w-5xl text-sm text-green-700">{notice}</p> : null}
      </div>

      {/* Area pratinjau: watermark + blokir klik kanan/salin */}
      <div
        ref={containerRef}
        onContextMenu={blockContextMenu}
        onCopy={blockCopy}
        onCut={blockCopy}
        className="relative select-none"
      >
        {/* Watermark diagonal berulang */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, transparent 0 180px, rgba(0,0,0,0.04) 180px 182px)",
          }}
        >
          <div className="flex h-full w-full flex-wrap items-center justify-around gap-8 opacity-[0.07]">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="-rotate-45 whitespace-nowrap text-4xl font-black tracking-widest text-gray-900">
                PRATINJAU
              </span>
            ))}
          </div>
        </div>
        <Component data={currentData} />
      </div>

      {/* Tombol bayar — HANYA setelah render selesai */}
      <div className="sticky bottom-0 z-40 border-t bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-600">
            {rendered
              ? "Pratinjau sudah selesai dirender. Kalau sudah cocok, lanjut ke pembayaran."
              : "Menunggu pratinjau selesai dirender…"}
          </p>
          {rendered ? (
            <button
              type="button"
              onClick={proceedToPayment}
              disabled={busy || !token}
              className="min-h-[52px] w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white disabled:opacity-50 sm:w-auto"
            >
              {busy ? "Memproses…" : "Lanjut ke pembayaran →"}
            </button>
          ) : (
            <button type="button" disabled className="min-h-[52px] w-full cursor-not-allowed rounded-xl bg-gray-300 px-6 py-3 font-semibold text-gray-500 sm:w-auto">
              Lanjut ke pembayaran →
            </button>
          )}
        </div>
        {!token && isAdmin ? (
          <p className="mx-auto mt-2 max-w-5xl text-xs text-gray-500">Kamu membuka sebagai admin — tombol pembayaran tidak aktif di sini. Pemilik order harus membukanya lewat link token.</p>
        ) : null}
      </div>
    </div>
  );
}
