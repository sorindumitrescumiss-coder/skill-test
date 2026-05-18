/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Source Sans 3', 'system-ui', 'sans-serif'],
          serif: ['Cormorant Garamond', 'Georgia', 'serif'],
          script: ['Dancing Script', 'cursive', 'serif'],
          mono: ['IBM Plex Mono', 'monospace'],
        },
        colors: {
          /* Cool neutrals + indigo primary (kept name `parchment` for existing class names) */
          parchment: {
            50: '#f8fafc',
            100: '#f1f5f9',
            150: '#e8eef4',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#4f46e5',
            900: '#4338ca',
            950: '#312e81',
          },
          violet: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          amber: {
            50: '#fffbeb',
            100: '#fef3c7',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
          },
        },
        animation: {
          'fade-in': 'fadeIn 0.2s ease-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
          'shimmer': 'shimmer 1.5s infinite',
          'hero-eyebrow': 'heroEyebrow 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          'hero-title': 'heroTitle 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards',
          'hero-body': 'heroBody 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.22s forwards',
          'hero-cta': 'heroBody 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.38s forwards',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0', transform: 'scale(0.97)' },
            '100%': { opacity: '1', transform: 'scale(1)' },
          },
          slideUp: {
            '0%': { opacity: '0', transform: 'translateY(16px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          pulseGlow: {
            '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.35)' },
            '50%': { boxShadow: '0 0 0 8px rgba(99,102,241,0)' },
          },
          shimmer: {
            '0%': { backgroundPosition: '-200% 0' },
            '100%': { backgroundPosition: '200% 0' },
          },
          heroEyebrow: {
            '0%': { opacity: '0', transform: 'translateY(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          heroTitle: {
            '0%': { opacity: '0', transform: 'translateY(18px)', filter: 'blur(10px)' },
            '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
          },
          heroBody: {
            '0%': { opacity: '0', transform: 'translateY(12px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
        boxShadow: {
          'card': '0 1px 3px 0 rgba(15,23,42,0.06), 0 1px 2px -1px rgba(15,23,42,0.04)',
          'card-hover': '0 4px 12px 0 rgba(15,23,42,0.1), 0 2px 6px -1px rgba(15,23,42,0.06)',
          'violet': '0 4px 14px 0 rgba(99,102,241,0.28)',
        },
      },
    },
    plugins: [],
  };
