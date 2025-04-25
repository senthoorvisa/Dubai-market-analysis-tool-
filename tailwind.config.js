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
        // NAAZ black and white color theme
        naaz: {
          black: '#000000',
          'dark-gray': '#202020',
          gray: '#404040',
          'light-gray': '#808080',
          'off-white': '#f5f5f5',
          white: '#ffffff',
        },
      },
    },
  },
  plugins: [],
}; 