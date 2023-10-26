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
    const resolveRuntimeModule = (path: string) => resolve('./runtime', path)

    if (options.bulma) {
      nuxt.options.css.push(options.bulma)
    } else {
      nuxt.options.css.push(resolveRuntimeModule('assets/bulma.scss'))
    }
    addPlugin(resolveRuntimeModule('plugins/auth'))
    addPlugin(resolveRuntimeModule('plugins/apollo'))
    addPlugin(resolveRuntimeModule('plugins/oruga'))
    addPlugin(resolveRuntimeModule('plugins/filters'))
    nuxt.options.css.push(resolveRuntimeModule('assets/main.css'))
    addImportsDir(resolveRuntimeModule('composables'))

    // Add assets
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.publicAssets ||= []
      nitroConfig.publicAssets.push({
        dir: resolveRuntimeModule('public'),
        maxAge: 60 * 60 * 24 * 365 // 1 year
      })
    })

    // Add components
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        path: resolveRuntimeModule('components'),
        prefix: 'tl'
      })
    })
  }
})
