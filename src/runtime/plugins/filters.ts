import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { defineNuxtPlugin } from '#imports'

function parseHMS(value) {
  const a = (value || '').split(':').map((s) => {
    return parseInt(s)
  })
  if (a.length !== 3) {
    return null
  }
  return a[0] * 3600 + a[1] * 60 + a[2]
}

function formatHMS(value) {
  value = value % (24 * 3600)
  let h = Math.floor(value / 3600)
  let m = Math.floor((value % 3600) / 60)
  let s = Math.floor((value % 3600) % 60)
  let ampm = 'am'
  if (h === 0) {
    h = h + 12
  } else if (h === 12) {
    ampm = 'pm'
  } else if (h > 12) {
    h -= 12
    ampm = 'pm'
  }
  if (m < 10) {
    m = '0' + m
  }
  if (s < 10) {
    s = '0' + s
  }
  return `${h}:${m} ${ampm}`
}

function median(values) {
  const half = Math.floor(values.length / 2)
  if (values.length % 2) {
    return values[half]
  }
  return (values[half - 1] + values[half]) / 2.0
}

function formatDuration(seconds) {
  if (seconds > 3600) {
    return `${Math.ceil(seconds / 3600)}h ${Math.ceil(
      (seconds % 3600) / 60
    )} min`
  }
  if (seconds > 0) {
    return `${Math.ceil(seconds / 60)} min`
  }
  return '-'
}

// sanitize filename
const illegalRe = /[\/\?<>\\:\*\|"]/g
const controlRe = /[\x00-\x1F\x80-\x9F]/g
const reservedRe = /^\.+$/
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i
const windowsTrailingRe = /[\. ]+$/

// sanitize url
const invalidProtocolRegex = /^([^\w]*)(javascript|data|vbscript)/im
const htmlEntitiesRegex = /&#(\w+)(^\w|;)?/g
const htmlCtrlEntityRegex = /&(newline|tab);/gi
const ctrlCharactersRegex = /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim
const urlSchemeRegex = /^.+(:|&colon;)/gim
const relativeFirstCharacters = ['.', '/']
const BLANK_URL = 'about:blank'

function isRelativeUrlWithoutProtocol(url: string): boolean {
  return relativeFirstCharacters.includes(url[0])
}

// adapted from https://stackoverflow.com/a/29824550/2601552
function decodeHtmlCharacters(str: string) {
  const removedNullByte = str.replace(ctrlCharactersRegex, '')
  return removedNullByte.replace(htmlEntitiesRegex, (match, dec) => {
    return String.fromCharCode(dec)
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.globalProperties.$filters = {
    nameSort(v: Array<any>) {
      return (v || []).slice(0).sort((a, b) => { return (a.name || '').localeCompare(b.name || '') })
    },
    sanitizeUrl(url) {
      // https://github.com/braintree/sanitize-url/blob/main/src/index.ts
      if (!url) {
        return BLANK_URL
      }
      let charsToDecode
      let decodedUrl = url
      do {
        decodedUrl = decodeHtmlCharacters(decodedUrl)
          .replace(htmlCtrlEntityRegex, '')
          .replace(ctrlCharactersRegex, '')
          .trim()
        charsToDecode =
          decodedUrl.match(ctrlCharactersRegex) ||
          decodedUrl.match(htmlEntitiesRegex) ||
          decodedUrl.match(htmlCtrlEntityRegex)
      } while (charsToDecode && charsToDecode.length > 0)
      const sanitizedUrl = decodedUrl
      if (!sanitizedUrl) {
        return BLANK_URL
      }
      if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
        return sanitizedUrl
      }
      const urlSchemeParseResults = sanitizedUrl.match(urlSchemeRegex)
      if (!urlSchemeParseResults) {
        return sanitizedUrl
      }
      const urlScheme = urlSchemeParseResults[0]
      if (invalidProtocolRegex.test(urlScheme)) {
        return BLANK_URL
      }
      return sanitizedUrl
    },
    sanitizeFilename(v) {
      // https://github.com/parshap/node-sanitize-filename/blob/master/index.js
      const replacement = ''
      if (typeof v !== 'string') {
        throw new TypeError('Input must be string')
      }
      return v.replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement)
        .replace(windowsReservedRe, replacement)
        .replace(windowsTrailingRe, replacement)
    },
    formatHeadway(hw, tod) {
      if (!hw) {
        return ''
      }
      const deps = hw[tod] || []
      if (deps.length === 0) {
        return ''
      } else if (deps.length < 3) {
        return `${deps.length + 1} trips`
      }
      const amin = Math.min(...deps)
      const amax = Math.max(...deps)
      const amid = median(deps)
      if (amin && amax) {
        const diff = Math.abs(amax - amin)
        if (diff > 2 * 3600) {
          return 'varies'
        } else if (diff > 10 * 60) {
          return `${formatDuration(amin)} - ${formatDuration(amax)}`
        }
      }
      if (amid) {
        return formatDuration(amid)
      }
      return ''
    },
    fromNowDate(comparisonDate) {
      return formatDistanceToNow(comparisonDate, {
        addSuffix: true
      }).replace('about ', '')
    },
    fromNow(comparisonDate) {
      return formatDistanceToNow(parseISO(comparisonDate + 'Z'), {
        addSuffix: true
      }).replace('about ', '')
    },
    reformatHMS(value) {
      return formatHMS(parseHMS(value))
    },
    parseHMS(value) {
      return parseHMS(value)
    },
    formatHMS(value) {
      return formatHMS(value)
    },
    shortenName(value, len) {
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
    formatDate: function formatdate(value) {
      return format(parseISO(value), 'yyyy-MM-dd')
    },
    joinUnique(values) {
      return Array.from(new Set(values)).sort().join(', ')
    },
    round(value) {
      return value.toFixed(2)
    },
    thousands(value) {
      value = parseFloat(value)
      if (isNaN(value)) {
        return '-'
      }
      return Math.ceil(value).toLocaleString()
    },
    pct(value) {
      if (isNaN(parseFloat(value))) {
        return ''
      }
      return `${(value * 100).toFixed(2)} %`
    },
    capitalize(value) {
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
    prettyBytes(num) {
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
      num = (num / 1000 ** exponent).toFixed(2) * 1
      const unit = units[exponent]
      return (neg ? '-' : '') + num + ' ' + unit
    },
    routeTypeToWords(num) {
      if (num >= 0 <= 12) {
        return {
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
        }[num]
      } else {
        return num
      }
    }
  }
})
