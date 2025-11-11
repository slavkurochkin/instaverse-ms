module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended', // Use this line to integrate Prettier with ESLint
    'prettier', // Disables ESLint rules that conflict with Prettier
  ],
  rules: {
    'prettier/prettier': 'error', // Report Prettier issues as ESLint errors
    // Add any specific indentation rule if needed
    indent: 'off', // Optional: disable ESLint’s indentation rule if still causing issues
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['react', 'prettier'],
};
