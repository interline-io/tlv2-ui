import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)
    if (options.bulma) {
      nuxt.options.css.push(options.bulma)
    } else {
      nuxt.options.css.push(resolve('../src/assets/bulma.scss'))
    }
    addPlugin(resolve('../src/plugins/apollo.ts'))
    addPlugin(resolve('../src/plugins/oruga.ts'))
    addPlugin(resolve('../src/plugins/filters.ts'))
    nuxt.options.css.push(resolve('../src/assets/main.css'))
  },
  hooks: {
    'components:dirs' (dirs) {
      // Add ../src/components dir to the list
      dirs.push({
        // global: true,
        path: fileURLToPath(new URL('../src/components', import.meta.url)),
        prefix: 'tl'
      })
    }
  }
})
