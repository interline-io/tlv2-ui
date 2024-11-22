import {
  nameSort,
  fromNowDate,
  fromNow,
  reformatHM,
  reformatHMS,
  parseHMS,
  formatHM,
  formatHMS,
  shortenName,
  formatDate,
  joinUnique,
  round,
  thousands,
  pct,
  capitalize,
  prettyBytes,
  routeTypeToWords,
  makePathKey
} from './filters-fn'
import {
  sanitizeUrl,
  sanitizeFilename
} from './sanitize'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.globalProperties.$filters = {
    nameSort,
    sanitizeUrl,
    sanitizeFilename,
    fromNowDate,
    fromNow,
    reformatHM,
    reformatHMS,
    parseHMS,
    formatHM,
    formatHMS,
    shortenName,
    formatDate,
    joinUnique,
    round,
    thousands,
    pct,
    capitalize,
    prettyBytes,
    routeTypeToWords,
    makeRouteLink(onestopId:string, feedId:string, sha1:string, entityId:string, id:number, linkVer: boolean) {
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
    makeStopLink(onestopId:string, feedId:string, sha1:string, entityId:string, id:number, linkVer: boolean) {
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
