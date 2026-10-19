// @ts-check
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const unusedImports = require('eslint-plugin-unused-imports');

module.exports = tseslint.config(
    {
        ignores: ['**/node_modules/**', 'dist/**'],
    },
    {
        files: ['**/*.ts'],
        extends: [
            ...angular.configs.tsRecommended,
        ],
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'unused-imports': unusedImports,
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        processor: angular.processInlineTemplates,
        rules: {
            'max-len': 'off',
            '@angular-eslint/no-output-on-prefix': 'off',
            '@angular-eslint/no-input-rename': 'off',
            '@angular-eslint/no-output-rename': 'off',
            '@angular-eslint/no-output-native': 'off',
            '@angular-eslint/component-selector': 'off',
            '@angular-eslint/directive-selector': 'off',
            '@angular-eslint/prefer-inject': 'off',
            '@angular-eslint/prefer-on-push-component-change-detection': 'off',
            '@angular-eslint/prefer-standalone': 'off',
            '@typescript-eslint/consistent-type-definitions': 'error',
            'unused-imports/no-unused-imports': 'error',
            'curly': ['error', 'multi-line'],
        },
    },
    {
        files: ['**/*.html'],
        extends: [
            ...angular.configs.templateRecommended,
        ],
        rules: {
            '@angular-eslint/template/prefer-control-flow': 'off',
        },
    },
);
