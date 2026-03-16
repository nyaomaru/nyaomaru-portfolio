import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';

const boundarySettings = {
  'boundaries/elements': [
    { type: 'shared', pattern: 'shared/*' },
    { type: 'entities', pattern: 'entities/*' },
    { type: 'features', pattern: 'features/*' },
    { type: 'widgets', pattern: 'widgets/*' },
    { type: 'pages', pattern: 'pages/*' },
    { type: 'app', pattern: 'app/*' },
  ],
  'boundaries/ignore': ['**/@x/**'],
};

export default [
  {
    ignores: ['build/**'],
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
      boundaries,
      import: importPlugin,
    },
    settings: {
      ...boundarySettings,
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
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'shared', allow: ['shared'] },
            { from: 'entities', allow: ['shared'] },
            { from: 'features', allow: ['entities', 'shared'] },
            { from: 'widgets', allow: ['features', 'entities', 'shared'] },
            {
              from: 'pages',
              allow: ['widgets', 'features', 'entities', 'shared'],
            },
            {
              from: 'app',
              allow: ['pages', 'widgets', 'features', 'entities', 'shared'],
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
      'boundaries/element-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
