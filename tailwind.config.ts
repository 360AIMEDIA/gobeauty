import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      colors: {
        brand: {
          50: "#fef1f4",
          100: "#fde2ea",
          200: "#fbc4d4",
          300: "#f7a1bc",
          400: "#f17a9e",
          500: "#e85a82",
          600: "#d33a68",
          700: "#b12854",
          800: "#8f2047",
          900: "#751b3c",
        },
        ink: {
          DEFAULT: "#0f1419",
          soft: "#3f4b59",
          muted: "#6b7785",
          faint: "#9aa3af",
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#faf6f7",
          tint: "#fef1f4",
        },
        line: {
          DEFAULT: "#ececec",
          soft: "#f0eded",
        },
        beauty: {
          pink: "#EB4F78",
          "pink-dark": "#D93C67",
          "pink-light": "#FFF0F4",
          blush: "#FFF8F9",
          purple: "#F4EEFF",
          green: "#F1F8F2",
          peach: "#FFF4ED",
          text: "#253247",
          muted: "#718096",
          border: "#E7E9EE",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,20,25,0.04), 0 1px 3px rgba(15,20,25,0.04)",
        cardHover:
          "0 10px 30px rgba(15,20,25,0.08), 0 2px 6px rgba(15,20,25,0.04)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
      borderRadius: {
        pill: "999px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        "marquee-reverse": "marquee-reverse 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
