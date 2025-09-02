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
    makeRouteLink (onestopId: string, feedId: string, sha1: string, entityId: string, id: number, linkVer: boolean) {
      if (linkVer && onestopId) {
        return {
          name: 'routes-routeKey',
          params: { routeKey: onestopId },
          query: {
            feedOnestopId: feedId,
            feedVersionSha1: sha1,
            entityId
          }
        }
      }
      return {
        name: 'routes-routeKey',
        params: { routeKey: makePathKey(onestopId, feedId, sha1, entityId, id, linkVer) }
      }
    },
    makeStopLink (onestopId: string, feedId: string, sha1: string, entityId: string, id: number, linkVer: boolean) {
      if (linkVer && onestopId) {
        return {
          name: 'stops-stopKey',
          params: { stopKey: onestopId },
          query: {
            feedOnestopId: feedId,
            feedVersionSha1: sha1
          }
        }
      }
      return {
        name: 'stops-stopKey',
        params: { stopKey: makePathKey(onestopId, feedId, sha1, entityId, id, linkVer) }
      }
    }
  }
})
