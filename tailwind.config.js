/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}", // Matches files in root like App.tsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}