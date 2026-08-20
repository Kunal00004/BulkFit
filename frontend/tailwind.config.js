/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "#0F172A", // slate-900, premium dark background
          card: "#1E293B",    // slate-800, card surfaces
        },
        accent: {
          emerald: "#10B981", // surplus / positive progress
          crimson: "#EF4444", // alerts / deficits
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(16, 185, 129, 0.35)",
        glowRed: "0 0 40px -10px rgba(239, 68, 68, 0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "progress-fill": {
          "0%": { width: "0%" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
