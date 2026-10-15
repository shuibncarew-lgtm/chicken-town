/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0B0B0B',
        brand: {
          DEFAULT: '#D91E26',
          dark: '#B81820',
        },
        cream: '#FBF7EC',
        yellow: '#FFC72C',
        surface: '#F1EAD7',
        secondary: '#4A4A4A',
        muted: '#0B0B0B',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '22px',
        pill: '999px',
        icon: '14px',
      },
    },
  },
  plugins: [],
}
