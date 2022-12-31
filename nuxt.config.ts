// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  srcDir: 'app',
  plugins: [{ src: 'plugins/oruga.js' }, { src: 'plugins/apollo.js' }],
  components: [{
    path: '~/../src/components',
    prefix: 'tl'
  },
  {
    path: '~/../src/components/b',
    prefix: 'b'
  }],
})
