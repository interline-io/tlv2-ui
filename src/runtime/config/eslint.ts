// eslint.config.js
import stylistic, { StylisticCustomizeOptions } from '@stylistic/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'
import typescriptEslint from 'typescript-eslint'

export const eslintRules = {
  'no-console': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  'vue/multi-word-component-names': 'off',
  'vue/max-attributes-per-line': ['error', {
    singleline: {
      max: 10
    },
    multiline: {
      max: 1
    }
  }],
  '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
  '@stylistic/space-before-function-paren': ['error', {
    anonymous: 'always',
    named: 'always',
    asyncArrow: 'always'
  }],
  '@stylistic/comma-dangle': 'off',
  '@stylistic/max-statements-per-line': ['error', { max: 3 }],
}

export const stylisticConfig = {
  flat: true, // required for flat config
  indent: 2,
  quotes: 'single',
  semi: false,
}

export const eslintConfig = [
  {
    ignores: ['.nuxt/**', '**/.nuxt', '.output/**', 'dist/**', 'node_modules/**', '.yarn/**']
  },
  ...pluginVue.configs['flat/recommended'],
  stylistic.configs.customize(stylisticConfig as StylisticCustomizeOptions),
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
