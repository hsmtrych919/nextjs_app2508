module.exports = {
  "singleQuote": false,        // Stylelintのダブルクォートルールに合わせる
  "trailingComma": "es5",
  "arrowParens": "always",
  "tabWidth": 2,               // Stylelintのindentation: 2に対応
  // CSS/SCSS専用設定を追加
  "overrides": [
    {
      "files": ["*.scss", "*.css"],
      "options": {
        "singleQuote": false,    // CSSではダブルクォート
        "tabWidth": 2
      }
    }
  ]
}