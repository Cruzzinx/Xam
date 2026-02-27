// tailwind.config.cjs

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  // Properti 'content' WAJIB ADA untuk menentukan jalur file Anda
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Pindai semua file komponen di dalam folder src
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}