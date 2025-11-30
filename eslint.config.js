import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  js.configs.recommended,
  ...compat.config({
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: [
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:jsx-a11y/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaFeatures: { jsx: true },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Disallow direct use of global `fetch` to enforce using the central api layer.
      // Use `apiFetch` / rest helpers in `app/lib/api` instead so headers, refresh
      // logic and error handling remain consistent.
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch']",
          message:
            'Direct `fetch()` is disallowed in application code. Use the central `apiFetch` or rest helpers from `app/lib/api`.',
        },
      ],
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'no-empty-pattern': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
    ignorePatterns: ['node_modules/', '.react-router/', 'public/', 'build/', 'coverage/'],
    overrides: [
      {
        files: ['*.ts', '*.tsx'],
        parserOptions: { project: './tsconfig.json' },
        rules: {},
      },
      // Allow `fetch` inside our central API implementation and token refresh helper.
      {
        files: ['app/lib/api/**', 'app/lib/token.ts'],
        rules: {
          'no-restricted-syntax': 'off',
        },
      },
      // Allow scripts and tooling to call fetch directly.
      {
        files: ['scripts/**', 'scripts/*'],
        rules: {
          'no-restricted-syntax': 'off',
        },
      },
    ],
  }),
];
