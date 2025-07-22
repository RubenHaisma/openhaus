import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: 'hsl(var(--elegant-red-50))',
          100: 'hsl(var(--elegant-red-100))',
          200: 'hsl(var(--elegant-red-200))',
          300: 'hsl(var(--elegant-red-300))',
          400: 'hsl(var(--elegant-red-400))',
          500: 'hsl(var(--elegant-red-500))',
          600: 'hsl(var(--elegant-red-600))',
          700: 'hsl(var(--elegant-red-700))',
          800: 'hsl(var(--elegant-red-800))',
          900: 'hsl(var(--elegant-red-900))',
          950: 'hsl(var(--elegant-red-950))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#fefefe',
          100: '#fdfdfd',
          200: '#fafafa',
          300: '#f7f7f7',
          400: '#f0f0f0',
          500: '#e8e8e8',
          600: '#d1d1d1',
          700: '#b4b4b4',
          800: '#888888',
          900: '#5c5c5c',
          950: '#2e2e2e',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Additional utility colors
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Elegant Red & White Theme
        elegant: {
          red: {
            50: 'hsl(var(--elegant-red-50))',
            100: 'hsl(var(--elegant-red-100))',
            200: 'hsl(var(--elegant-red-200))',
            300: 'hsl(var(--elegant-red-300))',
            400: 'hsl(var(--elegant-red-400))',
            500: 'hsl(var(--elegant-red-500))',
            600: 'hsl(var(--elegant-red-600))',
            700: 'hsl(var(--elegant-red-700))',
            800: 'hsl(var(--elegant-red-800))',
            900: 'hsl(var(--elegant-red-900))',
            950: 'hsl(var(--elegant-red-950))',
          },
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 12px)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in-fade': 'scaleInFade 0.4s ease-out',
        'elegant-float': 'elegantFloat 3s ease-in-out infinite',
        'elegant-pulse': 'elegantPulse 2s infinite',
        'dashboard-fade-in': 'dashboardFadeIn 0.6s ease-out',
        'dashboard-slide-in': 'dashboardSlideIn 0.5s ease-out',
        'dashboard-pulse': 'dashboardPulse 2s infinite',
        'dashboard-glow': 'dashboardGlow 3s infinite',
        'skeleton-loading': 'skeletonLoading 1.5s infinite',
        'notification-slide-in': 'notificationSlideIn 0.3s ease-out',
        'notification-slide-out': 'notificationSlideOut 0.3s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleInFade: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        elegantFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        elegantPulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--elegant-red-500) / 0.4)' },
          '50%': { boxShadow: '0 0 0 20px hsl(var(--elegant-red-500) / 0)' },
        },
        dashboardFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        dashboardSlideIn: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        dashboardPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        dashboardGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' },
        },
        skeletonLoading: {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        notificationSlideIn: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        notificationSlideOut: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'elegant-sm': '0 2px 8px -2px hsl(var(--elegant-red-500) / 0.1)',
        'elegant': '0 10px 25px -5px hsl(var(--elegant-red-500) / 0.15)',
        'elegant-lg': '0 25px 50px -12px hsl(var(--elegant-red-500) / 0.25)',
        'elegant-xl': '0 30px 60px -12px hsl(var(--elegant-red-500) / 0.3)',
        'dashboard': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dashboard-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'dashboard-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'dashboard-glow': '0 0 20px rgba(59, 130, 246, 0.3)',
      },
      backdropBlur: {
        'dashboard': '12px',
      },
      transitionTimingFunction: {
        'dashboard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'dashboard-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
}

export default config