import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0F0F1E",
        surface: "#1A1A2E",
        surface2: "#22223A",
        border: "#2D1B69",
        muted: "#8D8EA6",
        text: "#F8F9FA",
        accent: {
          DEFAULT: "#8B5CF6",
          hover: "#A78BFA",
        },
        teal: {
          DEFAULT: "#06D6A0",
          hover: "#34E0B5",
        },
        amber: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(139, 92, 246, 0.35)",
      },
      typography: () => ({}),
    },
  },
  plugins: [],
};

export default config;
