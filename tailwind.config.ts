import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0E14',
          secondary: '#151A23',
          tertiary: '#1E2532',
          hover: '#252E3F',
        },
        primary: {
          DEFAULT: '#1A56FF',
          hover: '#003FE6',
          active: '#002EB3',
        },
        success: {
          DEFAULT: '#16A34A',
          hover: '#15803D',
        },
        crimson: {
          DEFAULT: '#DC2626',
        },
        tier: {
          bronze: '#CD7F32',
          silver: '#C0C0C0',
          gold: '#FFD700',
          platinum: '#E5E4E2',
          diamond: '#B9F2FF',
          master: '#FF00FF',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#94A3B8',
          tertiary: '#64748B',
          inverse: '#FFFFFF',
        },
        border: {
          DEFAULT: '#334155',
          subtle: '#1E293B',
          accent: '#1A56FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['SF Pro Display', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(26, 86, 255, 0.4)',
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'dice-roll': 'diceRoll 0.5s ease-out',
        'checker-slide': 'checkerSlide 0.3s ease-in-out',
        'drawer-slide': 'drawerSlide 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        diceRoll: {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.15)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        checkerSlide: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-8%) scale(1.04)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        drawerSlide: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(26, 86, 255, 0.4)' },
          '50%': { opacity: '0.5', boxShadow: '0 0 10px rgba(26, 86, 255, 0.1)' },
        },
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};

export default config;
