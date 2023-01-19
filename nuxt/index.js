import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.css.push('~/src/assets/main.css')
    if (options.bulma) {
      nuxt.options.css.push(options.bulma)
    } else {
      nuxt.options.css.push('~/src/assets/bulma.scss')
    }
    addPlugin(resolve('../src/plugins/apollo.js'))
    addPlugin(resolve('../src/plugins/oruga.js'))
    addPlugin(resolve('../src/plugins/filters.js'))
  },
  hooks: {
    'components:dirs'(dirs) {
      // Add ../src/components dir to the list
      dirs.push({
        // global: true,
        path: fileURLToPath(new URL('../src/components', import.meta.url)),
        prefix: 'tl'
      })
    }
  }
})