import { describe, test, expect } from 'vitest'
import { binnedCounts } from './bins'

describe('Scenario', () => {
  test('binnedCounts', () => {
    const breakpoints = [
      -300,
      0,
      360,
      600,
      1200
    ]
    const times = [
      // -5 to 0 minutes
      -3 * 60,
      // 0 to +6 minutes
      3 * 60,
      // +6 to +10 minutes
      7 * 60,
      // +10 to +20 minutes
      12 * 60,
      15 * 60
    ]
    expect(binnedCounts(times, breakpoints)).toStrictEqual([
      { binMax: 0, binMin: -300, binName: '-5 to 0', count: 1, percentOfTotal: 0.2 },
      { binMax: 360, binMin: 0, binName: '0 to +6', count: 1, percentOfTotal: 0.2 },
      { binMax: 600, binMin: 360, binName: '+6 to +10', count: 1, percentOfTotal: 0.2 },
      { binMax: 1200, binMin: 600, binName: '+10 to +20', count: 2, percentOfTotal: 0.4 }
    ])
  })
})
