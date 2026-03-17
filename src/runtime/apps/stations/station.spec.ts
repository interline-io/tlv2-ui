import { describe, test, expect, beforeEach } from 'vitest'
import { Stop, Pathway, Station } from './station'
import { WheelchairProfile } from '../../lib/pathways/graph'
import type { StopData, PathwayData } from './types'

// ─── Factories ────────────────────────────────────────────────────────────────

function makeStop (id: number, overrides: Partial<StopData> = {}): Stop {
  return new Stop({
    id,
    stop_id: `stop-${id}`,
    stop_name: `Stop ${id}`,
    location_type: 3,
    geometry: { type: 'Point', coordinates: [-122.0 + id * 0.001, 37.0] },
    pathways_from_stop: [],
    pathways_to_stop: [],
    ...overrides
  })
}

// Stops co-located at origin — heuristic is 0 for all pairs, so A* behaves
// like Dijkstra and only traversal_time determines path cost.
function makeColocatedStop (id: number, overrides: Partial<StopData> = {}): Stop {
  return makeStop(id, { geometry: { type: 'Point', coordinates: [0, 0] }, ...overrides })
}

let nextPwId = 0

// Creates a Pathway and links it into the from/to stop lists.
function connectStops (fromStop: Stop, toStop: Stop, overrides: Partial<PathwayData> = {}): Pathway {
  const id = ++nextPwId
  const pw = new Pathway({
    id,
    pathway_id: `pw-${id}`,
    pathway_mode: 1,
    is_bidirectional: 1,
    from_stop: { id: fromStop.id },
    to_stop: { id: toStop.id },
    ...overrides
  })
  fromStop.pathways_from_stop.push(pw)
  toStop.pathways_to_stop.push(pw)
  return pw
}

function makeStation (id = 100): Station {
  return new Station({
    id,
    stop_id: 'station',
    stop_name: 'Station',
    location_type: 1,
    geometry: { type: 'Point', coordinates: [-122.0, 37.0] }
  })
}

// ─── Station.findRoute ────────────────────────────────────────────────────────

describe('Station.findRoute', () => {
  beforeEach(() => { nextPwId = 0 })

  test('returns undefined when no stops are loaded', () => {
    const station = makeStation()
    expect(station.findRoute(1, 2)).toBeUndefined()
  })

  test('finds a direct route between two connected stops', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    connectStops(a, b)
    station.addStops([a, b])

    const result = station.findRoute(1, 2)
    expect(result).toBeDefined()
    expect(result!.path).toEqual([1, 2])
    expect(result!.distance).toBeGreaterThan(0)
  })

  test('finds a multi-hop route through intermediate stops', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    const c = makeStop(3)
    connectStops(a, b)
    connectStops(b, c)
    station.addStops([a, b, c])

    const result = station.findRoute(1, 3)
    expect(result).toBeDefined()
    expect(result!.path).toEqual([1, 2, 3])
  })

  test('returns empty path when no route exists between disconnected stops', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    station.addStops([a, b]) // no pathway

    const result = station.findRoute(1, 2)
    expect(result!.path).toHaveLength(0)
    expect(result!.distance).toBeNull()
  })

  test('one-directional pathway: can travel forward but not in reverse', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    connectStops(a, b, { is_bidirectional: 0 })
    station.addStops([a, b])

    expect(station.findRoute(1, 2)!.path).toEqual([1, 2])
    expect(station.findRoute(2, 1)!.path).toHaveLength(0)
  })

  test('bidirectional pathway allows travel in both directions', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    connectStops(a, b, { is_bidirectional: 1 })
    station.addStops([a, b])

    expect(station.findRoute(1, 2)!.path).toEqual([1, 2])
    expect(station.findRoute(2, 1)!.path).toEqual([2, 1])
  })

  test('returns error result for unknown stop IDs', () => {
    const station = makeStation()
    station.addStops([makeStop(1)])

    const result = station.findRoute(1, 999)
    expect(result!.error).toBeTruthy()
    expect(result!.path).toHaveLength(0)
  })

  test('uses traversal_time directly as edge cost', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    connectStops(a, b, { traversal_time: 42 })
    station.addStops([a, b])

    const result = station.findRoute(1, 2)
    expect(result!.distance).toBe(42)
  })

  test('finds the lower-cost path when multiple routes exist', () => {
    const station = makeStation()
    const a = makeColocatedStop(1)
    const b = makeColocatedStop(2)
    const mid = makeColocatedStop(3)
    connectStops(a, b, { traversal_time: 100 }) // expensive direct
    connectStops(a, mid, { traversal_time: 1 })
    connectStops(mid, b, { traversal_time: 1 })
    station.addStops([a, b, mid])

    const result = station.findRoute(1, 2)
    expect(result!.path).toEqual([1, 3, 2])
    expect(result!.distance).toBe(2)
  })

  test('WheelchairProfile blocks stairs (pathway_mode 2)', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    connectStops(a, b, { pathway_mode: 2 })
    station.addStops([a, b])

    expect(station.findRoute(1, 2)!.path).toEqual([1, 2])
    expect(station.findRoute(1, 2, WheelchairProfile)!.path).toHaveLength(0)
  })

  test('WheelchairProfile falls back to accessible pathway when stairs are blocked', () => {
    const station = makeStation()
    const a = makeColocatedStop(1)
    const b = makeColocatedStop(2)
    const mid = makeColocatedStop(3)
    connectStops(a, b, { pathway_mode: 2, traversal_time: 1 }) // stairs — blocked
    connectStops(a, mid, { pathway_mode: 1, traversal_time: 2 })
    connectStops(mid, b, { pathway_mode: 1, traversal_time: 2 })
    station.addStops([a, b, mid])

    const result = station.findRoute(1, 2, WheelchairProfile)
    expect(result!.path).toEqual([1, 3, 2])
  })

  test('includes pathway edges with IDs and costs in the result', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    const pw = connectStops(a, b, { traversal_time: 10 })
    station.addStops([a, b])

    const result = station.findRoute(1, 2)
    expect(result!.edges).toHaveLength(1)
    const edge = result!.edges![0]!
    expect(edge.pathway_id).toBe(pw.id)
    expect(edge.from_stop_id).toBe(1)
    expect(edge.to_stop_id).toBe(2)
    expect(edge.cost).toBe(10)
  })

  test('caches the routing graph for the same profile', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    connectStops(a, b)
    station.addStops([a, b])

    station.findRoute(1, 2)
    const firstGraph = station.graph

    station.findRoute(2, 1)
    expect(station.graph).toBe(firstGraph) // same reference
  })

  test('rebuilds the routing graph when profile changes', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    connectStops(a, b)
    station.addStops([a, b])

    station.findRoute(1, 2)
    const firstGraph = station.graph

    station.findRoute(1, 2, WheelchairProfile)
    expect(station.graph).not.toBe(firstGraph)
  })
})

