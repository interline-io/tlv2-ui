// eslint.config.js
import stylistic from '@stylistic/eslint-plugin'
import pluginVue from 'eslint-plugin-vue'
import typescriptEslint from 'typescript-eslint'

export default [
  ...pluginVue.configs['flat/recommended'],
  stylistic.configs.customize({
    flat: true, // required for flat config
    // the following options are the default values
    indent: 2,
    quotes: 'single',
    semi: false,
    // ...
  }),
  {
    languageOptions: {
      parserOptions: {
        parser: typescriptEslint.parser,
      },
    },
    rules: {
      'no-console': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': ['error', {
        singleline: {
          max: 10
        },
        multiline: {
          max: 1
        }
      }],
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'always',
        asyncArrow: 'always'
      }],
      '@stylistic/comma-dangle': 'off',
      '@stylistic/max-statements-per-line': ['error', { max: 3 }],
    },
  },
  // ...your other config items
]
