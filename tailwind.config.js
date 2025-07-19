/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        success: '#f0fdf0',
        warning: '#fff6e9',
        error: '#ffeded',
      }
    },
  },
  plugins: [],
}

/** check out CONVEX*/