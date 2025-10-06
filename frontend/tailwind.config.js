/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // A modern, friendly blue
          light: '#60a5fa',   // A lighter shade for hovers
          dark: '#2563eb',    // Darker blue for dark theme
        },
        secondary: {
          DEFAULT: '#14b8a6', // A calming teal
          light: '#2dd4bf',
          dark: '#0f766e',    // Darker teal for dark theme
        },
        text: {
          primary: '#1e293b',   // Dark Slate for main text
          secondary: '#64748b', // Lighter Slate for subtitles, placeholders
          'primary-dark': '#f1f5f9', // Light text for dark theme
          'secondary-dark': '#94a3b8', // Secondary text for dark theme
        },
        bg: {
          page: '#F8F9FA',    // Soft off-white for the page background
          card: '#ffffff',    // Solid white for cards
          'page-dark': '#0f172a', // Dark slate for dark theme page background
          'card-dark': '#1e293b', // Dark slate for dark theme cards
        },
        success: '#22c55e',
        error: '#ef4444',
        info: '#0ea5e9',
        'dark-charcoal': '#1e293b',
        'medium-gray': '#64748b',
        'light-gray': '#F8F9FA',
        // Dark theme specific colors
        'dark-surface': '#1e293b',
        'dark-surface-hover': '#334155',
        'dark-border': '#334155',
        'dark-input': '#0f172a',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
      },
      boxShadow: {
        'card': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      backdropBlur: {
        'xl': '16px',
      }
    },
  },
  plugins: [],
}