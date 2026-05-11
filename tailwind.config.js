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
          parchment: {
            50: '#FEFCF8',
            100: '#FAF3E8',
            150: '#F5EBDC',
            200: '#EDE0D0',
            300: '#E0D0BA',
            400: '#D4A373',
            500: '#C9A56E',
            600: '#B08A5E',
            700: '#967454',
            800: '#7D5F47',
            900: '#45372c',
            950: '#1c1714',
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
            '0%, 100%': { boxShadow: '0 0 0 0 rgba(124,58,237,0.3)' },
            '50%': { boxShadow: '0 0 0 8px rgba(124,58,237,0)' },
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
          'card': '0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)',
          'card-hover': '0 4px 12px 0 rgba(0,0,0,0.12), 0 2px 6px -1px rgba(0,0,0,0.08)',
          'violet': '0 4px 14px 0 rgba(124,58,237,0.3)',
        },
      },
    },
    plugins: [],
  };