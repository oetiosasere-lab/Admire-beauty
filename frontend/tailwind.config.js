/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCF9',
          100: '#FAF7F2',
          200: '#F5EFE6',
          300: '#EDE4D6',
          400: '#E2D5C3',
          500: '#D5C4AE',
        },
        champagne: {
          50: '#FCF9F3',
          100: '#F8F2E6',
          200: '#F1E3CD',
          300: '#E8D3B3',
          400: '#DFC297',
          500: '#D4AF79',
        },
        taupe: {
          100: '#F2EFEB',
          200: '#E4DDD7',
          300: '#C7BBB2',
          400: '#A8998E',
          500: '#8C7A6B',
          600: '#716154',
          700: '#584B41',
          800: '#3F352E',
          900: '#2A241F',
        },
        gold: {
          100: '#FBF5EB',
          200: '#F4E7CE',
          300: '#E7CCA0',
          400: '#D9AF71',
          500: '#C5934C',
          600: '#A97A3B',
        },
        espresso: {
          800: '#26201E',
          900: '#1A1615',
          950: '#120F0E',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(78, 64, 53, 0.08), 0 4px 6px -2px rgba(78, 64, 53, 0.04)',
        'luxury-lg': '0 20px 40px -15px rgba(78, 64, 53, 0.12), 0 8px 12px -4px rgba(78, 64, 53, 0.06)',
      }
    },
  },
  plugins: [],
}
