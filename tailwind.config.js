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
          sans: ['Inter', 'system-ui', 'sans-serif'],
          display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
          serif: ['Inter', 'system-ui', 'sans-serif'],
          script: ['Inter', 'system-ui', 'sans-serif'],
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
          'hero-eyebrow': 'heroEyebrow 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          'hero-title': 'heroTitle 1s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards',
          'hero-body': 'heroBody 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.28s forwards',
          'hero-cta': 'heroCta 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.42s forwards',
          'hero-stats': 'heroStats 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          'hero-title-shimmer': 'heroTitleShimmer 6s ease-in-out infinite',
          'hero-float': 'heroFloat 5s ease-in-out infinite',
          'hero-cert-glow': 'heroCertGlow 3.5s ease-in-out infinite',
          'hero-twinkle': 'heroTwinkle 4s ease-in-out infinite',
          'hero-link-pulse': 'heroLinkPulse 2.5s ease-in-out infinite',
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
            '0%': { opacity: '0', transform: 'translateY(14px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          heroCta: {
            '0%': { opacity: '0', transform: 'translateY(16px) scale(0.98)' },
            '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          },
          heroStats: {
            '0%': { opacity: '0', transform: 'translateY(20px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          heroTitleShimmer: {
            '0%, 100%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
          },
          heroFloat: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
          heroCertGlow: {
            '0%, 100%': { filter: 'drop-shadow(0 0 22px rgba(251, 191, 36, 0.35))' },
            '50%': { filter: 'drop-shadow(0 0 40px rgba(251, 191, 36, 0.6))' },
          },
          heroTwinkle: {
            '0%, 100%': { opacity: '0.25' },
            '50%': { opacity: '0.9' },
          },
          heroLinkPulse: {
            '0%, 100%': { opacity: '0.85' },
            '50%': { opacity: '1' },
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
