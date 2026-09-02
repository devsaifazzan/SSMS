/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ssms-primary': '#A7E04E',
        'ssms-secondary': '#FF8927',
        'ssms-sidebar': '#0F172A',
        'ssms-bg': '#F8FAFC',
      }
    },
  },
  plugins: [],
}
