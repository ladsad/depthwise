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
          primary: '#D49200',
          secondary: '#FF2E2E',
          mustard: '#D49200',
          red: '#FF2E2E',
        },
        mustard: {
          DEFAULT: '#D49200',
          dark: '#92400E',
          light: '#FEF08A',
          subtle: '#FEF9C3',
          surface: '#FEFCE8',
          border: '#FDE047',
          text: '#713F12',
        },
        brightred: {
          DEFAULT: '#FF2E2E',
          dark: '#DC2626',
          light: '#FECACA',
          subtle: '#FEE2E2',
          surface: '#FFF1F2',
          border: '#FCA5A5',
          text: '#991B1B',
        },
        bid: {
          DEFAULT: '#B45309',
          subtle: '#FEF9C3',
          surface: '#FEFCE8',
          border: '#FDE047',
          text: '#78350F',
        },
        ask: {
          DEFAULT: '#FF2E2E',
          subtle: '#FEE2E2',
          surface: '#FFF1F2',
          border: '#FCA5A5',
          text: '#991B1B',
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
