const config = require('tailwind-config/tailwind.config.js');

module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: { config },
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: { 'preset': 'advanced' } } : {}),
  },
};
