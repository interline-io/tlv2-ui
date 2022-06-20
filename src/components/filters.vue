<script>
import { formatDistanceToNow, parseISO, format } from 'date-fns'

function parseHMS (value) {
  const a = (value || '').split(':').map((s) => { return parseInt(s) })
  if (a.length !== 3) {
    return null
  }
  return a[0] * 3600 + a[1] * 60 + a[2]
}

function formatHMS (value) {
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

export default {
  filters: {
    fromNowDate (comparisonDate) {
      return formatDistanceToNow(comparisonDate, {
        addSuffix: true
      }).replace('about ', '')
    },
    fromNow (comparisonDate) {
      return formatDistanceToNow(parseISO(comparisonDate + 'Z'), {
        addSuffix: true
      }).replace('about ', '')
    },
    reformatHMS (value) {
      return formatHMS(parseHMS(value))
    },
    parseHMS (value) {
      return parseHMS(value)
    },
    formatHMS (value) {
      return formatHMS(value)
    },
    shortenName (value, len) {
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
    formatDate: function formatdate (value) {
      return format(parseISO(value), 'yyyy-MM-dd')
    },
    joinUnique (values) {
      return Array.from(new Set(values)).sort().join(', ')
    },
    round (value) {
      return value.toFixed(2)
    },
    thousands (value) {
      value = parseFloat(value)
      if (isNaN(value)) {
        return '-'
      }
      return Math.ceil(value).toLocaleString()
    },
    pct (value) {
      if (isNaN(parseFloat(value))) {
        return ''
      }
      return `${(value * 100).toFixed(2)} %`
    },
    capitalize (value) {
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
    prettyBytes (num) {
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
    routeTypeToWords (num) {
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
}
</script>
