/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // 深色主题 - 灵感来自 Tokyo Night
        surface: {
          50: '#f0f4fc',
          100: '#e1e9f8',
          200: '#c3d3f1',
          300: '#9ab5e6',
          400: '#6a8fd8',
          500: '#4a6bc8',
          600: '#3b51b8',
          700: '#343f9a',
          800: '#1a1b26',
          900: '#16161e',
          950: '#0d0d14',
        },
        accent: {
          cyan: '#7dcfff',
          blue: '#7aa2f7',
          purple: '#bb9af7',
          magenta: '#ff007c',
          orange: '#ff9e64',
          yellow: '#e0af68',
          green: '#9ece6a',
          teal: '#73daca',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'typing': 'typing 1.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(122, 162, 247, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(122, 162, 247, 0.6)' },
        },
        typing: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-gradient': 'linear-gradient(135deg, rgba(122, 162, 247, 0.1) 0%, rgba(187, 154, 247, 0.1) 50%, rgba(115, 218, 202, 0.1) 100%)',
      },
    },
  },
  plugins: [],
}


