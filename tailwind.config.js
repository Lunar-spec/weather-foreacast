/** @type {import('tailwindcss').Config} */
export const content = ["./src/**/*.{html,js}"];
export const theme = {
  extend: {
    backgroundImage: {
      "smooth": "url('./assets/smooth.avif')",
      "travel": "url('./assets/travel.avif')",
      "sky": "url('./assets/sky.avif')"
    },
  },
};
export const plugins = [];