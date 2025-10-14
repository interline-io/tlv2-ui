import { defineNuxtPlugin } from 'nuxt/app'
import {
  capitalize,
  formatDate,
  formatDateTime,
  formatDuration,
  formatHMS,
  fromNow,
  fromNowDate,
  joinUnique,
  makePathKey,
  makeRouteLink,
  makeStopLink,
  nameSort,
  parseHMS,
  pct,
  prettyBytes,
  reformatHMS,
  round,
  routeTypeToWords,
  shortenName,
  thousands
} from '../lib/filters'
import {
  sanitizeUrl,
  sanitizeFilename
} from '../lib/sanitize'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.globalProperties.$filters = {
    capitalize,
    formatDate,
    formatDateTime,
    formatDuration,
    formatHMS,
    fromNow,
    fromNowDate,
    joinUnique,
    nameSort,
    parseHMS,
    pct,
    prettyBytes,
    reformatHMS,
    round,
    routeTypeToWords,
    sanitizeFilename,
    sanitizeUrl,
    shortenName,
    thousands,
    makeRouteLink,
    makeStopLink
  }
})
