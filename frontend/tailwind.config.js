/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bid: {
          DEFAULT: '#10b981',
          bg: '#064e3b',
          light: '#34d399',
          muted: '#047857'
        },
        ask: {
          DEFAULT: '#ef4444',
          bg: '#7f1d1d',
          light: '#f87171',
          muted: '#b91c1c'
        }
      }
    },
  },
  plugins: [],
}
