import { describe, test, expect } from 'vitest'

import { Station } from './station'

import StopData from '~/testdata/ftvl/stop.json'
import StopsData from '~/testdata/ftvl/stops.json'

function loadStation (): Station {
  const rootStop = StopData.data.feed_versions[0]?.stops[0]
  if (!rootStop) {
    throw new Error('Test data missing root stop')
  }
  const station = new Station(rootStop as any)
  station.addStops(StopsData.data.stops as any)
  return station
}

describe('Station', () => {
  test('load', () => {
    const station = loadStation()
    expect(station.stop.stop_name).toEqual('Fruitvale Test')
  })

  test('addStops', () => {
    const station = loadStation()
    expect(station.stops.length).toEqual(22)
    const stopNames = station.stops.map(s => s.stop_name)
    expect(stopNames.sort()).toEqual([
      'Main entrance',
      'Paid fare area',
      'SB elevator (platform)',
      'NB elevator (platform)',
      'NB stairs (platform)',
      'SB stairs (platform)',
      'NB elevator',
      'SB elevator',
      'SB stairs',
      'NB stairs',
      'Node',
      'Node',
      'Node',
      'Node',
      'Node',
      'Bus platform',
      'Bus platform',
      'Bus platform',
      'NB platform',
      'SB platform',
      'Test entrance',
      'Test node for one-way pathway'
    ].sort())
    const locTypes: Record<number, number> = {}
    for (const stop of station.stops) {
      const lt = stop.location_type
      if (lt !== undefined) {
        locTypes[lt] = locTypes[lt] ? locTypes[lt] + 1 : 1
      }
    }
    expect(locTypes).toEqual({ 0: 5, 2: 2, 3: 15 })
  })
  test('pathways', () => {
    const station = loadStation()
    expect(station.pathways.length).toEqual(25)
    const pwTypes: Record<number, number> = {}
    for (const pw of station.pathways) {
      const lt = pw.pathway_mode
      if (lt !== undefined) {
        pwTypes[lt] = pwTypes[lt] ? pwTypes[lt] + 1 : 1
      }
    }
    expect(pwTypes).toEqual({ 1: 17, 2: 2, 4: 2, 5: 2, 6: 2 })
  })
  test('levels', () => {
    const station = loadStation()
    expect(station.levels.length).toEqual(3)
  })
})
