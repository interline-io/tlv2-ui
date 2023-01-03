// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  srcDir: 'app',
  plugins: [
    { src: 'plugins/oruga.js' },
    { src: 'plugins/apollo.js' },
    { src: 'plugins/filters.js' }
  ],
  modules: [



  ],
  components: [{
    path: '~/../src/components',
    prefix: 'tl'
  },
  {
    path: '~/../src/components/b',
    prefix: 'b'
  }],
  runtimeConfig: {
    public: {
      graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || 'https://transit.land/api/v2/query',
      graphqlApikey: process.env.GRAPHQL_APIKEY,
      tileEndpoint: process.env.TILE_ENDPOINT || 'https://transit.land/api/v2/tiles',
      tileApikey: process.env.TILE_APIKEY
    }
  },
  css: [
    '~/assets/main.scss',
  ]
})
