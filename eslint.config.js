// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    settings: {
      'import/ignore': ['@env'],
    },
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^@env$'] }],
    },
  },
]);
