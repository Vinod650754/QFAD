/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        mint: "#14b8a6",
        coral: "#f9735b",
        sun: "#f6c445"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 38, 0.12)"
      }
    }
  },
  plugins: []
};
