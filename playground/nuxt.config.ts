const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '../src/module',
    '@nuxt/devtools'
  ],
  ssr: false,

  devtools: {
    enabled: isDev
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

  // bugs
  build: {
    transpile: [
      'tslib', // https://github.com/nuxt/nuxt/issues/19265#issuecomment-1702014262
      '@vue/apollo-composable',
      '@apollo/client',
      'protomaps-themes-base'
    ]
  },

  compatibilityDate: '2025-02-11',

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

  tlv2: {
    useProxy: true
  },
})
