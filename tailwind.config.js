/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#CC1A16',
          dark: '#E5332D',
        },
        page: {
          light: '#F6F5F4',
          dark: '#141211',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1E1B1A',
        },
        fill: {
          light: '#F2F0EE',
          dark: '#2A2625',
        },
        line: {
          light: '#E8E5E2',
          dark: '#2F2B29',
        },
        ink: {
          light: '#1B1918',
          dark: '#F3EFEC',
        },
        muted: {
          light: '#5F5A56',
          dark: '#B0AAA4',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        'phone-card': '34px',
        'card': '18px',
        'button': '18px',
        'field': '14px',
        'chip': '14px',
        'nav-pill': '30px',
      },
      boxShadow: {
        floating: '0 8px 28px rgba(27,25,24,.10)',
      },
    },
  },
  plugins: [],
}
