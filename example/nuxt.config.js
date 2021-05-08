export default {
    ssr: false,
    components: true,
    storybook: {
        stories: [
            '~/src/components/**/*.stories.js',
        ]
    },
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