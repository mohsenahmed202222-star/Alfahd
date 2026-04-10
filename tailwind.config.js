/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 70px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
