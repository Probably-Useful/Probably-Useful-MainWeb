/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Probably Useful" — confident indigo/violet with an electric accent
        ink: {
          DEFAULT: '#0b0b14',
          soft: '#12121f',
          card: '#16162a'
        },
        iris: {
          50: '#eef0ff',
          100: '#dfe2ff',
          300: '#a9b0ff',
          400: '#8b8cff',
          500: '#6d5efc',
          600: '#5a45e8',
          700: '#4a36c4'
        },
        spark: {
          DEFAULT: '#37e6c9',
          soft: '#5bf0d6'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(109,94,252,0.25), 0 20px 60px -20px rgba(109,94,252,0.45)',
        card: '0 10px 40px -16px rgba(0,0,0,0.7)',
        spark: '0 0 24px -2px rgba(55,230,201,0.5)'
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-in': 'fade-in 1s ease-out both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 3s linear infinite',
        'pulse-ring': 'pulse-ring 2.2s ease-out infinite'
      }
    }
  },
  plugins: []
}
