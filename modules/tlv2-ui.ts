import { fileURLToPath } from 'node:url'
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'tlv2-ui',
    configKey: 'tlv2-ui',
    compatibility: {
      nuxt: '^3.4.0'
    }
  },
  defaults: {
    bulma: false
  },
  setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)
    if (options.bulma) {
      nuxt.options.css.push(options.bulma)
    } else {
      nuxt.options.css.push(resolve('../src/assets/bulma.scss'))
    }
    addPlugin(resolve('../src/plugins/auth'))
    addPlugin(resolve('../src/plugins/apollo'))
    addPlugin(resolve('../src/plugins/oruga'))
    addPlugin(resolve('../src/plugins/filters'))
    nuxt.options.css.push(resolve('../src/assets/main.css'))
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
