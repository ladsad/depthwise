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
          DEFAULT: '#E7E6E3',
          surface: '#FFFFFF',
          subtle: '#F2F1EE',
          dark: '#DDDCD8',
        },
        border: {
          DEFAULT: '#CABFAC',
          strong: '#A89C87',
          light: '#DDD8CE',
        },
        content: {
          DEFAULT: '#33312E',
          secondary: '#66625C',
          muted: '#918B83',
          disabled: '#B8B2AA',
        },
        burgundy: {
          DEFAULT: '#6B0C08',
          dark: '#520805',
          light: '#F5DCDA',
          subtle: '#FAF0EF',
          border: '#D48D8B',
          text: '#6B0C08',
        },
        terracotta: {
          DEFAULT: '#AA784F',
          dark: '#82542E',
          light: '#F4E7DC',
          subtle: '#FAF4EF',
          border: '#D4A885',
          text: '#82542E',
        },
        navy: {
          DEFAULT: '#3A3F5F',
          dark: '#272B43',
          light: '#E1E3ED',
          subtle: '#EFEFF5',
          border: '#8E94B5',
          text: '#272B43',
        },
        accent: {
          primary: '#AA784F',
          secondary: '#3A3F5F',
          burgundy: '#6B0C08',
          terracotta: '#AA784F',
          navy: '#3A3F5F',
        },
        bid: {
          DEFAULT: '#AA784F',
          dark: '#82542E',
          subtle: '#FAF4EF',
          surface: '#FDFBF8',
          border: '#D4A885',
          text: '#82542E',
        },
        ask: {
          DEFAULT: '#6B0C08',
          dark: '#520805',
          subtle: '#FAF0EF',
          surface: '#FDF7F7',
          border: '#D48D8B',
          text: '#6B0C08',
        },
        warning: {
          DEFAULT: '#AA784F',
          subtle: '#FAF4EF',
          border: '#D4A885',
          text: '#82542E',
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
