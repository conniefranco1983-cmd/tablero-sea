/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        guinda: {
          50:  '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d0d7',
          300: '#f4aab7',
          400: '#ec7a90',
          500: '#df4f6c',
          600: '#cc3054',
          700: '#ac2244',
          800: '#8e1e3a',
          900: '#7a1d36',
          950: '#691C32',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

