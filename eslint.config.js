import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules'] },

  // JS base rules
  js.configs.recommended,

  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // TypeScript
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      // tsc ya comprueba identificadores no definidos; no-undef no entiende
      // referencias de tipo (p.ej. `React.ReactNode`) y da falsos positivos.
      'no-undef': 'off',

      // React Hooks
      ...reactHooks.configs.recommended.rules,

      // React Refresh (Vite HMR)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Ficheros de configuración: corren en Node, no en el navegador
  {
    files: ['*.config.{js,ts}'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Prettier debe ir al final para desactivar reglas de formato
  prettierConfig,
];
