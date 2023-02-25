// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBase = 'https://transit.land/api/v2'

const isDev = process.env.NODE_ENV === "development";

console.log("process.env:", process.env)

export default defineNuxtConfig({
  ssr: true,
  modules: [
    './modules/tlv2-ui'
  ],
  runtimeConfig: {
    ssrGraphqlEndpoint: apiBase + "/query",
    ssrGraphqlApikey: '',
    ssrGraphqlServerReferer: '',
    public: {
      apiBase,
      graphqlEndpoint: "/proxy/query",
      graphqlApikey: '',
      tileEndpoint: "/proxy/tiles",
      tileApikey: '',
      protoMapsApiKey: ''
    },
  },
  build: {
    transpile: ["@vue/apollo-composable", "@apollo/client"],
  },
  vite: {
    // bug https://github.com/apollographql/apollo-client/issues/9756
    define: {
      __DEV__: isDev.toString(),
    }
  }
})
