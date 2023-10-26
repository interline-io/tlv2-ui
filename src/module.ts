import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, addImportsDir, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'tlv2-ui',
    configKey: 'tlv2-ui',
    compatibility: {
      nuxt: '^3.4.0'
    }
  },
  defaults: {
    bulma: ''
  },
  setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)
    if (options.bulma) {
      nuxt.options.css.push(options.bulma)
    } else {
      nuxt.options.css.push(resolve('../src/assets/bulma.scss'))
    }
    addPlugin(resolve('../src/plugins/auth.ts'))
    addPlugin(resolve('../src/plugins/apollo.ts'))
    addPlugin(resolve('../src/plugins/oruga.ts'))
    addPlugin(resolve('../src/plugins/filters.ts'))
    nuxt.options.css.push(resolve('../src/assets/main.css'))
    addImportsDir(resolve('../src/composables'))
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
