/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: '#F7F8FA',
          surface: '#FFFFFF',
          subtle: '#F1F3F5',
          dark: '#EAECEF',
        },
        border: {
          DEFAULT: '#D9DDE3',
          strong: '#AEB5BF',
          light: '#E7E9ED',
        },
        content: {
          DEFAULT: '#171A1F',
          secondary: '#5F6670',
          muted: '#858C96',
          disabled: '#A7ADB5',
        },
        accent: {
          primary: '#6D28D9',
          secondary: '#06B6D4',
        },
        bid: {
          DEFAULT: '#16A34A',
          subtle: '#DCFCE7',
          surface: '#F0FDF4',
          border: '#86EFAC',
          text: '#15803D',
        },
        ask: {
          DEFAULT: '#DC2626',
          subtle: '#FEE2E2',
          surface: '#FEF2F2',
          border: '#FCA5A5',
          text: '#B91C1C',
        },
        warning: {
          DEFAULT: '#D97706',
          subtle: '#FEF3C7',
          border: '#FCD34D',
          text: '#B45309',
        },
      },
      borderRadius: {
        'none': '0px',
        'xs': '2px',
        'sm': '2px',
        DEFAULT: '4px',
        'md': '4px',
        'lg': '6px',
        'xl': '8px',
      },
      boxShadow: {
        'none': 'none',
      }
    },
  },
  plugins: [],
}
