/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: '#0a5275',   // ⭐ single source of truth
        primary: '#0a5275', // alias (optional)
        accent: '#001f3f',  // deep navy (keep)
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