// ─── Station.addStops ─────────────────────────────────────────────────────────

describe('Station.addStops', () => {
  beforeEach(() => { nextPwId = 0 })

  test('sets this.stops to the provided stops, excluding the station stop', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    station.addStops([a, b])

    expect(station.stops.map(s => s.id)).toEqual(expect.arrayContaining([1, 2]))
    expect(station.stops.map(s => s.id)).not.toContain(100)
  })

  test('returns IDs to fetch including provided stop IDs and pathway endpoint IDs', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    const unloaded = makeStop(3)
    connectStops(a, unloaded) // stop 3 not in addStops call

    const toFetch = station.addStops([a, b])

    expect(toFetch).toContain(1)
    expect(toFetch).toContain(2)
    expect(toFetch).toContain(3) // discovered via pathway
    expect(toFetch).not.toContain(100) // station stop excluded
  })

  test('includes station stop children in the IDs to fetch', () => {
    const station = new Station({
      id: 100,
      stop_id: 'station',
      location_type: 1,
      geometry: { type: 'Point', coordinates: [-122.0, 37.0] },
      children: [{ id: 1 }, { id: 2 }]
    })

    const toFetch = station.addStops([])
    expect(toFetch).toContain(1)
    expect(toFetch).toContain(2)
    expect(toFetch).not.toContain(100)
  })

  test('includes parent IDs in the IDs to fetch', () => {
    const station = makeStation()
    const a = makeStop(1, { parent: { id: 50 } })

    const toFetch = station.addStops([a])
    expect(toFetch).toContain(50)
  })

  test('includes level-mate stop IDs in the IDs to fetch', () => {
    const station = makeStation()
    const a = makeStop(1, {
      level: { id: 10, level_name: 'Ground', stops: [{ id: 99 }] }
    })

    const toFetch = station.addStops([a])
    expect(toFetch).toContain(99)
  })

  test('accumulates stops across multiple calls', () => {
    const station = makeStation()
    station.addStops([makeStop(1)])
    station.addStops([makeStop(2)])

    expect(station.stops).toHaveLength(2)
    expect(station.stops.map(s => s.id)).toEqual(expect.arrayContaining([1, 2]))
  })

  test('deduplicates stops when the same stop is provided more than once', () => {
    const station = makeStation()
    const a = makeStop(1)
    station.addStops([a])
    station.addStops([a]) // second call with same stop

    expect(station.stops).toHaveLength(1)
  })

  test('indexes pathways from pathways_from_stop', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    const pw = connectStops(a, b)
    station.addStops([a, b])

    expect(station.pathways).toHaveLength(1)
    expect(station.pathways[0]!.id).toBe(pw.id)
  })

  test('does not duplicate a pathway that appears in both from and to stop lists', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    connectStops(a, b) // pw in a.pathways_from_stop AND b.pathways_to_stop
    station.addStops([a, b])

    expect(station.pathways).toHaveLength(1)
  })

  test('groups stops into their assigned levels', () => {
    const station = makeStation()
    const a = makeStop(1, { level: { id: 10, level_name: 'Ground', level_index: 0 } })
    const b = makeStop(2, { level: { id: 10, level_name: 'Ground', level_index: 0 } })
    const c = makeStop(3, { level: { id: 20, level_name: 'Mezzanine', level_index: 1 } })
    station.addStops([a, b, c])

    const ground = station.levels.find(l => l.id === 10)
    const mezz = station.levels.find(l => l.id === 20)
    expect(ground?.stops.map(s => s.id)).toEqual(expect.arrayContaining([1, 2]))
    expect(mezz?.stops.map(s => s.id)).toEqual([3])
  })

  test('stops without a level go into the unassigned level', () => {
    const station = makeStation()
    const a = makeStop(1) // no level override → Unassigned
    station.addStops([a])

    const unassigned = station.levels.find(l => !l.id)
    expect(unassigned).toBeDefined()
    expect(unassigned!.stops.map(s => s.id)).toContain(1)
  })

  test('invalidates the routing graph cache after update', () => {
    const station = makeStation()
    const a = makeStop(1)
    const b = makeStop(2)
    connectStops(a, b)
    station.addStops([a, b])

    station.findRoute(1, 2) // builds graph
    expect(station.graph).not.toBeNull()

    station.addStops([makeStop(3)]) // should invalidate
    expect(station.graph).toBeNull()
  })
})
