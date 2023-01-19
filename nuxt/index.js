import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)
    addPlugin(resolve('../plugins/css.js'))
    addPlugin(resolve('../plugins/oruga.js'))
    addPlugin(resolve('../plugins/filters.js'))
  },
  hooks: {
    'components:dirs'(dirs) {
      // Add ./components dir to the list
      dirs.push({
        // global: true,
        path: fileURLToPath(new URL('../src/components', import.meta.url)),
        prefix: 'tl'
      })
    }
  }
})