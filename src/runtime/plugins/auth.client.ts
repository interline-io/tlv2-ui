import { defineNuxtPlugin } from 'nuxt/app'
import { defineAuthPlugin } from '../auth/auth'
export default defineNuxtPlugin(defineAuthPlugin)
