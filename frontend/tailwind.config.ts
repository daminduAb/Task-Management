import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F6F7F9",      // page background - cool neutral, not warm cream
        surface: "#FFFFFF",      // card background
        border: "#E3E6EB",
        ink: "#12141C",          // primary text
        muted: "#6B7280",        // secondary text
        accent: {
          DEFAULT: "#0F766E",    // deep signal-teal - primary brand action
          soft: "#CCFBF1",
          dark: "#0B5A54",
        },
        priority: {
          high: "#DC4C3F",
          medium: "#D97706",
          low: "#16A34A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(18,20,28,0.04), 0 1px 3px rgba(18,20,28,0.06)",
        elevated: "0 4px 16px rgba(18,20,28,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
