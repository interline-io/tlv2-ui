import '@mdi/font/css/materialdesignicons.min.css'

// sigh
import Oruga from '@oruga-ui/oruga-next'
import '@oruga-ui/theme-oruga/dist/oruga.css'

import { bulmaConfig } from '@oruga-ui/theme-bulma'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Oruga, bulmaConfig)
})
