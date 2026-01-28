import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#F9FAFB",
          dark: "#121212",
        },
        primary: {
          50: "#FFF5F0",
          100: "#FFE6D9",
          200: "#FFCBB3",
          300: "#FFB08D",
          400: "#FF9567",
          500: "#FF6B35",
          600: "#E55A2B",
          700: "#CC4A22",
          800: "#993818",
          900: "#7A2D0F",
          DEFAULT: "#FF6B35",
        },
        secondary: {
          50: "#EDFAF6",
          100: "#D1F2EA",
          200: "#A3E5D5",
          300: "#75D8C0",
          400: "#47CBAB",
          500: "#22B595",
          600: "#1B9177",
          700: "#156D5A",
          800: "#0E493C",
          900: "#07251E",
          DEFAULT: "#22B595",
        },
        accent: {
          50: "#F5F0FF",
          100: "#EDE5FF",
          200: "#DBC9FF",
          300: "#C9ADFF",
          400: "#A87DFB",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
          DEFAULT: "#8B5CF6",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dim: "#F3F4F6",
          border: "#E5E7EB",
          "dark-DEFAULT": "#1E1E1E",
          "dark-dim": "#161616",
          "dark-border": "#2E2E2E",
        },
        sage: {
          50: "#F6F7F6",
          100: "#E3E8E3",
          200: "#C5D1C5",
          300: "#A3B5A3",
          400: "#859D85",
          500: "#698469",
          600: "#526B52",
        },
        dark: {
          surface: "#1E1E1E",
          border: "#2E2E2E",
        },
      },
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.08)",
        "card-hover": "0 8px 25px rgba(0, 0, 0, 0.1)",
        panel: "0 0 40px rgba(0, 0, 0, 0.08)",
        "bottom-nav": "0 -1px 3px rgba(0, 0, 0, 0.05)",
        dropdown: "0 4px 24px rgba(0, 0, 0, 0.12)",
      },
      borderRadius: {
        card: "1rem",
        button: "0.75rem",
        badge: "0.5rem",
        pill: "999px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        "slide-in-bottom": "slideInBottom 0.35s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        shimmer: "shimmer 1.5s infinite linear",
        "bounce-subtle": "bounceSubtle 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInBottom: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        bounceSubtle: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [forms, typography],
} satisfies Config;
