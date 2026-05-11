import 'dotenv/config'

export default defineNuxtConfig({
  modules: [['../src/module', { useProxy: true }]],

  ssr: false,

  devtools: { enabled: true },

  runtimeConfig: {
    tlv2: {
      graphqlApikey: '',
      proxyBase: {
        default: '',
        feedManagement: '',
      },
    },
    public: {
      tlv2: {
        useProxy: true,
        apiBase: {
          default: '',
          feedManagement: '',
        },
        auth0Domain: '',
        auth0ClientId: '',
        auth0Audience: '',
        auth0Scope: 'profile email openid',
        auth0RedirectUri: '',
        loginGate: true,
        requireLogin: true,
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
