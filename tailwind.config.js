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
        background: '#000000',
        foreground: '#ffffff',
        primary: '#ffffff',
        accent: {
          50: '#f8f8f8',
          100: '#f0f0f0',
          500: '#666666',
          600: '#4a4a4a',
          700: '#333333',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      screens: {
        'ipad': '1024px',
      },
    },
  },
  plugins: [],
}