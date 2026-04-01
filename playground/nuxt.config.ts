import 'dotenv/config'

export default defineNuxtConfig({
  modules: [['../src/module', {}]],

  ssr: false,

  devtools: { enabled: true },

  runtimeConfig: {
    // Auth0 server-side config (use NUXT_AUTH0_* env vars)
    auth0: {
      domain: '',
      clientId: '',
      clientSecret: '',
      sessionSecret: '',
      appBaseUrl: '',
      audience: '',
    },
    tlv2: {
      graphqlApikey: '',
      proxyBase: {
        default: '',
        feedManagement: '',
      },
    },
    public: {
      tlv2: {
        loginGate: true,
        requireLogin: false,
        routes: {
          'apps-admin-groups': 'admin-groups',
          'apps-admin-groups-groupKey': 'admin-groups-groupKey',
          'apps-admin-tenants': 'admin-tenants',
          'apps-admin-tenants-tenantKey': 'admin-tenants-tenantKey',
        },
      },
    },
  },

  compatibilityDate: '2024-11-01',

  typescript: {
    strict: true,
    typeCheck: true,
    tsConfig: {
      vueCompilerOptions: {
        strictTemplates: true
      }
    }
  },
})
