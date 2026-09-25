import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tingle: {
          orange: "#FF7A00",
          cream: "#FFF9F0",
          paper: "#FFFCF7",
          charcoal: "#272522",
          muted: "#746E65",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "Avenir Next Rounded", "Arial Rounded MT Bold", "sans-serif"],
        serif: ["var(--font-nunito)", "Avenir Next Rounded", "Arial Rounded MT Bold", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(66, 49, 26, 0.09)",
        lift: "0 24px 80px rgba(66, 49, 26, 0.14)",
      },
    },
  },
  plugins: [],
} satisfies Config;
