import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { 500: "#3B82F6", 600: "#2563EB", 700: "#1D4ED8" },
      },
    },
  },
  plugins: [],
};
export default config;
