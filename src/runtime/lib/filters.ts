import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { getBasicRouteType } from './routetypes'

export function parseHMS (value: string): number {
  const a = (value || '').split(':').map((s) => {
    return Number.parseInt(s)
  })
  if (a.length !== 3) {
    return -1
  }
  return a[0] * 3600 + a[1] * 60 + a[2]
}

export function formatHMS (value: number): string {
  if (value < 0) { return '' }
  value = value % (24 * 3600)
  let h = Math.floor(value / 3600)
  const m = Math.floor((value % 3600) / 60)
  const s = Math.floor((value % 3600) % 60)
  let ampm = 'am'
  if (h === 0) {
    h = h + 12
  } else if (h === 12) {
    ampm = 'pm'
  } else if (h > 12) {
    h -= 12
    ampm = 'pm'
  }
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`
}

export function formatHM (value: number): string {
  if (value < 0) { return '' }
  value = value % (24 * 3600)
  let h = Math.floor(value / 3600)
  const m = Math.floor((value % 3600) / 60)
  let ampm = 'am'
  if (h === 0) {
    h = h + 12
  } else if (h === 12) {
    ampm = 'pm'
  } else if (h > 12) {
    h -= 12
    ampm = 'pm'
  }
  return `${h}:${String(m).padStart(2, '0')} ${ampm}`
}

export function median (values: Array<number>): number {
  const half = Math.floor(values.length / 2)
  if (values.length % 2) {
    return values[half]
  }
  return (values[half - 1] + values[half]) / 2.0
}

export function formatDuration (seconds: number): string {
  if (seconds > 3600) {
    return `${Math.floor(seconds / 3600)}h ${Math.ceil(
      (seconds % 3600) / 60
    )} min`
  }
  if (seconds > 0) {
    return `${Math.ceil(seconds / 60)} min`
  }
  return '-'
}

export function fromNowDate (comparisonDate: Date): string {
  return formatDistanceToNow(comparisonDate, {
    addSuffix: true
  }).replace('about ', '')
}

export function fromNow (comparisonDate: string): string {
  return formatDistanceToNow(parseISO(comparisonDate + 'Z'), {
    addSuffix: true
  }).replace('about ', '')
}

export function shortenName (value: string, len: number): string {
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
}

export function formatDate (value: string): string {
  return format(parseISO(value), 'yyyy-MM-dd')
}

export function formatDateTime (value: string): string {
  return format(parseISO(value), 'hh:mm:ss bbb')
}

export function joinUnique (values: Array<string>): string {
  return Array.from(new Set(values)).sort().join(', ')
}

export function thousands (value: string | number): string {
  const f = typeof (value) === 'string' ? Number.parseFloat(value) : value
  if (isNaN(f)) {
    return '-'
  }
  return Math.ceil(f).toLocaleString()
}

export function pct (value: string | number): string {
  const f = typeof (value) === 'string' ? Number.parseFloat(value) : value
  if (isNaN(f)) {
    return ''
  }
  return `${(f * 100).toFixed(2)} %`
}

export function capitalize (value: string): string {
  return value
    .split(' ')
    .map((w) => {
      return (
        w.substr(0, 1).toUpperCase()
        + w.substr(1, w.length - 1).toLowerCase()
      )
    })
    .join(' ')
}

export function prettyBytes (num: number): string {
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
  const numFixed = (num / 1000 ** exponent).toFixed(2)
  const numStrip = numFixed.endsWith('.00') ? (num / 1000 ** exponent).toFixed(0) : numFixed
  const unit = units[exponent]
  return (neg ? '-' : '') + numStrip + ' ' + unit
}

export function routeTypeToWords (code: number) {
  const rt = getBasicRouteType(code)
  if (rt.parentType) {
    return `${rt.routeType.name} (${rt.parentType.name})`
  }
  return rt.routeType.name
}

export function reformatHMS (value: string): string {
  return formatHMS(parseHMS(value))
}

export function round (value: number): string {
  return value.toFixed(2)
}

interface HasName {
  name: string
}

export function nameSort (v: Array<HasName>) {
  return (v || []).slice(0).sort((a, b) => { return (a.name || '').localeCompare(b.name || '') })
}

export function makePathKey (onestopId: string, feedId: string, sha1: string, entityId: string, id: number, linkVer: boolean) {
  // todo: omit feedId if possible
  if (linkVer && onestopId) {
    return `${onestopId}:${feedId}@${sha1}`
  }
  if (linkVer) {
    return `${feedId}@${sha1}:${entityId}`
  }
  if (onestopId) {
    return onestopId
  }
  if (feedId && entityId) {
    return `${feedId}:${entityId}`
  }
  // Return id as last resort
  return `${id}`
}

export function makeRouteLink (onestopId: string, feedId: string, sha1: string, entityId: string, id: number, linkVer: boolean) {
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
}

export function makeStopLink (onestopId: string, feedId: string, sha1: string, entityId: string, id: number, linkVer: boolean) {
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
