/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#1a1a1a",
          elevated: "#242424",
          hover: "#2e2e2e",
        },
        health: {
          excellent: "#22c55e",
          warning: "#f59e0b",
          critical: "#ef4444",
        },
      },
      boxShadow: {
        "glow-green": "0 0 20px rgba(34, 197, 94, 0.3)",
        "glow-amber": "0 0 20px rgba(245, 158, 11, 0.3)",
        "glow-red": "0 0 20px rgba(239, 68, 68, 0.3)",
      },
      backgroundImage: {
        "gradient-ram": "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        "gradient-disk": "linear-gradient(135deg, #f59e0b, #ef4444)",
        "gradient-battery": "linear-gradient(135deg, #22c55e, #14b8a6)",
        "gradient-cpu": "linear-gradient(135deg, #ec4899, #8b5cf6)",
      },
    },
  },
  plugins: [],
};
