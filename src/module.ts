import { defineNuxtModule, addPlugin, createResolver, addImportsDir, addServerHandler, installModule } from '@nuxt/kit'
import { defu } from 'defu'

// Config handler
export interface ModuleOptions {
  bulma: string
  useProxy: boolean
  safelinkUtmSource?: string
  proxyBase?: string
  apiBase?: string
  protomapsApikey?: string
  nearmapsApikey?: string
  loginGate?: boolean
  requireLogin?: boolean
  editorRoutePrefix?: string
  // auth0
  auth0ClientId?: string
  auth0Domain?: string
  auth0Audience?: string
  auth0Scope?: string
  auth0RedirectUri?: string
  auth0LogoutUri?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'tlv2-ui',
    configKey: 'tlv2',
    compatibility: {
      nuxt: '^4.0.0'
    }
  },
  defaults: {
    bulma: '',
    useProxy: false,
    editorRoutePrefix: 'editor',
    loginGate: false
  },
  async setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const resolver = createResolver(import.meta.url)
    const resolveRuntimeModule = resolver.resolve

    const useProxy = !!options.useProxy

    // Private runtime options (server-side only)
    // Nuxt 4 recommended pattern: merge at the nested key level
    Object.assign(nuxt.options.runtimeConfig, defu(nuxt.options.runtimeConfig, {
      tlv2: {
        graphqlApikey: '',
        proxyBase: {
          default: options.proxyBase,
          stationEditor: '',
          feedManagement: ''
        },
      }
    }))

    // Public runtime options (available on both server and client)
    // Nuxt 4 recommended pattern: merge at the nested key level
    Object.assign(nuxt.options.runtimeConfig.public, defu(nuxt.options.runtimeConfig.public, {
      tlv2: {
        useProxy: useProxy,
        safelinkUtmSource: options.safelinkUtmSource,
        apiBase: {
          default: options.apiBase,
          stationEditor: '',
          feedManagement: '',
        },
        protomapsApikey: options.protomapsApikey,
        nearmapsApikey: options.nearmapsApikey,
        loginGate: options.loginGate,
        requireLogin: options.requireLogin,
        editorRoutePrefix: options.editorRoutePrefix,
        auth0Domain: options.auth0Domain,
        auth0ClientId: options.auth0ClientId,
        auth0RedirectUri: options.auth0RedirectUri,
        auth0LogoutUri: options.auth0LogoutUri,
        auth0Audience: options.auth0Audience,
        auth0Scope: options.auth0Scope,
      }
    }))

    // Setup nuxt-csurf
    await installModule('nuxt-csurf', {
      addCsrfTokenToEventCtx: true,
    })

    // Setup CSS
    if (options.bulma) {
      nuxt.options.css.push(options.bulma)
    } else {
      nuxt.options.css.push(resolveRuntimeModule('assets/bulma.scss'))
    }
    nuxt.options.css.push(resolveRuntimeModule('assets/main.css'))

    // Setup plugins (run in order added)
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

    // Nuxt 4: Transpile packages that need it
    nuxt.options.build.transpile.push(
      'tlv2-ui',
      '@vue/apollo-composable',
      '@apollo/client',
      'protomaps-themes-base',
      'markdown-it',
      'markdown-it-anchor',
      'interval-tree-1d' // fix for SSR error with @observablehq/plot
    )

    // Add Vite configuration - Nuxt 4 pattern
    nuxt.hook('vite:extendConfig', (viteConfig) => {
      // https://github.com/nuxt/nuxt/issues/20001
      // Mutate nested properties directly (objects are already initialized)
      viteConfig.resolve!.preserveSymlinks = true

      // bug https://github.com/apollographql/apollo-client/issues/9756
      viteConfig.define!.__DEV__ = nuxt.options.dev.toString()

      // bug https://github.com/nuxt/nuxt/issues/13247
      // Extend optimizeDeps.include array for older packages
      viteConfig.optimizeDeps!.include = viteConfig.optimizeDeps!.include || []
      viteConfig.optimizeDeps!.include.push(
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
      )
    })
  }
})
