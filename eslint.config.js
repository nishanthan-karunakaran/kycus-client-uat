// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      {
        languageOptions: {
          parserOptions: {
            project: './tsconfig.json',
            tsconfigRootDir: __dirname,
          },
        },
      },
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: ['app', 'ui', 'rekyc'],
          style: 'kebab-case',
        },
      ],
      '@typescript-eslint/no-empty-function': 'off', // Function body should not be empty
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'array-simple',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../../*'],
        },
      ],
      '@typescript-eslint/no-useless-constructor': 'error',
      'no-extra-boolean-cast': 'error',
      eqeqeq: 'error',
      'no-console': 'error',
      'no-debugger': 'error', // Disallows debugger
      'no-duplicate-imports': 'error',
      'max-len': [
        'error',
        {
          code: 100,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
          ignoreRegExpLiterals: true,
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/use-track-by-function': 'error',
      '@angular-eslint/template/no-negated-async': 'error',
      // '@angular-eslint/template/no-call-expression': 'error',
      // '@angular-eslint/template/cyclomatic-complexity': [
      //   'error',
      //   { maxComplexity: 5 },
      // ],
    },
  },
);
