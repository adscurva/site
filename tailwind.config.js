/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nova paleta de cores para a Curva Engenharia
        primary: {
          light: "#E3E9F2", // Azul claro para fundos secundários
          DEFAULT: "#203354", // Azul marinho principal (logo, títulos)
          dark: "#14213d",
        },
        accent: {
          light: "#F7A88B", // Laranja claro
          DEFAULT: "#F27A4E", // Laranja principal (botões, destaques)
          dark: "#E36C3F",
        },
        neutral: {
          white: "#FFFFFF",
          light: "#F5F5F5", // Cinza claro para fundos
          medium: "#D4D4D4", // Cinza intermediário
          dark: "#333333", // Cinza escuro para textos
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Playfair Display', 'ui-serif', 'Georgia'],
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}