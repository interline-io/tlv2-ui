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
      nuxt.options.css.push(resolve('assets/bulma.scss'))
    }
    addPlugin(resolve('~/plugins/auth.ts'))
    addPlugin(resolve('~/plugins/apollo.ts'))
    addPlugin(resolve('~/plugins/oruga.ts'))
    addPlugin(resolve('~/plugins/filters.ts'))
    nuxt.options.css.push(resolve('assets/main.css'))
    addImportsDir(resolve('composables'))

    // Add assets
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.publicAssets ||= []
      nitroConfig.publicAssets.push({
        dir: resolve('public'),
        maxAge: 60 * 60 * 24 * 365 // 1 year
      })
    })

    // Add components
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: fileURLToPath(new URL('components', import.meta.url)),
        prefix: 'tl'
      })
    })
  }
})
