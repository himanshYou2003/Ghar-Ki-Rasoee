/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#CB202D", // Zomato Red
          hover: "#A81A25",
        },
        secondary: "#0095f6", // bright blue
        background: "#FFFFFF",
        surface: "#F8F8F8",
        text: {
          primary: "#1C1C1C",
          secondary: "#696969",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "12px",
        card: "16px",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
