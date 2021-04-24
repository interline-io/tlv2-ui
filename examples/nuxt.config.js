export default {
  ssr: false,
  components: true, 
  buildModules: [
    'nuxt-buefy',
    '@nuxtjs/apollo',
    'tlv2-ui/nuxt'
  ],
  /* APOLLO */
  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: 'https://api.transit.land/api/v2/query'
      }
    }
  }
}