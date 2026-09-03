/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // --- shadcn/ui semantic tokens ---
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))'
        },
        // --- legacy aliases mapped to tokens (keeps existing pages rendering) ---
        surface: 'hsl(var(--card))',
        surfaceLight: 'hsl(var(--secondary))',
        panel: 'hsl(var(--panel))',
        brand: {
          50: 'hsl(var(--primary) / 0.08)',
          100: 'hsl(var(--primary) / 0.14)',
          400: 'hsl(var(--primary) / 0.75)',
          500: 'hsl(var(--primary))',
          600: 'hsl(var(--primary) / 0.92)',
          700: 'hsl(var(--primary) / 0.8)',
          accent: 'hsl(var(--signal-telemetry))',
          razorpay: 'hsl(var(--background))',
          razorblue: 'hsl(var(--primary))'
        },
        signal: {
          telemetry: 'hsl(var(--signal-telemetry))',
          sealed: 'hsl(var(--success))',
          review: 'hsl(var(--warning))',
          halted: 'hsl(var(--destructive))'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace']
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      boxShadow: {
        'gate-emerald': 'inset 2px 0 0 0 hsl(var(--success))',
        'gate-amber': 'inset 2px 0 0 0 hsl(var(--warning))',
        'gate-rose': 'inset 2px 0 0 0 hsl(var(--destructive))',
        'gate-cyan': 'inset 2px 0 0 0 hsl(var(--signal-telemetry))',
        'gate-brand': 'inset 2px 0 0 0 hsl(var(--primary))'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
}
