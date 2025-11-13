// @ts-check
import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import eslintPluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig(
  // Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', '*.d.ts', 'coverage/**', 'eslint.config.mjs'],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript ESLint recommended rules
  ...tseslint.configs.recommended,

  // Vue recommended rules for Vue 3
  ...eslintPluginVue.configs['flat/recommended'],

  // Main configuration
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Custom rules can be added here
      'no-console': 'warn',
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
      
      // Vue-specific rules
      'vue/multi-word-component-names': 'warn',
      'vue/component-api-style': ['error', ['script-setup', 'composition']],
      'vue/define-macros-order': ['error', {
        order: ['defineOptions', 'defineProps', 'defineEmits', 'defineSlots'],
      }],
      
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },

  // Disable formatting rules that conflict with Prettier
  eslintConfigPrettier,
);
