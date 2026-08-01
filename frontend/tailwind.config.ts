import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // shadcn/ui semantic tokens — mapped from CSS vars in globals.css
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
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
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
      },
      fontSize: {
        // Financial data typography scale
        'metric-xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '500', letterSpacing: '0.05em' }],
        'metric-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600', letterSpacing: '0.025em' }],
        'metric-base': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'metric-lg': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'metric-xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '700', letterSpacing: '-0.025em' }],
        'metric-2xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '800', letterSpacing: '-0.025em' }],
        'metric-3xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '800', letterSpacing: '-0.05em' }],
        'metric-4xl': ['3rem', { lineHeight: '1', fontWeight: '900', letterSpacing: '-0.05em' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'number-tick': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'spin-slow': 'spin-slow 3s linear infinite',
        'number-tick': 'number-tick 0.25s ease-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-dark':
          'linear-gradient(to bottom right, #050C1A 0%, #080F20 40%, #0A1228 70%, #060D1C 100%)',
        'glow-blue':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.12), transparent)',
        'glow-violet':
          'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(139,92,246,0.10), transparent)',
        'glow-indigo':
          'radial-gradient(ellipse 50% 30% at 20% 60%, rgba(99,102,241,0.08), transparent)',
        'card-shine':
          'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 60%)',
        'blue-gradient': 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
        'violet-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
        'success-gradient': 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
        'card-sm': '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.04)',
        card: '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        'card-lg': '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow-blue-sm': '0 0 12px rgba(59, 130, 246, 0.25)',
        'glow-blue': '0 0 24px rgba(59, 130, 246, 0.3)',
        'glow-blue-lg': '0 0 48px rgba(59, 130, 246, 0.4)',
        'glow-violet-sm': '0 0 12px rgba(139, 92, 246, 0.25)',
        'glow-violet': '0 0 24px rgba(139, 92, 246, 0.3)',
        'glow-violet-lg': '0 0 48px rgba(139, 92, 246, 0.4)',
        'glow-green': '0 0 24px rgba(16, 185, 129, 0.3)',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.06)',
        'inner-dark': 'inset 0 -1px 0 rgba(0,0,0,0.3)',
        elevated:
          '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
      dropShadow: {
        'glow-blue': ['0 0 8px rgba(59,130,246,0.6)', '0 0 16px rgba(59,130,246,0.3)'],
        'glow-violet': ['0 0 8px rgba(139,92,246,0.6)', '0 0 16px rgba(139,92,246,0.3)'],
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '64px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
