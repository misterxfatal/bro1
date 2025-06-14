/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'gradient-x': 'gradientX 3s ease infinite',
        'gradient-y': 'gradientY 3s ease infinite',
        'gradient-xy': 'gradientXY 6s ease infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-down': 'fadeInDown 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'micro-bounce': 'micro-bounce 0.6s ease-in-out',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        gradientX: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        gradientY: {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        gradientXY: {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' },
        },
        'micro-bounce': {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'professional': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'professional-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'professional-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow-lg': '0 0 40px rgba(59, 130, 246, 0.4), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'neon-green': '0 0 20px rgba(34, 197, 94, 0.5), 0 0 40px rgba(34, 197, 94, 0.3), 0 0 60px rgba(34, 197, 94, 0.1)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.5), 0 0 40px rgba(236, 72, 153, 0.3), 0 0 60px rgba(236, 72, 153, 0.1)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3), 0 0 60px rgba(6, 182, 212, 0.1)',
        'neon-purple': '0 0 20px rgba(147, 51, 234, 0.5), 0 0 40px rgba(147, 51, 234, 0.3), 0 0 60px rgba(147, 51, 234, 0.1)',
      },
      colors: {
        gray: {
          50: '#fafbfc',
          100: '#f2f4f7',
          200: '#e4e7ec',
          300: '#d0d5dd',
          400: '#98a2b3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1d2939',
          900: '#101828',
          950: '#0c111d',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)',
        'neon-grid': 'linear-gradient(rgba(236, 72, 153, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 72, 153, 0.1) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '20px 20px',
        'grid-sm': '10px 10px',
        'grid-lg': '40px 40px',
      },
    }
  },
  plugins: [],
  safelist: [
    {
      pattern: /(bg|text|border|from|to|ring|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(50|100|200|300|400|500|600|700|800|900|950)/,
      variants: ['hover', 'focus', 'active', 'dark', 'group-hover']
    },
    {
      pattern: /(bg|border)-opacity-(10|20|30|40|50|60|70|80|90)/,
    },
    {
      pattern: /(w|h)-(4|5|6|8|10|12|16|20|24)/,
    },
    {
      pattern: /(p|m|px|py|pt|pb|pl|pr|mx|my|mt|mb|ml|mr)-(1|2|3|4|5|6|8|10|12|16|20|24)/,
    },
    {
      pattern: /text-(xs|sm|base|lg|xl|2xl|3xl)/,
    },
    {
      pattern: /grid-cols-(1|2|3|4|5|6)/,
    },
    {
      pattern: /gap-(1|2|3|4|5|6|8)/,
    },
    {
      pattern: /(rounded|shadow)-(sm|md|lg|xl|2xl|3xl)/,
    },
    {
      pattern: /backdrop-blur-(sm|md|lg|xl|2xl|3xl)/,
    },
    {
      pattern: /animate-(gradient-x|gradient-y|gradient-xy|pulse-slow|float|glow|micro-bounce|scanline)/,
    },
    // Professional utility classes
    'card-professional',
    'card-professional-dark',
    'btn-professional',
    'btn-professional-primary',
    'btn-professional-secondary',
    'btn-professional-success',
    'btn-professional-danger',
    'input-professional',
    'input-professional-dark',
    'badge-professional',
    'badge-professional-primary',
    'badge-professional-success',
    'badge-professional-warning',
    'badge-professional-danger',
    'glass-effect',
    'glass-effect-dark',
    'shadow-professional',
    'shadow-professional-lg',
    'shadow-professional-xl',
    'shadow-glow',
    'shadow-glow-lg',
    'shadow-neon-green',
    'shadow-neon-pink',
    'shadow-neon-cyan',
    'shadow-neon-purple',
    'progress-bar',
    'progress-bar-fill',
    'progress-bar-success',
    'progress-bar-warning',
    'progress-bar-danger',
    'loading-skeleton',
    'loading-skeleton-dark',
    'animate-fade-in-up',
    'animate-fade-in-down',
    'animate-slide-in-right',
    'animate-shimmer',
    'line-clamp-1',
    'line-clamp-2',
    'line-clamp-3',
    'cyber-grid',
    'cyber-scanline',
    'rgb-border',
    'neon-glow',
    'neon-border',
    'wave-animation',
    'interactive-card',
    'interactive-button',
    'micro-bounce',
    'focus-ring',
    'focus-ring-inset',
    'touch-manipulation',
    'safe-area-inset-top',
    'safe-area-inset-bottom',
    'safe-area-inset-left',
    'safe-area-inset-right',
    'mobile-bottom-nav',
    'mobile-nav-item',
    'mobile-hidden',
    'mobile-only',
  ]
};