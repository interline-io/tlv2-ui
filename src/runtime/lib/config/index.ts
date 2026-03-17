import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin'
import type { Linter } from 'eslint'

export const ignoreFiles = {
  ignores: [
    '.nuxt/**',
    '.output/**',
    '**/.nuxt',
    'dist/**',
    'node_modules/**',
  ],
}

export const eslintTypescriptRules: Linter.RulesRecord = {
  'no-console': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/unified-signatures': 'off',
}

export const eslintStylisticRules: Linter.RulesRecord = {
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

export const stylisticConfig = {
  flat: true, // required for flat config
  indent: 2,
  quotes: 'single',
  semi: false,
} as any as StylisticCustomizeOptions
