/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        panel: "#0A0A0A",
        panelAlt: "#111111",
        borderSubtle: "rgba(255, 255, 255, 0.1)",
        cyberViolet: {
          DEFAULT: "#8B5CF6",
          dark: "#6D28D9",
          light: "#A78BFA",
        },
        neonBlue: {
          DEFAULT: "#3B82F6",
          dark: "#1D4ED8",
          light: "#60A5FA",
        },
        vulnRed: {
          DEFAULT: "#EF4444",
          dark: "#991B1B",
          glow: "rgba(239, 68, 68, 0.2)",
        },
        successGreen: {
          DEFAULT: "#10B981",
          dark: "#065F46",
          glow: "rgba(16, 185, 129, 0.2)",
        },
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};
