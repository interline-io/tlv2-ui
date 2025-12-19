export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  css: ['~/assets/main.scss'],

  compatibilityDate: '2024-11-01',

  typescript: {
    strict: true,
    typeCheck: true,
    tsConfig: {
      vueCompilerOptions: {
        strictTemplates: true
      }
    }
  },
})
