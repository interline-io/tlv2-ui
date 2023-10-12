// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBase =
  process.env.TRANSITLAND_API_BASE || 'https://transit.land/api/v2'

const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  ssr: true,
  modules: [
    './modules/tlv2-ui'
  ],
  build: {
    transpile: ['@vue/apollo-composable', '@apollo/client', 'protomaps-themes-base']
  },
  vite: {
    // bug https://github.com/apollographql/apollo-client/issues/9756
    define: {
      __DEV__: isDev.toString()
    }
  },
  runtimeConfig: {
    public: {
      apiBase,
      graphqlEndpoint: apiBase + '/query',
      graphqlApikey: '',
      graphqlServerReferer: '',
      tileEndpoint: apiBase + '/tiles',
      tileApikey: '',
      protomapsApikey: '',
      //
      auth0Domain: '',
      auth0ClientId: '',
      auth0RedirectUri: '',
      auth0Audience: '',
      auth0Scope: ''
    }
  }
})
