/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D47A1', // Deep, trustworthy blue from BG
          light: '#1976D2',
        },
        secondary: '#4DD0E1', // Vibrant teal accent from BG
        text: {
          primary: '#263238',   // Dark Slate
          secondary: '#546E7A', // Lighter Slate
        },
        bg: {
          page: '#ECEFF1',    // Light gray page background
          card: '#FFFFFF',    // White for cards
        },
        success: '#4CAF50',
        error: '#F44336',
        info: '#29B6F6',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
}