/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        alfa: {
          red: '#EF2B2D',
          green: '#009E49',
        },
        ink: {
          50: '#f7f8fa',
          100: '#eef0f4',
          200: '#d9dde5',
          300: '#b6bdca',
          400: '#8a93a5',
          500: '#5f6878',
          600: '#3f4757',
          700: '#2a3140',
          800: '#1a2030',
          900: '#0e131f',
        },
      },
      fontFamily: {
        serif: ['"Times New Roman"', 'Times', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        '3d-green': '0 6px 0 #007a38, 0 8px 18px rgba(0,158,73,0.35)',
        '3d-green-sm': '0 4px 0 #007a38, 0 6px 12px rgba(0,158,73,0.3)',
        '3d-green-press': '0 2px 0 #007a38, 0 3px 6px rgba(0,158,73,0.3)',
        '3d-blue': '0 6px 0 #1a6fb0, 0 8px 18px rgba(41,128,185,0.35)',
        '3d-blue-press': '0 2px 0 #1a6fb0, 0 3px 6px rgba(41,128,185,0.3)',
        '3d-ink': '0 5px 0 #0a0e16, 0 7px 16px rgba(26,32,48,0.3)',
        soft: '0 2px 12px -2px rgba(26,32,48,0.1)',
        card: '0 8px 30px -10px rgba(26,32,48,0.18)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeInScale: { '0%': { opacity: '0', transform: 'scale(0.96)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        slideDown: { '0%': { opacity: '0', maxHeight: '0' }, '100%': { opacity: '1', maxHeight: '600px' } },
        floaty: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        popIn: { '0%': { opacity: '0', transform: 'scale(0.7)' }, '70%': { transform: 'scale(1.05)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        ringDraw: { '0%': { strokeDashoffset: 'var(--circ)' }, '100%': { strokeDashoffset: 'var(--offset)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out both',
        fadeInScale: 'fadeInScale 0.4s ease-out both',
        slideDown: 'slideDown 0.4s ease-out both',
        floaty: 'floaty 6s ease-in-out infinite',
        popIn: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
      },
    },
  },
  plugins: [],
};
