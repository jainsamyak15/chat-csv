/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00ff00',
          dark: '#00cc00',
          light: '#33ff33',
        },
        dark: {
          DEFAULT: '#1a1a1a',
          lighter: '#2d2d2d',
          darker: '#0d0d0d',
        },
        success: '#00ff00',
        error: '#ff0000',
        warning: '#ffff00',
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.primary.DEFAULT), 0 0 20px theme(colors.primary.DEFAULT)',
        'neon-sm': '0 0 2px theme(colors.primary.DEFAULT), 0 0 10px theme(colors.primary.DEFAULT)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}