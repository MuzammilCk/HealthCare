/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0891B2',
        secondary: '#22C55E',
        accent: '#FB923C',
        background: '#FFFFFF',
        'light-gray': '#F9FAFB',
        'dark-charcoal': '#1F2937',
        'medium-gray': '#6B7280',
        error: '#EF4444',
        info: '#0EA5E9',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
        'h1': '32px',
        'h2': '24px',
        'h3': '20px',
        'body': '16px',
        'small': '14px',
      },
      lineHeight: {
        'body': '1.6',
      },
      borderRadius: {
        'xl': '12px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}