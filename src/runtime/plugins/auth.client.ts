import { defineNuxtPlugin } from 'nuxt/app'
import { defineAuthPlugin } from '../auth/user'
export default defineNuxtPlugin(defineAuthPlugin)
