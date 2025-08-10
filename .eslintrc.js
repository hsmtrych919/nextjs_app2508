module.exports = {
  // 環境設定
  env: {
    browser: true,
    // es6: true
    es2021: true
  },
  // 実行ルール
  extends: ['eslint:recommended', 'prettier', 'next','next/core-web-vitals'],
  // react利用 の場合
  // extends: ['eslint:recommended','plugin:react/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  // ES Modules 機能を有効
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react'],
  // 個別ルールの追加 保存時に実行する最低限の整形
  rules: {
    'no-console': 0,
    'quotes': [2, 'single'],
    'no-multi-spaces': 2,
    'no-multiple-empty-lines': [2, {'max': 10}],
    'indent': [2, 2],
    'computed-property-spacing': 2,
    'keyword-spacing': 2,
    'semi': ['error', 'always'],
    'semi-spacing': ['error', {'after': true, 'before': false}],
    'semi-style': ['error', 'last'],
    'no-extra-semi': 'error'
  }
};