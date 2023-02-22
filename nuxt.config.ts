// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBase =
  process.env.TRANSITLAND_API_BASE || 'https://transit.land/api/v2'

const isDev = process.env.NODE_ENV === "development";

export default defineNuxtConfig({
  ssr: true,
  modules: [
    './modules/tlv2-ui'
  ],
  build: {
    transpile: ["@vue/apollo-composable", "@apollo/client"],
  },
  vite: {
    // bug https://github.com/apollographql/apollo-client/issues/9756
    define: {
      __DEV__: isDev.toString(),
    }
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
