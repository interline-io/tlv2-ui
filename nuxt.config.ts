// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBase =
  process.env.TRANSITLAND_API_BASE || 'https://transit.land/api/v2'

export default defineNuxtConfig({
  ssr: true,
  modules: [
    './nuxt',
    '@nuxtjs/apollo'
  ],
  apollo: {
    clients: {
      transitland: {
        httpEndpoint: 'https://transit.land/api/v2/query',
        httpLinkOptions: {
          headers: {
            apikey: process.env.GRAPHQL_APIKEY
          }
        }
      }
    },
  },
  runtimeConfig: {
    public: {
      apiBase,
      graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || apiBase + '/query',
      graphqlApikey: process.env.GRAPHQL_APIKEY,
      tileEndpoint: process.env.TILE_ENDPOINT || apiBase + '/tiles',
      tileApikey: process.env.TILE_APIKEY
    }
  }
})
