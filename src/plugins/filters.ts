import { defineNuxtPlugin } from '#app'
import { formatDistanceToNow, parseISO, format } from 'date-fns'

const routeTypeLookup = new Map(Object.entries({
  0: 'Tram, Streetcar, Light rail',
  1: 'Subway, Metro',
  2: 'Rail',
  3: 'Bus',
  4: 'Ferry',
  5: 'Cable tram',
  6: 'Aerial lift',
  7: 'Funicular',
  11: 'Trolleybus',
  12: 'Monorail'
}))

function parseHMS (value: string): number {
  const a = (value || '').split(':').map((s) => {
    return parseInt(s)
  })
  if (a.length !== 3) {
    return -1
  }
  return a[0] * 3600 + a[1] * 60 + a[2]
}

function zeroPad (num: number, places: number): string {
  return String(num).padStart(places, '0')
}

function formatHMS (value: number): string {
  if (value < 0) {
    return ''
  }
  value = value % (24 * 3600)
  let h = Math.floor(value / 3600)
  const m = Math.floor((value % 3600) / 60)
  // const s = Math.floor((value % 3600) % 60)
  let ampm = 'am'
  if (h === 0) {
    h = h + 12
  } else if (h === 12) {
    ampm = 'pm'
  } else if (h > 12) {
    h -= 12
    ampm = 'pm'
  }
  return `${zeroPad(h, 2)}:${zeroPad(m, 2)} ${ampm}`
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.globalProperties.$filters = {
    fromNowDate (comparisonDate: number) {
      return formatDistanceToNow(comparisonDate, {
        addSuffix: true
      }).replace('about ', '')
    },
    fromNow (comparisonDate: number) {
      return formatDistanceToNow(parseISO(comparisonDate + 'Z'), {
        addSuffix: true
      }).replace('about ', '')
    },
    reformatHMS (value: string): string {
      return formatHMS(parseHMS(value))
    },
    parseHMS (value: string): number {
      return parseHMS(value)
    },
    formatHMS (value: number): string {
      return formatHMS(value)
    },
    shortenName (value: string, len: number): string {
      if (!value) {
        value = ''
      }
      if (!len) {
        len = 24
      }
      if (value.length > len) {
        return value.substr(0, len) + '…'
      }
      return value
    },
    formatDate (value: string): string {
      return format(parseISO(value), 'yyyy-MM-dd')
    },
    joinUnique (values: string[]): string {
      return Array.from(new Set(values)).sort().join(', ')
    },
    round (value: number): string {
      return value.toFixed(2)
    },
    capitalize (value: string): string {
      return value
        .split(' ')
        .map((w) => {
          return (
            w.substr(0, 1).toUpperCase() +
            w.substr(1, w.length - 1).toLowerCase()
          )
        })
        .join(' ')
    },
    prettyBytes (num: number): string {
      if (typeof num !== 'number' || isNaN(num)) {
        throw new TypeError('Expected a number')
      }
      const neg = num < 0
      const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      if (neg) {
        num = -num
      }
      if (num < 1) {
        return (neg ? '-' : '') + num + ' B'
      }
      const exponent = Math.min(
        Math.floor(Math.log(num) / Math.log(1000)),
        units.length - 1
      )
      const snum = (num / 1000 ** exponent).toFixed(2)
      const unit = units[exponent]
      return (neg ? '-' : '') + snum + ' ' + unit
    },
    routeTypeToWords (num: number) {
      return routeTypeLookup.get(num.toString()) || num.toString()
    }
  }
})
