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
        // Dubai-themed colors
        'dubai-blue': {
          DEFAULT: '#005DAA',
          dark: '#004A87',
          light: '#75A5D0',
          '50': '#F0F5FA',
          '100': '#D6E4F0',
          '200': '#B3C9E6',
          '300': '#90B1D4',
          '400': '#6D97C2',
          '500': '#4A7EB0',
          '600': '#2B669D',
          '700': '#245685',
          '800': '#00427A',
          '900': '#003B6F',
          '950': '#00284F',
        },
        'gold': {
          DEFAULT: '#D4AF37',
          dark: '#B89229',
          light: '#E5CA6E',
          '50': '#FCF8E8',
          '100': '#F8F0D0',
          '200': '#F1E4B4',
          '300': '#E5CA6E',
          '400': '#DABC51',
          '500': '#D4AF37',
          '600': '#B89229',
          '700': '#9A7A22',
          '800': '#7C621B',
          '900': '#5E4A14',
          '950': '#40320E',
        },
        'teal': {
          '50': '#F0FDFA',
          '100': '#CCFBF1',
          '200': '#99F6E4',
          '300': '#5EEAD4',
          '400': '#2DD4BF',
          '500': '#14B8A6',
          '600': '#0D9488',
          '700': '#0F766E',
          '800': '#115E59',
          '900': '#134E4A',
          '950': '#042F2E',
        },
        // New modern color palette
        'anti-flash-white': '#F0F0F0',
        'beige': '#F0F0DC',
        'tuscany': '#C8A08C',
        'almond': '#F0DCC8',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(10, 205, 205, 0.5)',
        'modern': '0 4px 15px rgba(200, 160, 140, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}; 