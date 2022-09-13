module.exports = {
  tailwindConfig: 'packages/tailwind-config/tailwind.config.js',
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  proseWrap: 'never',
  arrowParens: 'avoid',
  plugins: [require('prettier-plugin-tailwindcss')],
};
