// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBase = 'https://transit.land/api/v2'

const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  ssr: true,
  modules: ['./modules/tlv2-ui'],
  runtimeConfig: {
    apiBase,
    ssrGraphqlEndpoint: apiBase + '/query',
    ssrGraphqlApikey: '',
    ssrGraphqlServerReferer: '',
    public: {
      apiBase,
      graphqlEndpoint: '/proxy/query',
      graphqlApikey: '',
      tileEndpoint: '//proxy/tiles',
      tileApikey: '',
      protomapsApikey: ''
    }
  },
  build: {
    transpile: [
      '@vue/apollo-composable',
      '@apollo/client',
      'protomaps-themes-base'
    ]
  },
  vite: {
    // bug https://github.com/apollographql/apollo-client/issues/9756
    define: {
      __DEV__: isDev.toString()
    }
  }
})
