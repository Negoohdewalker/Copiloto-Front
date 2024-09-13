/** @type {import('tailwindcss').Config} */
import flowbite from 'flowbite/plugin';

export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'custom-gray': '#838383',
        'base': '#39B49E',
        'baseClarito': '#A0D6C9 ',
        'azul': '#011B4B',
        'amarillo': '#F2A603',
        'grisTabla': '#ECECEC',
        'azulbajo': '#5d6d7e',
      },
      fontFamily: {
        Roboto: ["Roboto", "sans-serif"], // Corregido el formato aquí
        Quicksand: ["Quicksand", "sans-serif"],
      },
      fontWeight: {
        Medium: 500,
        SemiBold: 600,
        thin1:200,
      },
    },
  },
  plugins: [
    flowbite, // Añadido el plugin de Flowbite
  ],
};
