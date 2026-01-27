/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}", // Changed to lowercase 'c' to match your folder
    "./src/**/*.{js,jsx}",        // Added just in case
  ],
  theme: {
    extend: {
      animation: {
        scroll: 'scroll 2s linear infinite',
      },
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-33.33%)' }, // Correct for tripled logos
        },
      },
    },
  },
  plugins: [],
};