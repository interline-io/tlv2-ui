import { defineNuxtModule, addPlugin, addImportsDir, createResolver, addServerHandler } from '@nuxt/kit'

// Config handler
export interface ModuleOptions{
  bulma: string,
  useProxy: boolean,
  mixpanelApikey?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'tlv2-ui',
    configKey: 'tlv2',
    compatibility: {
      nuxt: '^3.4.0'
    }
  },
  setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolve('./runtime', path)

    // Setup CSS
    if (options.bulma) {
      nuxt.options.css.push(options.bulma)
    } else {
      nuxt.options.css.push(resolveRuntimeModule('assets/bulma.scss'))
    }
    nuxt.options.css.push(resolveRuntimeModule('assets/main.css'))

    // Setup plugins
    addPlugin(resolveRuntimeModule('plugins/auth'))
    addPlugin(resolveRuntimeModule('plugins/apollo'))
    addPlugin(resolveRuntimeModule('plugins/oruga'))
    addPlugin(resolveRuntimeModule('plugins/filters'))
    addPlugin(resolveRuntimeModule('plugins/mixpanel'))
    addImportsDir(resolveRuntimeModule('composables'))

    // Add Mixpanel config
    nuxt.options.runtimeConfig.public.mixpanelApikey = options.mixpanelApikey || ''

    // Proxy
    if (options.useProxy) {
      addServerHandler({
        route: '/api/v2/**',
        handler: resolveRuntimeModule('plugins/proxy')
      })
    }

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
