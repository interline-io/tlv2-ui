import { describe, test, expect } from 'vitest'

import { Station } from '../components/apps/transfers/station'
import { RoutingGraph } from './graph'

import StopData from '../../../testdata/ftvl/stop.json'
import StopsData from '../../../testdata/ftvl/stops.json'

function loadStation (): Station {
  const rootStop = StopData.data.feed_versions[0]?.stops[0]
  if (!rootStop) {
    throw new Error('Test data missing root stop')
  }
  const station = new Station(rootStop as any)
  station.addStops(StopsData.data.stops as any)
  return station
}

describe('Graph', () => {
  const station = loadStation()
  const g = new RoutingGraph(station.stops, undefined)
  test('single edge', () => {
    const path = g.aStar(6409875, 6409861)
    expect(path.distance).toBeCloseTo(36.4592747, 3)
    expect(path.edges?.length).toEqual(1)
    expect(path.path.length).toEqual(2)
  })
  test('two edges', () => {
    const path = g.aStar(6409878, 6409861)
    expect(path.distance).toBeCloseTo(52.319040, 3)
    expect(path.edges?.length).toEqual(2)
    expect(path.path.length).toEqual(3)
  })
  test('three edges', () => {
    const path = g.aStar(6409866, 6409874)
    expect(path.distance).toBeCloseTo(33.79609177856, 3)
    expect(path.edges?.length).toEqual(3)
    expect(path.path.length).toEqual(4)
  })
  test('bidirectional faregate', () => {
    const path = g.aStar(6409861, 6409862)
    expect(path.distance).toBeCloseTo(19.63153677, 3)
    expect(path.edges?.length).toEqual(1)
  })
  test('single direction faregate', () => {
    const path = g.aStar(6409883, 6409862)
    expect(path.edges?.length).toEqual(1)
    const path2 = g.aStar(6409862, 6409883)
    expect(path2.edges?.length).toEqual(0)
  })
  test('uses elevator', () => {
    const path = g.aStar(6409880, 6409879)
    expect(path.edges?.length).toEqual(6)
    const expectIds = [
      '6409867-6409864-1639527716044',
      '6409868-6409863-1639527743885'
    ]
    const pwIds = path.edges?.map((s) => {
      const pw = g.pwsById.get(s.pathway_id)
      return pw?.pathway_id
    }) ?? []
    expect(pwIds).toEqual(expect.arrayContaining(expectIds))
  })
})
