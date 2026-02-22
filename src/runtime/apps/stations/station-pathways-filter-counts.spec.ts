import { describe, test, expect } from 'vitest'
import { Stop, Pathway } from './station'
import { computeFilterCounts } from './station-pathways-filter-counts'
import type { StopData, PathwayData } from './types'

function makeStop (overrides: Partial<StopData> = {}): Stop {
  return new Stop({
    id: 1,
    stop_id: 'stop-1',
    stop_name: 'Test Stop',
    location_type: 3,
    geometry: { type: 'Point', coordinates: [-122.0, 37.0] },
    level: { id: 10, level_name: 'Ground' },
    pathways_from_stop: [],
    pathways_to_stop: [],
    ...overrides
  })
}

function makePathway (overrides: Partial<PathwayData> = {}): Pathway {
  return new Pathway({
    id: 1,
    pathway_id: 'pw-1',
    pathway_mode: 1,
    is_bidirectional: 1,
    from_stop: { id: 1, stop_id: 'from', level: { id: 10, level_name: 'Ground' } },
    to_stop: { id: 2, stop_id: 'to', level: { id: 10, level_name: 'Ground' } },
    ...overrides
  })
}

describe('computeFilterCounts', () => {
  describe('empty station', () => {
    test('returns zeros for all counts', () => {
      const counts = computeFilterCounts([], [])
      expect(counts.stopsByLocationType).toEqual({})
      expect(counts.stopsWithAssociations).toBe(0)
      expect(counts.platformsWithoutAssociations).toBe(0)
      expect(counts.entrancesWithoutAssociations).toBe(0)
      expect(counts.stopsWithPairedPathways).toBe(0)
      expect(counts.pathwaysByMode).toEqual({})
      expect(counts.pathwaysWithPairs).toBe(0)
      expect(counts.pathwaysOneway).toBe(0)
      expect(counts.pathwaysBidirectional).toBe(0)
    })
  })

  describe('stopsByLocationType', () => {
    test('counts stops by location_type', () => {
      const stops = [
        makeStop({ id: 1, location_type: 0 }),
        makeStop({ id: 2, location_type: 0 }),
        makeStop({ id: 3, location_type: 2 }),
        makeStop({ id: 4, location_type: 3 })
      ]
      const { stopsByLocationType } = computeFilterCounts(stops, [])
      expect(stopsByLocationType[0]).toBe(2)
      expect(stopsByLocationType[2]).toBe(1)
      expect(stopsByLocationType[3]).toBe(1)
      expect(stopsByLocationType[1]).toBeUndefined()
    })
  })

  describe('stopsWithAssociations', () => {
    test('counts stops with external_reference.target_stop_id', () => {
      const stops = [
        makeStop({ id: 1, external_reference: { target_feed_onestop_id: 'f', target_stop_id: 'ext-1' } }),
        makeStop({ id: 2, external_reference: { target_feed_onestop_id: 'f', target_stop_id: 'ext-2' } }),
        makeStop({ id: 3 })
      ]
      expect(computeFilterCounts(stops, []).stopsWithAssociations).toBe(2)
    })

    test('does not count stops without external_reference', () => {
      const stops = [makeStop({ id: 1 }), makeStop({ id: 2 })]
      expect(computeFilterCounts(stops, []).stopsWithAssociations).toBe(0)
    })
  })

  describe('platformsWithoutAssociations', () => {
    test('counts platforms (location_type=0) with no external_reference', () => {
      const stops = [
        makeStop({ id: 1, location_type: 0 }),
        makeStop({ id: 2, location_type: 0 }),
        makeStop({ id: 3, location_type: 0, external_reference: { target_feed_onestop_id: 'f', target_stop_id: 'x' } }),
        makeStop({ id: 4, location_type: 2 }) // entrance, not counted
      ]
      expect(computeFilterCounts(stops, []).platformsWithoutAssociations).toBe(2)
    })
  })

  describe('entrancesWithoutAssociations', () => {
    test('counts entrances (location_type=2) with no external_reference', () => {
      const stops = [
        makeStop({ id: 1, location_type: 2 }),
        makeStop({ id: 2, location_type: 2, external_reference: { target_feed_onestop_id: 'f', target_stop_id: 'x' } }),
        makeStop({ id: 3, location_type: 0 }) // platform, not counted
      ]
      expect(computeFilterCounts(stops, []).entrancesWithoutAssociations).toBe(1)
    })
  })

  describe('stopsWithPairedPathways', () => {
    test('returns 0 when no pathways exist', () => {
      const stops = [makeStop({ id: 1 }), makeStop({ id: 2 })]
      expect(computeFilterCounts(stops, []).stopsWithPairedPathways).toBe(0)
    })

    test('returns 0 when pathways are one-directional with no reverse', () => {
      // Stop A has A→B outgoing only; stop B has A→B incoming only
      const stopA = makeStop({
        id: 1,
        pathways_from_stop: [{ id: 10, from_stop: { id: 1 }, to_stop: { id: 2 } }],
        pathways_to_stop: []
      })
      const stopB = makeStop({
        id: 2,
        pathways_from_stop: [],
        pathways_to_stop: [{ id: 10, from_stop: { id: 1 }, to_stop: { id: 2 } }]
      })
      expect(computeFilterCounts([stopA, stopB], []).stopsWithPairedPathways).toBe(0)
    })

    test('counts stops that participate in a paired (A→B + B→A) set', () => {
      // Both stops have the pathway in each direction listed in their from/to lists
      const stopA = makeStop({
        id: 1,
        pathways_from_stop: [{ id: 10, from_stop: { id: 1 }, to_stop: { id: 2 } }],
        pathways_to_stop: [{ id: 11, from_stop: { id: 2 }, to_stop: { id: 1 } }]
      })
      const stopB = makeStop({
        id: 2,
        pathways_from_stop: [{ id: 11, from_stop: { id: 2 }, to_stop: { id: 1 } }],
        pathways_to_stop: [{ id: 10, from_stop: { id: 1 }, to_stop: { id: 2 } }]
      })
      expect(computeFilterCounts([stopA, stopB], []).stopsWithPairedPathways).toBe(2)
    })
  })

  describe('pathwaysByMode', () => {
    test('counts pathways by pathway_mode', () => {
      const pathways = [
        makePathway({ id: 1, pathway_mode: 1 }),
        makePathway({ id: 2, pathway_mode: 1 }),
        makePathway({ id: 3, pathway_mode: 2 }),
        makePathway({ id: 4, pathway_mode: 5 })
      ]
      const { pathwaysByMode } = computeFilterCounts([], pathways)
      expect(pathwaysByMode[1]).toBe(2)
      expect(pathwaysByMode[2]).toBe(1)
      expect(pathwaysByMode[5]).toBe(1)
      expect(pathwaysByMode[3]).toBeUndefined()
    })
  })

  describe('pathwaysWithPairs', () => {
    test('returns 0 when all pathways are one-directional with no reverse', () => {
      const pathways = [
        makePathway({ id: 1, from_stop: { id: 1, stop_id: 'a' }, to_stop: { id: 2, stop_id: 'b' } })
      ]
      expect(computeFilterCounts([], pathways).pathwaysWithPairs).toBe(0)
    })

    test('counts both pathways when A→B and B→A both exist', () => {
      const pathways = [
        makePathway({ id: 1, from_stop: { id: 1, stop_id: 'a' }, to_stop: { id: 2, stop_id: 'b' } }),
        makePathway({ id: 2, from_stop: { id: 2, stop_id: 'b' }, to_stop: { id: 1, stop_id: 'a' } })
      ]
      expect(computeFilterCounts([], pathways).pathwaysWithPairs).toBe(2)
    })

    test('only counts pathways that have a reverse, not unpaired ones', () => {
      const pathways = [
        makePathway({ id: 1, from_stop: { id: 1, stop_id: 'a' }, to_stop: { id: 2, stop_id: 'b' } }),
        makePathway({ id: 2, from_stop: { id: 2, stop_id: 'b' }, to_stop: { id: 1, stop_id: 'a' } }),
        makePathway({ id: 3, from_stop: { id: 3, stop_id: 'c' }, to_stop: { id: 4, stop_id: 'd' } }) // no reverse
      ]
      expect(computeFilterCounts([], pathways).pathwaysWithPairs).toBe(2)
    })
  })

  describe('pathwaysOneway / pathwaysBidirectional', () => {
    test('counts one-directional pathways (is_bidirectional=0)', () => {
      const pathways = [
        makePathway({ id: 1, is_bidirectional: 0 }),
        makePathway({ id: 2, is_bidirectional: 0 }),
        makePathway({ id: 3, is_bidirectional: 1 })
      ]
      const counts = computeFilterCounts([], pathways)
      expect(counts.pathwaysOneway).toBe(2)
      expect(counts.pathwaysBidirectional).toBe(1)
    })

    test('counts bi-directional pathways (is_bidirectional=1)', () => {
      const pathways = [
        makePathway({ id: 1, is_bidirectional: 1 }),
        makePathway({ id: 2, is_bidirectional: 1 })
      ]
      const counts = computeFilterCounts([], pathways)
      expect(counts.pathwaysOneway).toBe(0)
      expect(counts.pathwaysBidirectional).toBe(2)
    })
  })
})
