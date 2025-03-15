import { defineNuxtModule, addPlugin, addImportsDir, createResolver, addServerHandler, installModule } from '@nuxt/kit'
import { defu } from 'defu'

// Config handler
export interface ModuleOptions{
  bulma: string,
  useProxy: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'tlv2-ui',
    configKey: 'tlv2',
    compatibility: {
      nuxt: '^3.4.0'
    }
  },
  async setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const { resolve } = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolve('./runtime', path)

    // add nuxt-csurf
    await installModule('nuxt-csurf', {
      config: {
        addCsrfTokenToEventCtx: true,
      }
    })

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
    addPlugin(resolveRuntimeModule('plugins/mixpanel.client'))
    addImportsDir(resolveRuntimeModule('composables'))

    // Proxy
    const useProxy = options.useProxy ? true : false
    nuxt.options.runtimeConfig.public.tlv2 = defu(nuxt.options.runtimeConfig.public.tlv2, {
      useProxy: useProxy
    })
    if (useProxy) {
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
