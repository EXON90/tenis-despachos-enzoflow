/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        enzotec: {
          red: '#f20505',
          darkRed: '#b80000',
          softRed: '#fee2e2',
          ink: '#111827',
          muted: '#6b7280',
          panel: '#ffffff',
          surface: '#f6f7f9',
          border: '#e5e7eb',
        },
      },
    },
  },
  plugins: [],
}
