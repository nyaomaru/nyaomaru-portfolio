import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

export default [
  {
    ignores: ['build/**', '.react-router/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json'],
      },
      globals: {
        window: true,
        document: true,
      },
    },
    plugins: {
      react,
      jsxA11y,
      import: importPlugin,
    },
    settings: {
      react: {
        version: 'detect',
      },
      formComponents: ['Form'],
      linkComponents: [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' },
      ],
      'import/internal-regex': '^@/',
      'import/resolver': {
        node: { extensions: ['.ts', '.tsx'] },
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json'],
        },
      },
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          basePath: '.',
          zones: [
            {
              target: './shared',
              from: ['./entities', './features', './widgets', './pages', './app'],
            },
            { target: './entities', from: ['./features', './widgets', './pages', './app'] },
            {
              target: './features',
              from: ['./widgets', './pages', './app'],
            },
            {
              target: './widgets',
              from: ['./pages', './app'],
            },
            {
              target: './pages',
              from: ['./app'],
            },
          ],
        },
      ],
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['tests/**'],
    rules: {
      'import/no-restricted-paths': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
