export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        paper: '#f4f3ef',
        signal: '#ef3340',
        orbit: '#1f6feb',
        night: '#05070b',
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica Neue', 'sans-serif'],
        display: ['Arial Black', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        lift: '0 20px 60px rgba(0, 0, 0, 0.18)',
      },
    },
  },
  plugins: [],
}
