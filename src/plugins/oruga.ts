import { defineNuxtPlugin } from "#app";

import { bulmaConfig } from '@oruga-ui/theme-bulma'
import '@mdi/font/css/materialdesignicons.min.css'

// sigh
// import Oruga from '@oruga-ui/oruga-next'
import Oruga from "@oruga-ui/oruga-next/dist/oruga.mjs";

import '@oruga-ui/oruga-next/dist/oruga.css'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Oruga, bulmaConfig)
})
