import { describe, test, expect } from 'vitest'
import {
  parseHMS,
  formatHMS,
  formatHM,
  median,
  formatDuration,
  fromNowDate,
  fromNow,
  shortenName,
  joinUnique,
  thousands,
  pct,
  capitalize,
  prettyBytes,
  reformatHMS,
  round,
  nameSort,
  routeTypeToWords
} from './filters'

describe('parseHMS', () => {
  const tcs = [
    { v: '10:00:00', e: 36000 },
    { v: '1:00:00', e: 3600 },
    { v: '01:00:00', e: 3600 },
    { v: '01:00:01', e: 3601 },
    { v: '01:01:01', e: 3661 },
    { v: '1:1:1', e: 3661 },
    { v: 'invalid', e: -1 }
  ]
  for (const tc of tcs) {
    test(tc.v, () => {
      expect(parseHMS(tc.v)).toBe(tc.e)
    })
  }
})

describe('formatHMS', () => {
  const tcs = [
    { v: 3600, e: '1:00:00 am' },
    { v: 0, e: '12:00:00 am' },
    { v: 36000, e: '10:00:00 am' },
    { v: 60, e: '12:01:00 am' },
    { v: 12 * 3600 + 60, e: '12:01:00 pm' },
    { v: 24 * 3600 + 60, e: '12:01:00 am' }
  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(formatHMS(tc.v)).toBe(tc.e)
    })
  }
})

describe('formatHM', () => {
  const tcs = [
    { v: 3600, e: '1:00 am' },
    { v: 0, e: '12:00 am' },
    { v: 36000, e: '10:00 am' },
    { v: 60, e: '12:01 am' },
    { v: 12 * 3600 + 60, e: '12:01 pm' },
    { v: 24 * 3600 + 60, e: '12:01 am' }
  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(formatHM(tc.v)).toBe(tc.e)
    })
  }
})

describe('formatDuration', () => {
  const tcs = [
    { v: 3600, e: '60 min' },
    { v: 0, e: '-' },
    { v: 36000, e: '10h 0 min' },
    { v: 60, e: '1 min' },
    { v: 12 * 3600 + 60, e: '12h 1 min' },
    { v: 24 * 3600 + 60, e: '24h 1 min' }

  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(formatDuration(tc.v)).toBe(tc.e)
    })
  }
})

describe('median', () => {
  const tcs = [
    { v: [1, 2, 3], e: 2 },
    { v: [3, 2, 1], e: 2 },
    { v: [1, 1, 2, 2], e: 1.5 },
    { v: [1], e: 1 }
  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(median(tc.v)).toBe(tc.e)
    })
  }
})

describe('fromNowDate', () => {
  const now = new Date()
  const addHours = function(v: Date, h: number): Date {
    const b = new Date(v)
    b.setHours(b.getHours() + h)
    return b
  }
  const tcs = [
    { n: 'now', v: now, e: 'less than a minute ago' },
    { v: addHours(now, 1), e: 'in 1 hour' },
    { v: addHours(now, -1), e: '1 hour ago' },
    { v: addHours(now, -36), e: '1 day ago' },
    { v: addHours(now, 36), e: 'in 1 day' }
  ]
  for (const tc of tcs) {
    test(tc.n || tc.e, () => {
      expect(fromNowDate(tc.v)).toBe(tc.e)
    })
  }
})

describe('fromNow', () => {
  const now = new Date()
  const addHours = function(v: Date, h: number): string {
    const b = new Date(v)
    b.setHours(b.getHours() + h)
    return b.toISOString()
  }
  const tcs = [
    { n: 'now', v: addHours(now, 0), e: 'less than a minute ago' },
    { v: addHours(now, 1), e: 'in 1 hour' },
    { v: addHours(now, -1), e: '1 hour ago' },
    { v: addHours(now, -36), e: '1 day ago' },
    { v: addHours(now, 36), e: 'in 1 day' }
  ]
  for (const tc of tcs) {
    test(tc.n || tc.e, () => {
      expect(fromNow(tc.v)).toBe(tc.e)
    })
  }
})

