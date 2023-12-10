module.exports = {
  extends: ['next/core-web-vitals', 'turbo', 'prettier'],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
  plugins: ["@typescript-eslint"],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
}
