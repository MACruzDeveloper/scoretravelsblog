import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Classic hooks rules; the React Compiler rules of v7 can be enabled later
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      // Removing `any` is tracked in the plan (phase 4)
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // Playwright tests and config run in Node, not in the browser
    files: ['e2e/**', 'playwright.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/tests/**', '**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node, ...globals.vitest },
    },
    rules: {
      // Test helpers are never hot reloaded
      'react-refresh/only-export-components': 'off',
    },
  },
)
