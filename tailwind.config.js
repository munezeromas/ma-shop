/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B4513',
          50: '#FDF8F6',
          100: '#F7E8DD',
          200: '#EDD1BC',
          300: '#E0B89A',
          400: '#C99A73',
          500: '#8B4513',
          600: '#6B3410',
          700: '#4B240B',
          800: '#2B1507',
          900: '#1A0C04',
        },
      },
    },
  },
  plugins: [],
}
