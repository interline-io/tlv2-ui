// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBase = process.env.TRANSITLAND_API_BASE || 'https://transit.land/api/v2'

export default defineNuxtConfig({
  ssr: false,
  srcDir: 'app',
  plugins: [
    { src: 'plugins/oruga.js' },
    { src: 'plugins/apollo.js' },
    { src: 'plugins/filters.js' }
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
      apiBase,
      graphqlEndpoint: process.env.GRAPHQL_ENDPOINT || apiBase + '/query',
      graphqlApikey: process.env.GRAPHQL_APIKEY,
      tileEndpoint: process.env.TILE_ENDPOINT || apiBase + '/tiles',
      tileApikey: process.env.TILE_APIKEY
    }
  },
  css: [
    '~/assets/main.css'
  ]
})
