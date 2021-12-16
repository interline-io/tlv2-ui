export default {
  ssr: false,
  srcDir: 'app',
  components: [{
    path: '~/../src/components',
    prefix: 'tl'
  }],
  server: {
    port: 3000, // default: 3000
    host: '0.0.0.0', // default: localhost,
    timing: false
  },
  head: {
    titleTemplate: 'Transitland'
  },
  publicRuntimeConfig: {
    graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || 'https://transit.land/api/v2/query',
    graphqlApikey: process.env.GRAPHQL_APIKEY || '',
    graphqlServerReferer: process.env.GRAPHQL_SERVER_REFERER || '',
    tileEndpoint: process.env.TILE_ENDPOINT || 'https://transit.land/api/v2/tiles',
    tileApikey: process.env.TILE_APIKEY || ''
  },
  /*
    ** Nuxt.js dev-modules
    */
  buildModules: [
    '@nuxt/components'
  ],
  /*
    ** Nuxt.js modules
    */
  modules: [
    // Doc: https://buefy.github.io/#/documentation
    'nuxt-buefy',
    // https://github.com/nuxt-community/apollo-module
    '@nuxtjs/apollo'
  ],
  /* APOLLO */
  apollo: {
    clientConfigs: {
      default: '~/apollo.js',
      transitland: '~/apollo.js',
      authenticated: {
        httpEndpoint: 'https://api.transit.land/api/v2/query',
        httpLinkOptions: {
          credentials: 'same-origin'
        }
      }
    },
    authenticationType: '',
    tokenName: 'auth._token.auth0'
  }
}
