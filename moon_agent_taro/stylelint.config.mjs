/** @type {import('stylelint').Config} */
export default {
  extends: 'stylelint-config-standard-scss',
  rules: {
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'layer'],
      },
    ],
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    // Allow page selector for mini programs
    'selector-type-no-unknown': [
      true,
      {
        ignoreTypes: ['page'],
      },
    ],
    // Relax color notation rules
    'color-function-notation': null,
    'alpha-value-notation': null,
    'length-zero-no-unit': null,
    'color-function-alias-notation': null,
  },
};
