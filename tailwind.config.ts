import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2D2D2D",
        sage: {
          50: "#f4f7f4",
          100: "#e9eee9",
          200: "#d3ded3",
          600: "#7A8C7A",
        },
        "background-light": "#F8F8F8",
        "background-dark": "#121212",
      },
      fontFamily: {
        display: ["Inter", "Noto Sans KR", "sans-serif"],
        sans: ["Inter", "Noto Sans KR", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "4px",
        xl: "12px",
        "2xl": "24px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};

export default config;
