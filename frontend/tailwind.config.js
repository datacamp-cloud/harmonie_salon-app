/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beige: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebe0d0',
          300: '#deccb3',
          400: '#cdb393',
          500: '#bc9a76',
          600: '#a8836a',
          700: '#8c6b59',
          800: '#73584c',
          900: '#5f4940',
        },
      },
    },
  },
  plugins: [],
}
