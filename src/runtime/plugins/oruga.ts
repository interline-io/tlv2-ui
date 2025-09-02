import { defineNuxtPlugin } from '#imports'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import '@mdi/font/css/materialdesignicons.min.css'
import Oruga from '@oruga-ui/oruga-next/dist/oruga.mjs'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Oruga, bulmaConfig)
})
