import { defineNuxtPlugin } from 'nuxt/app'
import { defineApolloPlugin } from '../auth/apollo'

export default defineNuxtPlugin(defineApolloPlugin)
