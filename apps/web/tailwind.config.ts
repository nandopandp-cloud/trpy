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
        // Brand palette — ocean/teal primary
        brand: {
          teal: '#10B981',
          cyan: '#0891B2',
          gold: '#F59E0B',
          amber: '#FBBF24',
          coral: '#F87171',
          navy: '#0A0E27',
          slate: '#1E293B',
        },
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0,0,0,.07), 0 10px 15px -3px rgba(0,0,0,.10)',
        'card-lg': '0 8px 16px -2px rgba(0,0,0,.10), 0 20px 40px -6px rgba(0,0,0,.15)',
        'card-xl': '0 12px 24px -4px rgba(0,0,0,.12), 0 32px 64px -8px rgba(0,0,0,.18)',
        'teal': '0 0 24px rgba(16,185,129,0.35), 0 0 64px rgba(16,185,129,0.12)',
        'teal-lg': '0 0 40px rgba(16,185,129,0.45), 0 0 80px rgba(16,185,129,0.18)',
        'gold': '0 0 32px rgba(251,191,36,0.40), 0 0 64px rgba(245,158,11,0.15)',
        'inner-teal': 'inset 0 0 32px rgba(16,185,129,0.12)',
      },
      backgroundImage: {
        'ocean': 'linear-gradient(135deg, #10B981 0%, #0891B2 100%)',
        'ocean-dark': 'linear-gradient(135deg, #065F46 0%, #0C4A6E 100%)',
        'sunset': 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
        'aurora': 'linear-gradient(135deg, #10B981 0%, #8B5CF6 50%, #0891B2 100%)',
        'hero-overlay': 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.85) 100%)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.05', fontWeight: '900' }],
        'display-sm': ['2.5rem', { lineHeight: '1.1', fontWeight: '800' }],
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
