/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crypto-dark': '#0a0a0a',
        'crypto-gray': '#1a1a1a',
        'crypto-light-gray': '#2a2a2a',
        'crypto-accent': '#00d4aa',
        'crypto-accent-dark': '#00b894',
        'crypto-red': '#ff4757',
        'crypto-green': '#2ed573',
        'crypto-blue': '#5352ed',
        'crypto-yellow': '#ffa502',
      },
      fontFamily: {
        'mono': ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
} 