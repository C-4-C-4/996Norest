/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0a',
          card: '#141414',
          border: '#262626'
        },
        danger: {
          DEFAULT: '#ef4444',
          hover: '#dc2626',
          light: 'rgba(239, 68, 68, 0.1)',
          glow: 'rgba(239, 68, 68, 0.3)'
        }
      },
      animation: {
        'aurora': 'aurora 20s linear infinite',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        }
      }
    },
  },
  plugins: [],
}
