export default defineNuxtConfig({

  modules: ['../src/module'],

  ssr: false,

  // Ensure auto-imports are enabled (default in Nuxt 4)
  imports: {
    autoImport: true
  },

  devtools: {
    enabled: true
  },

  runtimeConfig: {
    tlv2: {
      graphqlApikey: '',
      proxyBase: {
        default: '',
        stationEditor: '',
        feedManagement: ''
      },
    },
    public: {
      tlv2: {
        useProxy: true,
        apiBase: {
          default: '',
          stationEditor: '',
          feedManagement: '',
        },
        protomapsApikey: '',
        nearmapsApikey: '',
        safelinkUtmSource: '',
        editorRoutePrefix: 'editor',
        loginGate: false,
        requireLogin: false,
        auth0Domain: '',
        auth0ClientId: '',
        auth0Audience: '',
        auth0Scope: '',
        auth0RedirectUri: '',
        auth0LogoutUri: ''
      }
    }
  },
  compatibilityDate: '2025-11-01',

  tlv2: {
    useProxy: true
  },
})
