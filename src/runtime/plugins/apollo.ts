import { defineNuxtPlugin } from 'nuxt/app'
import { defineApolloPlugin } from '../lib/apollo'
export default defineNuxtPlugin(defineApolloPlugin)
