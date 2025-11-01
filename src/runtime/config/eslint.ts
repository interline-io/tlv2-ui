// eslint.config.js
import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin'
import stylistic from '@stylistic/eslint-plugin'
import type { ResolvableFlatConfig } from 'eslint-flat-config-utils'
import { FlatConfigComposer } from 'eslint-flat-config-utils'
import pluginVue from 'eslint-plugin-vue'
import typescriptEslint from 'typescript-eslint'

export const ignoreFiles = {
  ignores: ['.nuxt/**', '**/.nuxt', '.output/**', 'dist/**', 'node_modules/**', '.yarn/**'],
}

export const eslintRules = {
  'no-console': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  'vue/multi-word-component-names': 'off',
  'vue/max-attributes-per-line': ['error', {
    singleline: {
      max: 10,
    },
    multiline: {
      max: 1,
    },
  }],
  '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  '@stylistic/space-before-function-paren': ['error', {
    anonymous: 'always',
    named: 'always',
    asyncArrow: 'always',
  }],
  '@stylistic/comma-dangle': 'off',
  '@stylistic/max-statements-per-line': ['error', { max: 3 }],
}

export const stylisticConfig: StylisticCustomizeOptions = {
  flat: true, // required for flat config
  indent: 2,
  quotes: 'single',
  semi: false,
}

export const eslintConfig: ResolvableFlatConfig = [
  ignoreFiles,
  ...pluginVue.configs['flat/recommended'],
  stylistic.configs.customize(stylisticConfig),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint.plugin,
    },
    rules: eslintRules,
  },
  {
    languageOptions: {
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: eslintRules,
  },
]
