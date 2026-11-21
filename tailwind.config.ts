import type { Config } from "tailwindcss";

// Palet Genesis (docs/GENESIS.md): indigo hanya untuk elemen
// interaktif, teks near-black, bukan hitam murni.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { 500: "#6366F1", 600: "#4F46E5" },
        ink: "#0A0A0A",
        muted: "#6B6B6B",
        faint: "#9C9C9C",
        line: "#E8E8EC",
        paper: "#FAFAFA",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        display: ['"General Sans"', "var(--font-dm-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
