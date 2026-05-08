import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          DEFAULT: '#faf8ff',
          warm: '#fff7f0',
        },
        surface: {
          DEFAULT: '#ffffff',
          raised: '#f5f0ff',
        },
        primary: {
          DEFAULT: '#8b5cf6',
          light: '#a78bfa',
          dark: '#7c3aed',
          bg: '#f5f0ff',
        },
        secondary: {
          DEFAULT: '#f97066',
          light: '#fca5a1',
          bg: '#fff5f4',
        },
        gold: {
          DEFAULT: '#fbbf24',
          light: '#fde68a',
          bg: '#fffbeb',
        },
        success: {
          DEFAULT: '#34d399',
          light: '#6ee7b7',
          bg: '#ecfdf5',
        },
        ink: {
          DEFAULT: '#2d1b4e',
          secondary: '#6b5a82',
          muted: '#9b8fb0',
        },
        border: {
          DEFAULT: '#e8e0f0',
          subtle: '#f0eaf8',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(139, 92, 246, 0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 24px rgba(139, 92, 246, 0.12), 0 2px 8px rgba(0,0,0,0.06)',
        'button': '0 4px 12px rgba(139, 92, 246, 0.25)',
        'float': '0 12px 40px rgba(139, 92, 246, 0.15)',
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-gold': '0 0 20px rgba(251, 191, 36, 0.3)',
        'inner-soft': 'inset 0 2px 4px rgba(0,0,0,0.04)',
      },
      animation: {
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'wiggle': 'wiggle 0.4s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'streak-glow': 'streak-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'streak-glow': {
          '0%, 100%': { textShadow: '0 0 4px rgba(251, 191, 36, 0.3)' },
          '50%': { textShadow: '0 0 16px rgba(251, 191, 36, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
