/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--ink-muted) / <alpha-value>)',
        'ink-faint': 'rgb(var(--ink-faint) / <alpha-value>)',
        amber: {
          DEFAULT: '#E8A33D',
          50: '#FDF6E9', 100: '#FBEBD0', 200: '#F6D6A0', 300: '#F1C070',
          400: '#ECAD4F', 500: '#E8A33D', 600: '#C7822A', 700: '#A0651F',
          800: '#794C17', 900: '#523310',
        },
        teal: {
          DEFAULT: '#1F9E8F',
          50: '#E9FBF8', 100: '#CDF5EE', 200: '#9CEBE0', 300: '#63D9CB',
          400: '#38C2B3', 500: '#1F9E8F', 600: '#187E73', 700: '#146259',
          800: '#0F4B44', 900: '#0A332F',
        },
        danger: { DEFAULT: '#E5484D', 100: '#FCE3E4', 700: '#992025' },
        success: { DEFAULT: '#34B27A', 100: '#DEF5EB', 700: '#1D7A52' },
      },
      boxShadow: {
        soft: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -8px rgb(0 0 0 / 0.10)',
        'soft-lg': '0 4px 12px rgb(0 0 0 / 0.06), 0 24px 48px -12px rgb(0 0 0 / 0.18)',
        glow: '0 0 0 1px rgb(232 163 61 / 0.15), 0 8px 24px -4px rgb(232 163 61 / 0.25)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        'pulse-dot': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
