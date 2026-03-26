/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: '#00d4ff',
        red: '#ff2d55',
        purple: '#8b5cf6',
        gold: '#fbbf24',
        green: '#00ff88',
        'cyber-bg': '#04040f',
        'cyber-surface': '#080818',
        'cyber-card': '#0c0c24',
        'cyber-border': '#1a1a40',
      },
      fontFamily: {
        sans: ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
