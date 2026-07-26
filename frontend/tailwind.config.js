/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Custom color schemes for high visual appeal
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#7594ff',
          500: '#3b5cff',
          600: '#253fff',
          700: '#1429e6',
          800: '#1020bf',
          900: '#142199',
          950: '#0c125c',
        },
      },
    },
  },
  plugins: [],
}
