import '@mdi/font/css/materialdesignicons.min.css'

import { Oruga } from '@oruga-ui/oruga-next'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import '@oruga-ui/theme-bulma/dist/bulma.css'

import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Oruga, bulmaConfig)
})
