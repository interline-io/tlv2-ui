import { defineNuxtPlugin } from '#imports'
import { bulmaConfig } from '@oruga-ui/theme-bulma'
import '@mdi/font/css/materialdesignicons.min.css'

// sigh
// import Oruga from '@oruga-ui/oruga-next'
import Oruga from '@oruga-ui/oruga-next/dist/oruga.mjs'

// import '@oruga-ui/theme-bulma/dist/bulma.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Oruga, bulmaConfig)
})
