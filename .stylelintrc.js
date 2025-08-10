module.exports = {
  "extends": [
    "stylelint-config-recommended-scss",
    "stylelint-config-property-sort-order-smacss"
  ],
  "plugins": [
    "stylelint-scss"
  ],
  "rules": {
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": [true, {
      "ignoreAtRules": [
        "function",
        "if",
        "else if", 
        "else",
        "for",
        "each",
        "include",
        "mixin",
        "content",
        "use",
        "forward"
      ]
    }],
    "block-no-empty": null,
    "property-no-vendor-prefix": true,
    "font-family-name-quotes": "always-where-recommended",
    "font-weight-notation": null,
    "no-descending-specificity": null,
    "declaration-block-no-duplicate-properties": true,
    "color-function-notation": "legacy",
    "no-invalid-double-slash-comments": null,
    "comment-no-empty": null,
    "function-calc-no-unspaced-operator": true
  }
};