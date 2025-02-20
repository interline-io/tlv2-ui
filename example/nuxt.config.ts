const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
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
    proxyBase: '',
    allowedReferer: '',
    graphqlApikey: '',
    public: {
      apiBase: '',
      protomapsApikey: '',
      nearmapsApikey: '',
      auth0Domain: '',
      auth0ClientId: '',
      auth0RedirectUri: '',
      auth0Audience: '',
      auth0Scope: '',
      loginGate: ''
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
        'mixpanel-browser'
      ]
    }
  },

  compatibilityDate: '2025-02-11'
})