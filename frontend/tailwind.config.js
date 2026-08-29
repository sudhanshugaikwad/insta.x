/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
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
      screens: {
        xs: "320px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      spacing: {
        safe: "env(safe-area-inset-right)",
      },
      maxWidth: {
        container: "1280px",
      },
    },
  },
  plugins: [],
};

