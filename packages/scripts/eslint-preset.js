module.exports = {
  extends: ["react-app"],
  settings: {
    react: {
      version: "detect",
    },
  },
  plugins: ["@typescript-eslint", "import", "react", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "no-redeclare": [
      "error",
      {
        ignoreDeclarationMerge: true,
      }
    ]
  }
};
