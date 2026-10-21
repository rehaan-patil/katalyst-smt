/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#07090E",
        surface: {
          50: "#1A2234",
          100: "#151C2C",
          200: "#111724",
          300: "#0D121D",
          400: "#090D15",
          DEFAULT: "#0D121D",
          overlay: "rgba(13, 18, 29, 0.85)",
          card: "#121826",
          elevated: "#161E30",
        },
        borderSubtle: "rgba(255, 255, 255, 0.08)",
        borderActive: "rgba(99, 102, 241, 0.4)",
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          DEFAULT: "#6366F1",
        },
        cyberViolet: {
          DEFAULT: "#6366F1",
          dark: "#4F46E5",
          light: "#818CF8",
        },
        neonBlue: {
          DEFAULT: "#06B6D4",
          dark: "#0891B2",
          light: "#22D3EE",
        },
        vulnRed: {
          DEFAULT: "#F43F5E",
          dark: "#BE123C",
          glow: "rgba(244, 63, 94, 0.25)",
        },
        successGreen: {
          DEFAULT: "#10B981",
          dark: "#047857",
          glow: "rgba(16, 185, 129, 0.25)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "glow-brand": "0 0 25px -5px rgba(99, 102, 241, 0.4)",
        "glow-success": "0 0 25px -5px rgba(16, 185, 129, 0.4)",
        "glow-danger": "0 0 25px -5px rgba(244, 63, 94, 0.4)",
        "glass-panel": "0 8px 32px 0 rgba(0, 0, 0, 0.48)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

