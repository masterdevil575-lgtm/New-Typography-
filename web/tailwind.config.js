/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: '#0A120F',
          card: '#0F1A16',
          cardHover: '#14241E',
          cardActive: '#182C25',
          elevated: '#13221C',
        },
        primary: {
          DEFAULT: '#1FD67A',
          hover: '#19BD6B',
          dark: '#16A34A',
          glow: 'rgba(31, 214, 122, 0.35)',
        },
        accent: {
          emerald: '#1FD67A',
          mint: '#6EE7B7',
          forest: '#064E3B',
          neon: '#00F59B',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.07)',
          glow: 'rgba(31, 214, 122, 0.25)',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(31, 214, 122, 0.2)',
        'glow-md': '0 0 25px rgba(31, 214, 122, 0.3)',
        'glow-lg': '0 0 40px rgba(31, 214, 122, 0.45)',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
