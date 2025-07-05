/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        circles: {
          purple: '#7B3FF2',
          green: '#10B981',
          gray: '#94A3B8',
          light: '#F8F4FF'
        }
      }
    },
  },
  plugins: [],
}