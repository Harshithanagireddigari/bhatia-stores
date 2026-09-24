// Tailwind CSS configuration – modern palette and fonts
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4F46E5", // Indigo-600 – main brand color
          light: "#6366F1",
          dark: "#4338CA",
        },
        accent: {
          DEFAULT: "#F59E0B", // Amber-500 – accent/highlight
          light: "#FBBF24",
          dark: "#D97706",
        },
        neutral: {
          DEFAULT: "#374151", // Gray-700 – neutral text/background
          light: "#4B5563",
          dark: "#1F2937",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [],
} satisfies Config;
