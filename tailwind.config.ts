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
          light: "#F9FAFB", // cool gray 50
          dark: "#121212", // almost black
        },
        primary: "#FF6B6B", // soft coral
        secondary: "#4ECDC4", // medium turquoise
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
        sans: ["Pretendard", "sans-serif"],
        display: ["Cabinet Grotesk", "Pretendard", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
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
      },
    },
  },
  darkMode: "class",
  plugins: [forms, typography],
} satisfies Config;
