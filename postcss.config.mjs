const config = {
  plugins: {
    "@csstools/postcss-color-function": {}, // PRIMERO: convierte lab() a RGB
    "@tailwindcss/postcss": {},             // DESPUÉS: procesa Tailwind
  },
};

export default config;
