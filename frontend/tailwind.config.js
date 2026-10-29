/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8f9d4d',
          hover: '#7d8a41',
          light: '#f4f6ea',
          ring: '#c6d096',
        },
        ink: {
          900: '#0f1115',
          800: '#1f2229',
          700: '#3d4149',
          600: '#62676f',
          500: '#8a9099',
          300: '#c7ccd4',
          200: '#e6e9ee',
          100: '#f4f5f7',
          50: '#fafafb',
        },
        danger: '#dc2626',
        success: '#16a34a',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.08)',
        pop: '0 20px 40px -12px rgba(16,24,40,0.18)',
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
};