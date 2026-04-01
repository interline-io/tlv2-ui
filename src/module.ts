import { defineNuxtModule, addPlugin, createResolver, addImportsDir, addServerHandler, addVitePlugin, addComponentsDir, installModule } from '@nuxt/kit'
import { defu } from 'defu'
import type { Tlv2RouteKey } from './runtime/route-keys'

// Config handler
export interface ModuleOptions {
  // Bulma config
  bulma: string
  // Link sources
  safelinkUtmSource?: string
  // Route resolver
  routes?: Partial<Record<Tlv2RouteKey, string>>
  // Proxy options
  proxyBase?: string
  // Login gate
  loginGate?: boolean
  requireLogin?: boolean
  // Api keys
  protomapsApikey?: string
  nearmapsApikey?: string
  mixpanelApikey?: string
  // Transfer Analyst options
  transferAnalystReadOnlyFeedSelector?: boolean
  transferAnalystGtfsRealtimeStopObservations?: boolean
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
  defaults: {
    bulma: '',
    loginGate: false,
    requireLogin: false,
    safelinkUtmSource: undefined,
    proxyBase: undefined,
    protomapsApikey: undefined,
    nearmapsApikey: undefined,
    transferAnalystReadOnlyFeedSelector: false,
    transferAnalystGtfsRealtimeStopObservations: true
  },
  async setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const resolver = createResolver(import.meta.url)
    const resolveRuntimeModule = (path: string) => resolver.resolve('./runtime', path)

    // CSRF protection (required for all requests, including unauthenticated)
    await installModule('nuxt-csurf', { addCsrfTokenToEventCtx: true })

    // Auth via auth0-nuxt (server-side sessions with HTTP-only cookies).
    // Always installed — it's inert without NUXT_AUTH0_* env vars.
    // Runtime plugins guard on config.auth0.clientId to skip auth when unconfigured.
    await installModule('@auth0/auth0-nuxt', {})
    const auth0ClientId = nuxt.options.runtimeConfig.auth0?.clientId

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
    const publicConfig: Record<string, any> = {
      safelinkUtmSource: options.safelinkUtmSource,
      protomapsApikey: options.protomapsApikey,
      nearmapsApikey: options.nearmapsApikey,
      mixpanelApikey: options.mixpanelApikey,
      loginGate: options.loginGate,
      requireLogin: options.requireLogin,
      routes: options.routes,
      transferAnalystReadOnlyFeedSelector: options.transferAnalystReadOnlyFeedSelector,
      transferAnalystGtfsRealtimeStopObservations: options.transferAnalystGtfsRealtimeStopObservations,
    }

    Object.assign(nuxt.options.runtimeConfig.public, defu(nuxt.options.runtimeConfig.public, {
      tlv2: publicConfig
    }))

    // Setup CSS
    nuxt.options.css.push(resolveRuntimeModule('assets/main.css'))
    nuxt.options.css.push('@mdi/font/css/materialdesignicons.css')
    nuxt.options.css.push('maplibre-gl/dist/maplibre-gl.css')

    // Setup plugins (run in order added — auth/CSRF must be before Apollo)
    addPlugin(resolveRuntimeModule('plugins/auth.server'))
    addPlugin(resolveRuntimeModule('plugins/csrf.client'))
    addPlugin(resolveRuntimeModule('plugins/apollo'))
    addPlugin(resolveRuntimeModule('plugins/mixpanel.client'))

    // Auth plugin (enriches user with roles from GraphQL)
    if (auth0ClientId) {
      addPlugin(resolveRuntimeModule('auth/plugin.client'))
    }

    addImportsDir(resolveRuntimeModule('composables'))

    // Session endpoint for ssr:false apps to fetch user claims client-side
    if (auth0ClientId) {
      addServerHandler({
        route: '/api/auth/session',
        method: 'get',
        handler: resolveRuntimeModule('server/api/auth/session.get')
      })
    }

    // Proxy — routes /api/proxy/{backend}/... to the configured proxyBase for that backend
    addServerHandler({
      route: '/api/proxy/**',
      handler: resolveRuntimeModule('plugins/proxy')
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
    addComponentsDir({
      path: resolveRuntimeModule('components'),
      pathPrefix: true,
      prefix: 'tl'
    })

    // Add controls (t-* components)
    addComponentsDir({
      path: resolveRuntimeModule('controls'),
      prefix: 't'
    })

    // Add apps (TlApps* components)
    addComponentsDir({
      path: resolveRuntimeModule('apps'),
      pathPrefix: true,
      prefix: 'TlApps'
    })

    // Nuxt 4: Transpile packages for SSR compatibility
    // These packages need transpilation because they:
    // - Ship as ESM but need to work in SSR/Node context
    // - Use modern JS features or TypeScript
    // - Contain Vue components or framework-specific code
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push(
      '@vue/apollo-composable', // Vue 3 Composition API wrapper - contains Vue reactivity code
      '@apollo/client', // GraphQL client with modern JS/TS - needs transpilation for SSR
      'markdown-it', // Markdown parser - ESM package used in SSR
      'markdown-it-anchor', // Markdown-it plugin - must match parent's transpilation
    )

    // Add Vite plugin - Nuxt 4 pattern
    addVitePlugin(() => ({
      name: 'tlv2-ui:vite-config',
      // Note: optimizeDeps.include was removed because it caused resolution errors
      // under pnpm's strict node_modules layout. Vite 7 handles dependency discovery
      // automatically. shamefully-hoist=true in .npmrc is needed for this repo's
      // dev/playground setup only — consumers of the published module are not affected.
      config (config) {
        // Fix for local development with symlinks (pnpm link, --stub mode)
        // https://github.com/nuxt/nuxt/issues/20001
        // Without this, Vite fails to resolve module files when using symlinked dependencies
        config.resolve = config.resolve || {}
        config.resolve.preserveSymlinks = true
        // Ensure Apollo packages resolve to a single instance in production builds.
        // Without this, the Apollo plugin (from tlv2-ui) and consumer useQuery calls
        // can reference different module instances, causing "client not found" errors.
        config.resolve.dedupe = config.resolve.dedupe || []
        if (Array.isArray(config.resolve.dedupe)) {
          config.resolve.dedupe.push(
            '@vue/apollo-composable',
            '@apollo/client',
            'graphql',
          )
        }
      }
    }))
  }
})
