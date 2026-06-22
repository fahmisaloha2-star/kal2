import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#B89B5E',
        dark: '#1F1F1F',
        sidebar: '#FFFFFF',
        'sidebar-border': '#E5E7EB',
        'main-bg': '#F8F9FA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
