"use client";
import { useEffect, useRef } from "react";

// Widget Cloudflare Turnstile.
// Kalau NEXT_PUBLIC_TURNSTILE_SITE_KEY belum diisi (dev),
// widget tidak dirender dan onToken dipanggil dengan "dev"
// supaya form tetap bisa dites. Di production, site key
// WAJIB diisi — kalau tidak, route server akan menolak
// kalau secret-nya sudah diisi.
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string; callback: (t: string) => void }) => void;
      reset?: () => void;
    };
  }
}

export default function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) {
      onToken("dev");
      return;
    }
    const scriptId = "turnstile-script";
    const renderWidget = () => {
      if (ref.current && window.turnstile) {
        window.turnstile.render(ref.current, {
          sitekey: siteKey,
          callback: (t: string) => onToken(t),
        });
      }
    };
    if (document.getElementById(scriptId)) {
      renderWidget();
      return;
    }
    const s = document.createElement("script");
    s.id = scriptId;
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    s.async = true;
    s.onload = renderWidget;
    document.body.appendChild(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) {
    return <p className="text-xs text-muted">Verifikasi keamanan dilewati di mode development (site key belum diisi).</p>;
  }
  return <div ref={ref} />;
}
