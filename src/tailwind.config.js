/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '1.5' }],
        'sm':   ['12px', { lineHeight: '1.5' }],
        'base': ['13px', { lineHeight: '1.6' }],
        'md':   ['14px', { lineHeight: '1.6' }],
        'lg':   ['15px', { lineHeight: '1.6' }],
        'xl':   ['16px', { lineHeight: '1.5' }],
        '2xl':  ['18px', { lineHeight: '1.4' }],
        '3xl':  ['20px', { lineHeight: '1.4' }],
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
