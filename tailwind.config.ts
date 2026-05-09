import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — bold red.
        brand: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
        // Accent kept as red shades too so any old "accent" gradient
        // resolves to a clean red, not orange.
        accent: {
          50: "#fef2f2",
          100: "#fee2e2",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },
        // Neutral / "ink" — deep slate, used for the dark header + footer.
        ink: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#080d1c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: [
          "Outfit",
          "Inter",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      letterSpacing: {
        tightish: "-0.02em",
        tighter: "-0.035em",
      },
      boxShadow: {
        soft: "0 6px 20px -10px rgba(220, 38, 38, 0.18)",
        pop: "0 16px 40px -14px rgba(220, 38, 38, 0.35)",
        accent: "0 8px 24px -10px rgba(220, 38, 38, 0.30)",
        cta: "0 12px 30px -12px rgba(220, 38, 38, 0.55)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #ef4444 0%, #dc2626 60%, #991b1b 100%)",
        "accent-gradient":
          "linear-gradient(135deg, #f87171 0%, #ef4444 60%, #dc2626 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
