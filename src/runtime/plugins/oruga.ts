import { defineNuxtPlugin } from 'nuxt/app'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import '@mdi/font/css/materialdesignicons.min.css'
// @ts-expect-error - No type definitions available for this module
import Oruga from '@oruga-ui/oruga-next/dist/oruga.mjs'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Oruga, bulmaConfig)
})
