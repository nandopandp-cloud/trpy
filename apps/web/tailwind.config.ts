import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // DS v2 semantic colors
        trpy: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
          accent: '#6366f1',
          warm: '#f59e0b',
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0,0,0,.04), 0 10px 15px -3px rgba(0,0,0,.06)',
        'card-lg': '0 8px 16px -2px rgba(0,0,0,.06), 0 20px 40px -6px rgba(0,0,0,.10)',
        'card-xl': '0 12px 24px -4px rgba(0,0,0,.08), 0 32px 64px -8px rgba(0,0,0,.14)',
        'indigo': '0 0 24px rgba(99,102,241,0.30), 0 0 64px rgba(99,102,241,0.10)',
        'indigo-lg': '0 0 40px rgba(99,102,241,0.45), 0 0 80px rgba(99,102,241,0.18)',
        'warm': '0 0 24px rgba(245,158,11,0.30), 0 0 48px rgba(245,158,11,0.10)',
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #f59e0b 100%)',
        'dark-surface': 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)',
        'warm-gradient': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'hero-overlay': 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 65%, rgba(0,0,0,0.92) 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        display: ['Inter', ...defaultTheme.fontFamily.sans],
        accent: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
        mono: ['Space Mono', ...defaultTheme.fontFamily.mono],
        serif: ['Playfair Display', ...defaultTheme.fontFamily.serif],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '0.95', fontWeight: '500', letterSpacing: '-0.02em' }],
        'display-lg': ['6.5rem', { lineHeight: '0.92', fontWeight: '500', letterSpacing: '-0.03em' }],
        'display-sm': ['2.5rem', { lineHeight: '1.1', fontWeight: '500', letterSpacing: '-0.02em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
