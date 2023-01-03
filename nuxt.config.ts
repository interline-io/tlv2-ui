// https://nuxt.com/docs/api/configuration/nuxt-config
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
      graphqlEndpoint: process.env.GRAPHQL_ENDPOINT,
      graphqlApikey: process.env.GRAPHQL_APIKEY,
    }
  },
  css: [
    '~/assets/main.scss',
  ]
})
