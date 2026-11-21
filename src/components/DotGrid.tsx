"use client";
// Dot grid interaktif — satu-satunya elemen dekoratif yang
// diizinkan Genesis (docs/GENESIS.md: "Don't add decorative
// gradients or illustrations — the interactive dot grid is
// the only decorative element").
//
// Titik-titik indigo redup membentuk grid; titik di dekat
// kursor membesar dan menebal, lalu kembali pelan. Murni
// canvas, tanpa gambar. Kalau user mengaktifkan
// prefers-reduced-motion, grid digambar sekali secara statis
// dan tidak ada animasi.
import { useEffect, useRef } from "react";

export default function DotGrid({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    // Salin ke const bertipe pasti supaya closure di bawah
    // tidak perlu mengecek null berulang kali.
    const canvas: HTMLCanvasElement = el;
    const ctx2 = canvas.getContext("2d");
    if (!ctx2) return;
    const ctx: CanvasRenderingContext2D = ctx2;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let w = 0;
    let h = 0;
    const mouse = { x: -9999, y: -9999 };
    const GAP = 28;
    const R = 1.4;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let x = GAP / 2; x < w; x += GAP) {
        for (let y = GAP / 2; y < h; y += GAP) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.hypot(dx, dy);
          // Dalam radius 120px dari kursor: membesar sampai
          // 2.6x dan menebal; di luar itu tetap redup.
          const near = Math.max(0, 1 - dist / 120);
          const r = R + near * 2.2;
          const alpha = 0.16 + near * 0.55;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }
    }

    function onMove(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    if (reduceMotion) {
      draw();
    } else {
      const loop = () => {
        draw();
        raf = requestAnimationFrame(loop);
      };
      loop();
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
