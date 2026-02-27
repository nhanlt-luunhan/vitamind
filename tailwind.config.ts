import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{md,mdx}"],
  theme: {
    extend: {
      colors: {
        brand0: "rgb(from var(--c-0) r g b / <alpha-value>)",
        brand1: "rgb(from var(--c-1) r g b / <alpha-value>)",
        brand2: "rgb(from var(--c-2) r g b / <alpha-value>)",
        brand3: "rgb(from var(--c-3) r g b / <alpha-value>)",
        brand4: "rgb(from var(--c-4) r g b / <alpha-value>)",
      },
      backgroundImage: {
        brand: "var(--g-brand)",
      },
    },
  },
  plugins: [],
};

export default config;
