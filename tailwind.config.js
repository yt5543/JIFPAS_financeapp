/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f4',
          100: '#d5ede4',
          500: '#1f8a70',
          600: '#18705b',
          700: '#135948',
        },
      },
    },
  },
  plugins: [],
}
