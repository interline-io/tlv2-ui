export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  compatibilityDate: '2024-11-01',

  tlv2: {
    bulma: '',
    useProxy: false,
    loginGate: false,
    requireLogin: false
  },
})
