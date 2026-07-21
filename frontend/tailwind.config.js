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
        // --- Existing HealthSync brand tokens (kept intact for app compatibility) ---
        primary: {
          DEFAULT: '#0ea5e9', // sky-500 — premium clinical blue
          light: '#38bdf8',   // sky-400
          dark: '#0284c7',     // sky-600
        },
        secondary: {
          DEFAULT: '#14b8a6', // teal-500 — calming medical teal
          light: '#2dd4bf',
          dark: '#0f766e',
        },
        text: {
          primary: '#0f172a',
          secondary: '#475569',
          'primary-dark': '#f1f5f9',
          'secondary-dark': '#94a3b8',
        },
        bg: {
          page: '#eef2f9',
          card: '#ffffff',
          'page-dark': '#070b16',
          'card-dark': '#0e1626',
        },
        success: '#22c55e',
        error: '#ef4444',
        info: '#0ea5e9',
        'dark-charcoal': '#1e293b',
        'medium-gray': '#64748b',
        'light-gray': '#eef2f9',
        'dark-surface': '#0e1626',
        'dark-surface-hover': '#16213a',
        'dark-border': '#1e2d4a',
        'dark-input': '#0b1220',

        // --- New premium 3-tier tokens (semantic layer driven by CSS vars) ---
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
          foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        input: 'rgb(var(--input) / <alpha-value>)',
        ring: 'rgb(var(--ring) / <alpha-value>)',

        // --- Brand / aura palette (the "Aurora Health" accent system) ---
        brand: {
          cyan: '#22d3ee',
          teal: '#2dd4bf',
          sky: '#38bdf8',
          indigo: '#6366f1',
          violet: '#8b5cf6',
          ink: '#070b16',
          glow: '#5eead4',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Manrope', 'system-ui', 'sans-serif'],
        head: ['Sora', 'Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        card: '0 8px 32px 0 rgba(14, 165, 233, 0.10)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        glow: '0 0 40px -8px rgba(34, 211, 238, 0.45)',
        'glow-lg': '0 0 80px -10px rgba(45, 212, 191, 0.55)',
        aurora: '0 20px 70px -20px rgba(99, 102, 241, 0.45)',
      },
      backdropBlur: {
        xl: '16px',
        '2xl': '28px',
      },
      keyframes: {
        aurora: {
          to: { backgroundPosition: '200% center' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        'grid-flow': {
          to: { backgroundPosition: '40px 40px' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        aurora: 'aurora 8s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        float: 'float 7s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 5s ease-in-out infinite',
        'grid-flow': 'grid-flow 3s linear infinite',
        shimmer: 'shimmer 2.4s linear infinite',
        'spin-slow': 'spin-slow 24s linear infinite',
        rise: 'rise 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
