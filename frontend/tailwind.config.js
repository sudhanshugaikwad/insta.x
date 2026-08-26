/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "DM Sans", "sans-serif"],
      },
      colors: {
        ink: "#1c1917",
        coral: "#f45d48",
        blush: "#fff7f2",
      },
    },
  },
  plugins: [],
};
