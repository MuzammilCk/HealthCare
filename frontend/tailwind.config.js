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
          DEFAULT: '#3b82f6', // A modern, friendly blue
          light: '#60a5fa',   // A lighter shade for hovers
        },
        secondary: {
          DEFAULT: '#14b8a6', // A calming teal
          light: '#2dd4bf',
        },
        text: {
          primary: '#1e293b',   // Dark Slate for main text
          secondary: '#64748b', // Lighter Slate for subtitles, placeholders
        },
        bg: {
          page: 'rgba(241, 245, 249, 0.5)', // Semi-transparent light gray for page background
          card: 'rgba(255, 255, 255, 0.6)',  // Semi-transparent white for "glass" cards
        },
        success: '#22c55e',
        error: '#ef4444',
        info: '#0ea5e9',
        'dark-charcoal': '#1e293b',   // Mapping old custom colors to the new theme
        'medium-gray': '#64748b',
        'light-gray': 'rgba(241, 245, 249, 0.7)',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem', // Softer, more modern corners
      },
      boxShadow: {
        // A softer, more modern shadow for cards
        'card': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
      },
      // Add backdrop blur for the "frosted glass" effect
      backdropBlur: {
        'xl': '16px',
      }
    },
  },
  plugins: [],
}