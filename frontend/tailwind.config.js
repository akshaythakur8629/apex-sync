/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#f3f4f6',
          DEFAULT: '#111827',
          dark: '#000000',
        },
        accent: {
          light: '#60a5fa',
          DEFAULT: '#2563eb',
          dark: '#1e40af',
        }
      }
    },
  },
  plugins: [],
}
