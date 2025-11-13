// @ts-check
import eslint from '@eslint/js';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default typescriptEslint.config(
  // Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', '*.d.ts', 'coverage/**'],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript ESLint recommended rules
  ...typescriptEslint.configs.recommended,

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
        parser: typescriptEslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
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