describe('shortenName', () => {
  const tcs = [
    { v: 'abc', e: 'abc' },
    { v: 'abcdefghijklmnopqrstuvwxyz', e: 'abcdefgh…' }
  ]
  for (const tc of tcs) {
    test(tc.v, () => {
      expect(shortenName(tc.v, 8)).toBe(tc.e)
    })
  }
})

describe('joinUnique', () => {
  const tcs = [
    { v: ['a', 'b', 'c'], e: 'a, b, c' },
    { v: ['a', 'b', 'a', 'b', 'c'], e: 'a, b, c' },
    { v: ['c', 'b', 'a'], e: 'a, b, c' }
  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(joinUnique(tc.v)).toBe(tc.e)
    })
  }
})

describe('thousands', () => {
  const tcs = [
    { v: '100', e: '100' },
    { v: 100, e: '100' },
    { v: '1000', e: '1,000' },
    { v: 1000, e: '1,000' },
    { v: -1000, e: '-1,000' }
  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(thousands(tc.v)).toBe(tc.e)
    })
  }
})

describe('pct', () => {
  const tcs = [
    { v: '0.5', e: '50.00 %' },
    { v: 0.4501, e: '45.01 %' },
    { v: 1.00, e: '100.00 %' },
    { v: 1.2345, e: '123.45 %' },
    { v: 1.23456, e: '123.46 %' }
  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(pct(tc.v)).toBe(tc.e)
    })
  }
})

describe('capitalize', () => {
  const tcs = [
    { v: 'abc', e: 'Abc' },
    { v: 'abc def', e: 'Abc Def' }
  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(capitalize(tc.v)).toBe(tc.e)
    })
  }
})

describe('prettyBytes', () => {
  const tcs = [
    { v: 1, e: '1 B' },
    { v: 256, e: '256 B' },
    { v: 1000, e: '1 kB' },
    { v: 1000 + 100, e: '1.10 kB' },
    { v: 1000 * 1000, e: '1 MB' },
    { v: 1000 * 1000 + 100000, e: '1.10 MB' }

  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(prettyBytes(tc.v)).toBe(tc.e)
    })
  }
})

describe('reformatHMS', () => {
  const tcs = [
    { v: '12:00:00', e: '12:00:00 pm' },
    { v: '01:00:00', e: '1:00:00 am' },
    { v: '00:00:00', e: '12:00:00 am' },
    { v: '30:00:00', e: '6:00:00 am' }
  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(reformatHMS(tc.v)).toBe(tc.e)
    })
  }
})

describe('round', () => {
  const tcs = [
    { v: 1.2345, e: '1.23' },
    { v: 1.4567, e: '1.46' }
  ]
  for (const tc of tcs) {
    test(String(tc.v), () => {
      expect(round(tc.v)).toBe(tc.e)
    })
  }
})

describe('nameSort', () => {
  const stringify = JSON.stringify
  const tcs = [
    { v: [{ name: 'b' }, { name: 'a' }], e: [{ name: 'a' }, { name: 'b' }] }
  ]
  for (const tc of tcs) {
    test(stringify(tc.v), () => {
      expect(stringify(nameSort(tc.v))).toEqual(stringify(tc.e))
    })
  }
})

describe('routeTypeToWords', () => {
  const stringify = JSON.stringify
  const tcs = [
    { v: 0, e: 'Tram' },
    { v: 3, e: 'Bus' },
    { v: 9999999, e: 'Unknown' },
    { v: 900, e: 'Tram Service (Tram)' }
  ]
  for (const tc of tcs) {
    test(stringify(tc.v), () => {
      expect(routeTypeToWords(tc.v)).toEqual(tc.e)
    })
  }
})
