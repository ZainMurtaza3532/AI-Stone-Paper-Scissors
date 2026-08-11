/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05070a",
        cyan: {
          glow: "#5ff2ff",
          core: "#00e5ff",
          dim: "#0a2a33",
        },
        ember: "#ff7a5c",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      animation: {
        "spin-slow": "spin 12s linear infinite",
        "spin-slower": "spin 22s linear infinite reverse",
        float: "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: 0.55, filter: "blur(8px)" },
          "50%": { opacity: 1, filter: "blur(14px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
