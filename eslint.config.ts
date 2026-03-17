// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'
import { stylisticConfig, ignoreFiles, eslintStylisticRules, eslintTypescriptRules } from './src/runtime/lib/config'
// eslintRules

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: stylisticConfig,
    // Enable strict TypeScript rules
    typescript: {
      strict: true,
    },
  },
  dirs: {
    src: [
      './playground',
    ],
  },
})
  .prepend(
    // Explicitly ignore node_modules and build outputs
    ignoreFiles,
  )
  .append(
    // your custom flat config here...
    {
      rules: {
        ...eslintTypescriptRules,
        ...eslintStylisticRules,
      },
    },
  )
