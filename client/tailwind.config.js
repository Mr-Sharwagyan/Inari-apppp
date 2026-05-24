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
          50: '#f2f8f5',
          100: '#e1efe7',
          200: '#c5dfd1',
          300: '#99c6b0',
          400: '#6aa68b',
          500: '#47896d',
          600: '#346d54',
          700: '#2a5844',
          800: '#234737',
          900: '#1e3c2f',
          950: '#11221b',
        },
        sage: {
          50: '#f5f7f5',
          100: '#e6eae5',
          200: '#d0d8ce',
          300: '#afbeac',
          400: '#899f86',
          500: '#6a8167',
          600: '#526650',
          700: '#425141',
          800: '#374236',
          900: '#2f382e',
          950: '#181e18',
        },
        beige: {
          50: '#faf9f5',
          100: '#f4f1e8',
          200: '#e6e0ce',
          300: '#d3c7a9',
          400: '#bea981',
          500: '#aa8c5e',
          600: '#98774e',
          700: '#7f5e3f',
          800: '#684d37',
          900: '#564030',
          950: '#2e2018',
        },
        earth: {
          50: '#faf7f2',
          100: '#f5eee2',
          200: '#ebd9c1',
          300: '#ddbc97',
          400: '#cc976c',
          500: '#bf7c4a',
          600: '#b1663c',
          700: '#934e30',
          800: '#773f2b',
          900: '#603525',
          950: '#331a12',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.04)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'soft': '0 4px 20px -2px rgba(17, 34, 27, 0.04), 0 2px 10px -1px rgba(17, 34, 27, 0.02)',
        'soft-lg': '0 10px 30px -5px rgba(17, 34, 27, 0.06), 0 4px 15px -2px rgba(17, 34, 27, 0.03)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
