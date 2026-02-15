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
    },
  },
  plugins: [],
};
