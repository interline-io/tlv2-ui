import { describe, test, expect } from 'vitest'

import { Station } from '../../apps/transfers/station'
import { RoutingGraph, DefaultCost, DefaultDistance, Profiles, type RoutableStop } from './graph'

import StopData from '../../../../testdata/ftvl/stop.json'
import StopsData from '../../../../testdata/ftvl/stops.json'

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
  const g = new RoutingGraph(station.stops)
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
      const pw = s.pathway_id ? g.pwsById.get(s.pathway_id) : undefined
      return pw?.pathway_id
    }) ?? []
    expect(pwIds).toEqual(expect.arrayContaining(expectIds))
  })
})

describe('Profiles', () => {
  const station = loadStation()

  test('DefaultCost penalizes stairs vs DefaultDistance', () => {
    const gDist = new RoutingGraph(station.stops)
    const gCost = new RoutingGraph(station.stops, DefaultCost)
    // Route through stairs (6409865->6409870 is mode 2)
    const distPath = gDist.aStar(6409865, 6409870)
    const costPath = gCost.aStar(6409865, 6409870)
    // DefaultCost applies 1.5x penalty on stairs, so cost should be higher
    expect(costPath.distance).toBeGreaterThan(distPath.distance!)
  })

  test('No Stairs/Escalator avoids stairs and escalators', () => {
    const gDefault = new RoutingGraph(station.stops, DefaultCost)
    const gNoStairs = new RoutingGraph(station.stops, Profiles['Pathways: No Stairs/Escalator']!)
    // 6409880->6409879 crosses levels; default uses 6 edges including stairs
    const defaultPath = gDefault.aStar(6409880, 6409879)
    const noStairsPath = gNoStairs.aStar(6409880, 6409879)
    // Verify default route uses stairs or escalators
    const defaultModes = defaultPath.edges?.map((e) => {
      const pw = e.pathway_id ? gDefault.pwsById.get(e.pathway_id) : undefined
      return pw?.pathway_mode
    }) ?? []
    expect(defaultModes.some(m => m === 2 || m === 4)).toBe(true)
    // Restricted profile should not use stairs (2) or escalators (4)
    const restrictedModes = noStairsPath.edges?.map((e) => {
      const pw = e.pathway_id ? gNoStairs.pwsById.get(e.pathway_id) : undefined
      return pw?.pathway_mode
    }) ?? []
    expect(restrictedModes.some(m => m === 2 || m === 4)).toBe(false)
  })
})

describe('Boarding areas', () => {
  // Synthetic station: platform (100) <--pathway--> entrance (101), boarding area (102) with parent_station=100
  const platform: RoutableStop = {
    id: 100, stop_id: 'platform', location_type: 0,
    geometry: { coordinates: [-122.0, 37.0] },
    pathways_from_stop: [{
      id: 1, pathway_id: 'pw-1', pathway_mode: 1, is_bidirectional: 1,
      from_stop: { id: 100 }, to_stop: { id: 101 }
    }],
    pathways_to_stop: []
  }
  const entrance: RoutableStop = {
    id: 101, stop_id: 'entrance', location_type: 2,
    geometry: { coordinates: [-122.001, 37.0] },
    pathways_from_stop: [],
    pathways_to_stop: [{
      id: 1, pathway_id: 'pw-1', pathway_mode: 1, is_bidirectional: 1,
      from_stop: { id: 100 }, to_stop: { id: 101 }
    }]
  }
  const boardingArea: RoutableStop = {
    id: 102, stop_id: 'boarding', location_type: 4,
    parent_station: 100,
    geometry: { coordinates: [-122.0, 37.0001] },
    pathways_from_stop: [],
    pathways_to_stop: []
  }

  test('boarding area routes to parent platform via implicit edge', () => {
    const g = new RoutingGraph([platform, entrance, boardingArea])
    // boarding area (102) -> platform (100) via implicit edge, then -> entrance (101) via pathway
    const path = g.aStar(102, 101)
    expect(path.distance).not.toBeNull()
    expect(path.path.length).toEqual(3)
    expect(path.path).toEqual([2, 0, 1]) // boarding -> platform -> entrance
  })

  test('boarding area is routable as a destination', () => {
    const g = new RoutingGraph([platform, entrance, boardingArea])
    // entrance (101) -> platform (100) via pathway, then -> boarding area (102) via implicit edge
    const path = g.aStar(101, 102)
    expect(path.distance).not.toBeNull()
    expect(path.path.length).toEqual(3)
    expect(path.path).toEqual([1, 0, 2]) // entrance -> platform -> boarding
  })

  test('boarding area without parent_station is not implicitly connected', () => {
    const disconnected: RoutableStop = {
      ...boardingArea,
      id: 103, stop_id: 'disconnected', parent_station: undefined
    }
    const g = new RoutingGraph([platform, entrance, disconnected])
    const path = g.aStar(103, 101)
    expect(path.path.length).toEqual(0)
  })
})

