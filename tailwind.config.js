/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f3e8ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
        },
        ddx: {
          bg:      '#060010',
          card:    '#0f0520',
          elevated:'#160830',
          border:  '#2a1055',
          border2: '#3d1a7a',
          text:    '#f0e6ff',
          muted:   '#9d8bc0',
          dim:     '#5a4a80',
        },
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(168, 85, 247, 0.35)',
        'neon-cyan':   '0 0 20px rgba(34, 211, 238, 0.35)',
        'neon-pink':   '0 0 20px rgba(244, 63, 94, 0.35)',
        'glow-sm':     '0 0 8px rgba(168, 85, 247, 0.5)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in':  'fadeIn 0.2s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(168,85,247,0.4)' },
          '50%':      { boxShadow: '0 0 24px rgba(168,85,247,0.8)' },
        },
      },
    },
  },
  plugins: [],
}
