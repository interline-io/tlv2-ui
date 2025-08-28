import { defineNuxtModule, addPlugin, addImportsDir, createResolver, addServerHandler, installModule } from '@nuxt/kit'
import { defu } from 'defu'

// Config handler
export interface ModuleOptions {
  bulma: string
  useProxy: boolean
  safelinkUtmSource?: string
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

    // Setup nuxt-csurf
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

    // Proxy options
    const useProxy = options.useProxy ? true : false
    if (useProxy) {
      addServerHandler({
        route: '/api/v2/**',
        handler: resolveRuntimeModule('plugins/proxy')
      })
    }

    // Public runtime options (available on both server and client)
    nuxt.options.runtimeConfig.tlv2 = defu(nuxt.options.runtimeConfig.tlv2, {
      proxyBase: '',
      graphqlApikey: '',
    })

    // Public runtime options (available on both server and client)
    // TODO: move all config under public.tlv2
    nuxt.options.runtimeConfig.public = defu(nuxt.options.runtimeConfig.public, {
      apiBase: '',
      protomapsApikey: '',
      nearmapsApikey: '',
      auth0Domain: '',
      auth0ClientId: '',
      auth0RedirectUri: '',
      auth0Audience: '',
      auth0Scope: '',
      loginGate: '',
      tlv2: {
        useProxy: useProxy,
        safelinkUtmSource: options.safelinkUtmSource
      }
    })

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

    nuxt.options.build.transpile.push(
      'tslib', // https://github.com/nuxt/nuxt/issues/19265#issuecomment-1702014262
      'tlv2-ui',
      '@vue/apollo-composable',
      '@apollo/client',
      'protomaps-themes-base',
      'markdown-it',
      'markdown-it-anchor',
      'interval-tree-1d' // fix for SSR error with @observablehq/plot
    )

    // Add Vite configuration
    nuxt.hook('vite:extendConfig', (viteConfig, { isClient, isServer }) => {
      // https://github.com/nuxt/nuxt/issues/20001
      viteConfig.resolve = {
        ...viteConfig.resolve,
        preserveSymlinks: true
      }

      // bug https://github.com/apollographql/apollo-client/issues/9756
      viteConfig.define = {
        ...viteConfig.define,
        __DEV__: nuxt.options.dev.toString()
      }

      // bug https://github.com/nuxt/nuxt/issues/13247
      viteConfig.optimizeDeps = {
        ...viteConfig.optimizeDeps,
        include: [
          'zen-observable',
          'fast-json-stable-stringify',
          'maplibre-gl',
          'haversine',
          '@mapbox/mapbox-gl-draw',
          'cytoscape',
          'mixpanel-browser',
          '@observablehq/plot',
          'interval-tree-1d' // distributed as CJS, rather than ESM
        ]
      }

      // Add build options for mixed ESM/CJS dependencies
      viteConfig.build = {
        ...viteConfig.build,
        rollupOptions: {
          ...viteConfig.build?.rollupOptions
        }
      }

      // Add commonjs options for mixed ESM/CJS dependencies
      viteConfig.optimizeDeps = {
        ...viteConfig.optimizeDeps
      }

      // Add commonjs options at the Vite config level
      if (!viteConfig.define) {
        viteConfig.define = {}
      }
      viteConfig.define.__VITE_COMMONJS_OPTIONS__ = JSON.stringify({
        transformMixedEsModules: true
      })
    })
  }
})
