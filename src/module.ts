import { defineNuxtModule, addPlugin, addImportsDir, createResolver, addServerHandler, installModule } from '@nuxt/kit'
import { defu } from 'defu'
import { type Auth0Options } from './runtime/lib/auth0'

// Config handler
export interface ModuleOptions extends Auth0Options {
  bulma: string
  useProxy: boolean
  safelinkUtmSource?: string
  apiBase?: string
  protomapsApikey?: string
  nearmapsApikey?: string
  loginGate?: boolean
  requireLogin?: boolean
  editorRoutePrefix?: string
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
    const useProxy = options.useProxy ? true : false

    // Private runtime options
    nuxt.options.runtimeConfig.tlv2 = defu(nuxt.options.runtimeConfig.tlv2, {
      proxyBase: '',
      graphqlApikey: '',
    })

    // Public runtime options (available on both server and client)
    nuxt.options.runtimeConfig.public.tlv2 = defu(nuxt.options.runtimeConfig.public.tlv2, {
      useProxy: useProxy,
      safelinkUtmSource: options.safelinkUtmSource,
      apiBase: options.apiBase,
      protomapsApikey: options.protomapsApikey,
      nearmapsApikey: options.nearmapsApikey,
      loginGate: options.loginGate,
      requireLogin: options.requireLogin,
      editorRoutePrefix: options.editorRoutePrefix || 'editor',
      auth0Domain: options.auth0Domain,
      auth0ClientId: options.auth0ClientId,
      auth0RedirectUri: options.auth0RedirectUri,
      auth0Audience: options.auth0Audience,
      auth0Scope: options.auth0Scope,
    })

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

    // Setup plugins... not sure why they seem to run in reverse order?
    addPlugin(resolveRuntimeModule('plugins/apollo'))
    addPlugin(resolveRuntimeModule('plugins/mixpanel.client'))
    addPlugin(resolveRuntimeModule('plugins/auth.client'))
    addPlugin(resolveRuntimeModule('plugins/oruga'))
    addPlugin(resolveRuntimeModule('plugins/filters'))
    addImportsDir(resolveRuntimeModule('composables'))

    // Proxy options
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
          '@mapbox/mapbox-gl-draw',
          '@observablehq/plot',
          'cytoscape-fcose',
          'cytoscape',
          'fast-json-stable-stringify',
          'haversine',
          'maplibre-gl',
          'mixpanel-browser',
          'zen-observable',
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
