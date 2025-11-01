const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  compatibilityVersion: 4,
  
  ssr: false,

  modules: [
    '@nuxt/eslint',
    '../src/module',
    '@nuxt/devtools'
  ],

  devtools: {
    enabled: isDev
  },

  tlv2: {
    useProxy: true
  },

  runtimeConfig: {
    transitlandProxyBase: '',
    graphqlApikey: '',
    public: {
      transitlandApiBase: '',
      protomapsApikey: '',
      nearmapsApikey: '',
      auth0Domain: '',
      auth0ClientId: '',
      auth0RedirectUri: '',
      auth0Audience: '',
      auth0Scope: '',
      loginGate: '',
      requireLogin: ''
    }
  },

  // Note: Nuxt 4 has better automatic transpilation, but keeping these for compatibility
  build: {
    transpile: [
      '@vue/apollo-composable',
      '@apollo/client',
      'protomaps-themes-base'
    ]
  },

  vite: {
    // https://github.com/nuxt/nuxt/issues/20001
    resolve: {
      preserveSymlinks: true
    },
    // bug https://github.com/apollographql/apollo-client/issues/9756
    define: {
      __DEV__: isDev.toString()
    },
    // bug https://github.com/nuxt/nuxt/issues/13247
    optimizeDeps: {
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
      ],
      build: {
        commonjsOptions: {
          transformMixedEsModules: true // helps with mixed ESM/CJS dependencies
        }
      }
    }
  },

  compatibilityDate: '2025-02-11'
})