describe('Parallel pathways', () => {
  // Two stops connected by both stairs (mode 2) and an elevator (mode 5)
  const stopA: RoutableStop = {
    id: 200, stop_id: 'A', location_type: 3,
    geometry: { coordinates: [-122.0, 37.0] },
    pathways_from_stop: [
      { id: 10, pathway_id: 'stairs', pathway_mode: 2, is_bidirectional: 1, from_stop: { id: 200 }, to_stop: { id: 201 } },
      { id: 11, pathway_id: 'elevator', pathway_mode: 5, is_bidirectional: 1, from_stop: { id: 200 }, to_stop: { id: 201 } }
    ],
    pathways_to_stop: []
  }
  const stopB: RoutableStop = {
    id: 201, stop_id: 'B', location_type: 3,
    geometry: { coordinates: [-122.0, 37.001] },
    pathways_from_stop: [],
    pathways_to_stop: [
      { id: 10, pathway_id: 'stairs', pathway_mode: 2, is_bidirectional: 1, from_stop: { id: 200 }, to_stop: { id: 201 } },
      { id: 11, pathway_id: 'elevator', pathway_mode: 5, is_bidirectional: 1, from_stop: { id: 200 }, to_stop: { id: 201 } }
    ]
  }

  test('blocked pathway does not clobber valid parallel pathway', () => {
    // Wheelchair blocks stairs (mode 2) but allows elevator (mode 5)
    const g = new RoutingGraph([stopA, stopB], Profiles['Pathways: Wheelchair']!)
    const path = g.aStar(200, 201)
    // Should still find a route via elevator
    expect(path.distance).not.toBeNull()
    expect(path.path.length).toEqual(2)
  })
})

describe('traversal_time and length', () => {
  const makeStops = (pwProps: Record<string, unknown> = {}): [RoutableStop, RoutableStop] => {
    const pw = {
      id: 1, pathway_id: 'pw-1', pathway_mode: 1, is_bidirectional: 1,
      from_stop: { id: 300 }, to_stop: { id: 301 },
      ...pwProps
    }
    return [
      {
        id: 300, stop_id: 'X', location_type: 0,
        geometry: { coordinates: [-122.0, 37.0] },
        pathways_from_stop: [pw], pathways_to_stop: []
      },
      {
        id: 301, stop_id: 'Y', location_type: 0,
        geometry: { coordinates: [-122.001, 37.0] },
        pathways_from_stop: [], pathways_to_stop: [pw]
      }
    ]
  }

  test('traversal_time overrides computed cost', () => {
    const stops = makeStops({ traversal_time: 42 })
    const g = new RoutingGraph(stops, DefaultCost)
    const path = g.aStar(300, 301)
    expect(path.distance).toEqual(42)
  })

  test('traversal_time used by DefaultDistance', () => {
    const stops = makeStops({ traversal_time: 10 })
    const g = new RoutingGraph(stops, DefaultDistance)
    const path = g.aStar(300, 301)
    expect(path.distance).toEqual(10)
  })

  test('pathway length used instead of haversine when provided', () => {
    const stopsWithLength = makeStops({ length: 200 })
    const stopsWithout = makeStops()
    const gWith = new RoutingGraph(stopsWithLength, DefaultDistance)
    const gWithout = new RoutingGraph(stopsWithout, DefaultDistance)
    const pathWith = gWith.aStar(300, 301)
    const pathWithout = gWithout.aStar(300, 301)
    // With length=200m, cost = 200/1.3 ≈ 153.8s
    // Without, cost uses haversine (~88m) / 1.3 ≈ 67.9s
    expect(pathWith.distance).not.toEqual(pathWithout.distance)
    expect(pathWith.distance).toBeCloseTo(200 / 1.3, 1)
  })

  test('wheelchair profile still blocks stairs even with traversal_time', () => {
    const stops = makeStops({ pathway_mode: 2, traversal_time: 30 })
    const g = new RoutingGraph(stops, Profiles['Pathways: Wheelchair']!)
    const path = g.aStar(300, 301)
    // Stairs blocked for wheelchair, no route available
    expect(path.path.length).toEqual(0)
  })
})
