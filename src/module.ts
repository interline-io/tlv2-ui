import { defineNuxtModule, addPlugin, createResolver, addImportsDir, addServerHandler } from '@nuxt/kit'
import { defu } from 'defu'

// Config handler
export interface ModuleOptions {
  // Bulma config
  bulma: string
  // Link sources
  safelinkUtmSource?: string
  // Route prefixes
  editorRoutePrefix?: string
  // Proxy options
  useProxy: boolean
  proxyBase?: string
  apiBase?: string
  // Login gate
  loginGate?: boolean
  requireLogin?: boolean
  // Api keys
  protomapsApikey?: string
  nearmapsApikey?: string
  mixpanelApikey?: string
  // Auth0
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
    version: '0.3.0',
    configKey: 'tlv2',
    compatibility: {
      nuxt: '^4.0.0'
    }
  },
  moduleDependencies: {
    'nuxt-csurf': {
      defaults: {
        addCsrfTokenToEventCtx: true
      }
    }
  },
  defaults: {
    bulma: '',
    useProxy: false,
    editorRoutePrefix: 'editor',
    loginGate: false,
    requireLogin: false,
    safelinkUtmSource: undefined,
    proxyBase: undefined,
    apiBase: undefined,
    protomapsApikey: undefined,
    nearmapsApikey: undefined,
    auth0ClientId: undefined,
    auth0Domain: undefined,
    auth0Audience: undefined,
    auth0Scope: undefined,
    auth0RedirectUri: undefined,
    auth0LogoutUri: undefined
  },
  async setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const resolver = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolver.resolve('./runtime', path)

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
        mixpanelApikey: options.mixpanelApikey,
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

    // Setup CSS
    nuxt.options.css.push(options.bulma || resolveRuntimeModule('assets/bulma.scss'))
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

    // Nuxt 4: Transpile packages for SSR compatibility
    // These packages need transpilation because they:
    // - Ship as ESM but need to work in SSR/Node context
    // - Use modern JS features or TypeScript
    // - Contain Vue components or framework-specific code
    nuxt.options.build.transpile.push(
      'tlv2-ui', // This module itself - ensures it works when npm installed
      '@vue/apollo-composable', // Vue 3 Composition API wrapper - contains Vue reactivity code
      '@apollo/client', // GraphQL client with modern JS/TS - needs transpilation for SSR
      'protomaps-themes-base', // ESM map themes - needed for server-side map rendering
      'markdown-it', // Markdown parser - ESM package used in SSR
      'markdown-it-anchor', // Markdown-it plugin - must match parent's transpilation
      'interval-tree-1d' // CJS/ESM hybrid needed by @observablehq/plot in SSR context
    )

    // Add Vite configuration - Nuxt 4 pattern
    nuxt.hook('vite:extendConfig', (viteConfig) => {
      // Fix for local development with symlinks (yarn/npm link, --stub mode)
      // https://github.com/nuxt/nuxt/issues/20001
      // Without this, Vite fails to resolve module files when using symlinked dependencies
      viteConfig.resolve!.preserveSymlinks = true

      // Vite optimizeDeps pre-bundles dependencies for faster dev server
      // Include packages that:
      // - Have many internal modules (reduces waterfall requests)
      // - Are CommonJS and need ESM conversion for browser
      // - Cause slow cold starts or discovery issues
      viteConfig.optimizeDeps!.include = viteConfig.optimizeDeps!.include || []
      viteConfig.optimizeDeps!.include.push(
        '@mapbox/mapbox-gl-draw', // Large library with 100+ modules - pre-bundle to avoid request waterfall
        '@observablehq/plot', // Complex plotting library with many internal imports
        'cytoscape-fcose', // Graph layout algorithm - improves cold start performance
        'cytoscape', // Core graph library with numerous sub-modules
        'fast-json-stable-stringify', // Small utility but frequently imported - bundle once
        'haversine', // Geo calculation utility - pre-bundle for consistent imports
        'maplibre-gl', // Large mapping library - dramatically speeds up dev cold starts
        'mixpanel-browser', // Analytics SDK with dynamic imports - needs pre-bundling
        'zen-observable', // Observable polyfill used by Apollo - avoid re-discovery
        'interval-tree-1d' // CommonJS package needs conversion to ESM for browser compatibility
      )
    })
  }
})
