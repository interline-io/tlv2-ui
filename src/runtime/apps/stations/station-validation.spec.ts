import { describe, test, expect } from 'vitest'
import { Stop, Pathway, Station } from './station'
import { validateStop, validatePathway, validateConnectivity } from './station-validation'
import type { StopData, PathwayData } from './types'

// Helper to create a minimal valid stop with sensible defaults
function makeStop (overrides: Partial<StopData> = {}): Stop {
  return new Stop({
    id: 1,
    stop_id: 'stop-1',
    stop_name: 'Test Stop',
    location_type: 3,
    geometry: { type: 'Point', coordinates: [-122.0, 37.0] },
    level: { id: 10, level_name: 'Ground' },
    pathways_from_stop: [{ id: 100, from_stop: { id: 1 }, to_stop: { id: 2 } }],
    pathways_to_stop: [{ id: 101, from_stop: { id: 3 }, to_stop: { id: 1 } }],
    ...overrides
  })
}

// Helper to create a minimal valid pathway
function makePathway (overrides: Partial<PathwayData> = {}): Pathway {
  return new Pathway({
    id: 1,
    pathway_id: 'pw-1',
    pathway_mode: 1,
    is_bidirectional: 1,
    from_stop: {
      id: 1,
      stop_id: 'from',
      level: { id: 10, level_name: 'Ground' },
      geometry: { type: 'Point', coordinates: [-122.0, 37.0] }
    },
    to_stop: {
      id: 2,
      stop_id: 'to',
      level: { id: 11, level_name: 'Upper' },
      geometry: { type: 'Point', coordinates: [-122.001, 37.0] }
    },
    ...overrides
  })
}

function hasMessage (errs: { message: string }[], substring: string): boolean {
  return errs.some(e => e.message.includes(substring))
}

describe('validateStop', () => {
  describe('stop_name required', () => {
    test('error when non-generic node has no stop_name', () => {
      const stop = makeStop({ location_type: 0, stop_name: '' })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Stop name is required')).toBe(true)
    })

    test('error when stop_name is whitespace only', () => {
      const stop = makeStop({ location_type: 2, stop_name: '   ' })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Stop name is required')).toBe(true)
    })

    test('no error when generic node (location_type=3) has no stop_name', () => {
      const stop = makeStop({ location_type: 3, stop_name: '' })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Stop name is required')).toBe(false)
    })

    test('no error when non-generic node has a stop_name', () => {
      const stop = makeStop({ location_type: 0, stop_name: 'Platform A' })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Stop name is required')).toBe(false)
    })
  })

  describe('coordinates required', () => {
    test('error when non-generic node has no geometry', () => {
      const stop = makeStop({ location_type: 2, geometry: undefined })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Coordinates are required')).toBe(true)
    })

    test('no error when generic node has no geometry', () => {
      const stop = makeStop({ location_type: 3, geometry: undefined })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Coordinates are required')).toBe(false)
    })
  })

  describe('level assignment', () => {
    test('error when stop has no level assignment', () => {
      const stop = makeStop({ level: undefined })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'stop should have a level assignment')).toBe(true)
    })

    test('no error when stop has a level', () => {
      const stop = makeStop({ level: { id: 10, level_name: 'Ground' } })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'stop should have a level assignment')).toBe(false)
    })
  })

  describe('target stop location_type mismatch', () => {
    test('error when external reference target has different location_type', () => {
      const stop = makeStop({
        location_type: 0,
        stop_name: 'Platform',
        external_reference: {
          target_feed_onestop_id: 'feed-1',
          target_stop_id: 'ext-1',
          target_active_stop: { id: 99, location_type: 2 }
        }
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'same location_type as the target stop')).toBe(true)
    })

    test('no error when external reference target has same location_type', () => {
      const stop = makeStop({
        location_type: 0,
        stop_name: 'Platform',
        external_reference: {
          target_feed_onestop_id: 'feed-1',
          target_stop_id: 'ext-1',
          target_active_stop: { id: 99, location_type: 0 }
        }
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'same location_type as the target stop')).toBe(false)
    })
  })

  describe('pathways on station', () => {
    test('error when station (location_type=1) has pathways_from_stop', () => {
      const stop = makeStop({
        location_type: 1,
        stop_name: 'Station',
        pathways_from_stop: [{ id: 100, from_stop: { id: 1 }, to_stop: { id: 2 } }],
        pathways_to_stop: []
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Pathways cannot use Station')).toBe(true)
    })

    test('error when station (location_type=1) has pathways_to_stop', () => {
      const stop = makeStop({
        location_type: 1,
        stop_name: 'Station',
        pathways_from_stop: [],
        pathways_to_stop: [{ id: 100, from_stop: { id: 2 }, to_stop: { id: 1 } }]
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Pathways cannot use Station')).toBe(true)
    })

    test('no error when station has no pathways', () => {
      const stop = makeStop({
        location_type: 1,
        stop_name: 'Station',
        pathways_from_stop: [],
        pathways_to_stop: []
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Pathways cannot use Station')).toBe(false)
    })
  })

  describe('self as parent_station', () => {
    test('error when stop is its own parent', () => {
      const stop = makeStop({
        id: 5,
        parent: { id: 5, location_type: 1 }
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Cannot have self as parent_station')).toBe(true)
    })

    test('no error when parent is different stop', () => {
      const stop = makeStop({
        id: 5,
        parent: { id: 6, location_type: 1 }
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Cannot have self as parent_station')).toBe(false)
    })
  })

  describe('parent must be station', () => {
    test('error when non-boarding-area has non-station parent', () => {
      const stop = makeStop({
        location_type: 3,
        parent: { id: 6, location_type: 0 }
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'parent_station must be a Station')).toBe(true)
    })

    test('no error when non-boarding-area has station parent', () => {
      const stop = makeStop({
        location_type: 3,
        parent: { id: 6, location_type: 1 }
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'parent_station must be a Station')).toBe(false)
    })

    test('no error for boarding area with platform parent (checked separately)', () => {
      const stop = makeStop({
        location_type: 4,
        stop_name: 'Boarding Area',
        parent: { id: 6, location_type: 0 }
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'parent_station must be a Station')).toBe(false)
    })
  })

  describe('boarding area parent', () => {
    test('error when boarding area has no parent', () => {
      const stop = makeStop({
        location_type: 4,
        stop_name: 'Boarding Area',
        parent: undefined
      })
      // Stop constructor sets parent to { id: undefined } when no parent data
      stop.parent = null as any
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Boarding areas require a Platform')).toBe(true)
    })

    test('error when boarding area has non-platform parent', () => {
      const stop = makeStop({
        location_type: 4,
        stop_name: 'Boarding Area',
        parent: { id: 6, location_type: 1 }
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Boarding areas require a Platform')).toBe(true)
    })

    test('no error when boarding area has platform parent', () => {
      const stop = makeStop({
        location_type: 4,
        stop_name: 'Boarding Area',
        parent: { id: 6, location_type: 0 }
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Boarding areas require a Platform')).toBe(false)
    })
  })

  describe('unresolvable external reference', () => {
    test('error when external reference target_active_stop is null', () => {
      const stop = makeStop({
        external_reference: {
          target_feed_onestop_id: 'feed-1',
          target_stop_id: 'stop-x',
          target_active_stop: undefined
        }
      })
      // Set target_active_stop to null explicitly (the validation checks for null)
      stop.external_reference!.target_active_stop = null as any
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'cannot resolve reference')).toBe(true)
    })

    test('no error when no external reference', () => {
      const stop = makeStop({ external_reference: undefined })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'cannot resolve reference')).toBe(false)
    })
  })

  describe('missing connecting pathway', () => {
    test('error when non-station stop has no pathways and no boarding areas', () => {
      const stop = makeStop({
        location_type: 2,
        stop_name: 'Entrance',
        pathways_from_stop: [],
        pathways_to_stop: []
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'require at least one connecting pathway')).toBe(true)
    })

    test('no error for station (location_type=1) without pathways', () => {
      const stop = makeStop({
        location_type: 1,
        stop_name: 'Station',
        pathways_from_stop: [],
        pathways_to_stop: []
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'require at least one connecting pathway')).toBe(false)
    })

    test('no error for platform with boarding areas and no pathways', () => {
      const platform = makeStop({
        id: 10,
        location_type: 0,
        stop_name: 'Platform',
        pathways_from_stop: [],
        pathways_to_stop: []
      })
      const boardingArea = makeStop({
        id: 11,
        location_type: 4,
        stop_name: 'Boarding',
        parent: { id: 10, location_type: 0 }
      })
      const errs = validateStop(platform, [platform, boardingArea])
      expect(hasMessage(errs, 'require at least one connecting pathway')).toBe(false)
    })
  })

  describe('generic node pathway count', () => {
    test('error when generic node has fewer than 2 pathways', () => {
      const stop = makeStop({
        location_type: 3,
        pathways_from_stop: [{ id: 100, from_stop: { id: 1 }, to_stop: { id: 2 } }],
        pathways_to_stop: []
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'generic nodes should connect to at least two pathways')).toBe(true)
    })

    test('no error when generic node has 2+ pathways', () => {
      const stop = makeStop({
        location_type: 3,
        pathways_from_stop: [{ id: 100, from_stop: { id: 1 }, to_stop: { id: 2 } }],
        pathways_to_stop: [{ id: 101, from_stop: { id: 3 }, to_stop: { id: 1 } }]
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'generic nodes should connect to at least two pathways')).toBe(false)
    })
  })

  describe('platform with boarding areas has pathways', () => {
    test('error when platform with boarding areas also has pathways', () => {
      const platform = makeStop({
        id: 10,
        location_type: 0,
        stop_name: 'Platform',
        pathways_from_stop: [{ id: 100, from_stop: { id: 10 }, to_stop: { id: 20 } }],
        pathways_to_stop: []
      })
      const boardingArea = makeStop({
        id: 11,
        location_type: 4,
        stop_name: 'Boarding',
        parent: { id: 10, location_type: 0 }
      })
      const errs = validateStop(platform, [platform, boardingArea])
      expect(hasMessage(errs, 'Platforms with boarding areas must not have pathways')).toBe(true)
    })
  })

  describe('do not transit through platforms', () => {
    test('warning when platform without boarding areas has more than 1 pathway', () => {
      const stop = makeStop({
        location_type: 0,
        stop_name: 'Platform',
        pathways_from_stop: [
          { id: 100, from_stop: { id: 1 }, to_stop: { id: 2 } },
          { id: 101, from_stop: { id: 1 }, to_stop: { id: 3 } }
        ],
        pathways_to_stop: []
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'do not transit through platforms')).toBe(true)
    })

    test('no warning when platform has exactly 1 pathway', () => {
      const stop = makeStop({
        location_type: 0,
        stop_name: 'Platform',
        pathways_from_stop: [{ id: 100, from_stop: { id: 1 }, to_stop: { id: 2 } }],
        pathways_to_stop: []
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'do not transit through platforms')).toBe(false)
    })
  })

  describe('boarding area pathway to parent', () => {
    test('info when boarding area has a pathway connecting to its parent', () => {
      const stop = makeStop({
        id: 11,
        location_type: 4,
        stop_name: 'Boarding Area',
        parent: { id: 10, location_type: 0 },
        pathways_from_stop: [{ id: 100, from_stop: { id: 11 }, to_stop: { id: 10 } }],
        pathways_to_stop: []
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Boarding areas connect to their parent platform via the parent_station setting')).toBe(true)
    })

    test('no info when boarding area pathways do not connect to parent', () => {
      const stop = makeStop({
        id: 11,
        location_type: 4,
        stop_name: 'Boarding Area',
        parent: { id: 10, location_type: 0 },
        pathways_from_stop: [{ id: 100, from_stop: { id: 11 }, to_stop: { id: 20 } }],
        pathways_to_stop: []
      })
      const errs = validateStop(stop, [])
      expect(hasMessage(errs, 'Boarding areas connect to their parent platform via the parent_station setting')).toBe(false)
    })
  })

  describe('valid stop produces no unexpected errors', () => {
    test('well-formed generic node with level and 2 pathways has no errors', () => {
      const stop = makeStop({
        location_type: 3,
        stop_name: 'Node',
        geometry: { type: 'Point', coordinates: [-122.0, 37.0] },
        level: { id: 10, level_name: 'Ground' },
        pathways_from_stop: [{ id: 100, from_stop: { id: 1 }, to_stop: { id: 2 } }],
        pathways_to_stop: [{ id: 101, from_stop: { id: 3 }, to_stop: { id: 1 } }],
        parent: { id: 5, location_type: 1 }
      })
      const errs = validateStop(stop, [])
      expect(errs).toEqual([])
    })
  })
})

describe('validatePathway', () => {
  describe('pathway endpoint is station', () => {
    test('error when from_stop is a station (location_type=1)', () => {
      const pw = makePathway({
        from_stop: { id: 1, stop_id: 'station', location_type: 1, level: { id: 10, level_name: 'G' } },
        to_stop: { id: 2, stop_id: 'node', location_type: 3, level: { id: 10, level_name: 'G' } }
      })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'Pathway endpoints must not be stations')).toBe(true)
      expect(errs.find(e => e.message.includes('must not be stations'))?.severity).toBe('critical')
    })

    test('error when to_stop is a station (location_type=1)', () => {
      const pw = makePathway({
        from_stop: { id: 1, stop_id: 'node', location_type: 3, level: { id: 10, level_name: 'G' } },
        to_stop: { id: 2, stop_id: 'station', location_type: 1, level: { id: 10, level_name: 'G' } }
      })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'Pathway endpoints must not be stations')).toBe(true)
    })

    test('no error when endpoints are valid location types', () => {
      const pw = makePathway({
        from_stop: { id: 1, stop_id: 'entrance', location_type: 2, level: { id: 10, level_name: 'G' } },
        to_stop: { id: 2, stop_id: 'node', location_type: 3, level: { id: 11, level_name: 'U' } }
      })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'must not be stations')).toBe(false)
    })
  })

  describe('pathway to platform with boarding areas', () => {
    test('error when from_stop is a platform with boarding areas', () => {
      const pw = makePathway({
        from_stop: { id: 10, stop_id: 'platform', stop_name: 'Platform A', location_type: 0, level: { id: 10, level_name: 'G' } },
        to_stop: { id: 20, stop_id: 'node', location_type: 3, level: { id: 10, level_name: 'G' } }
      })
      const boardingArea = makeStop({ id: 11, location_type: 4, stop_name: 'BA', parent: { id: 10, location_type: 0 } })
      const errs = validatePathway(pw, [makeStop({ id: 10, location_type: 0 }), boardingArea])
      expect(hasMessage(errs, 'which has boarding areas')).toBe(true)
      expect(errs.find(e => e.message.includes('boarding areas'))?.severity).toBe('critical')
    })

    test('error when to_stop is a platform with boarding areas', () => {
      const pw = makePathway({
        from_stop: { id: 20, stop_id: 'node', location_type: 3, level: { id: 10, level_name: 'G' } },
        to_stop: { id: 10, stop_id: 'platform', stop_name: 'Platform A', location_type: 0, level: { id: 10, level_name: 'G' } }
      })
      const boardingArea = makeStop({ id: 11, location_type: 4, stop_name: 'BA', parent: { id: 10, location_type: 0 } })
      const errs = validatePathway(pw, [makeStop({ id: 10, location_type: 0 }), boardingArea])
      expect(hasMessage(errs, 'which has boarding areas')).toBe(true)
    })

    test('no error when platform has no boarding areas', () => {
      const pw = makePathway({
        from_stop: { id: 10, stop_id: 'platform', location_type: 0, level: { id: 10, level_name: 'G' } },
        to_stop: { id: 20, stop_id: 'node', location_type: 3, level: { id: 11, level_name: 'U' } }
      })
      const errs = validatePathway(pw, [makeStop({ id: 10, location_type: 0 })])
      expect(hasMessage(errs, 'boarding areas')).toBe(false)
    })

    test('no error when stationStops not provided', () => {
      const pw = makePathway({
        from_stop: { id: 10, stop_id: 'platform', location_type: 0, level: { id: 10, level_name: 'G' } },
        to_stop: { id: 20, stop_id: 'node', location_type: 3, level: { id: 11, level_name: 'U' } }
      })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'boarding areas')).toBe(false)
    })
  })

  describe('pathway loop', () => {
    test('error when from_stop and to_stop are the same', () => {
      const pw = makePathway({
        from_stop: { id: 1, stop_id: 'a', level: { id: 10, level_name: 'G' } },
        to_stop: { id: 1, stop_id: 'a', level: { id: 10, level_name: 'G' } }
      })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'pathway is a loop')).toBe(true)
    })

    test('no error when from_stop and to_stop differ', () => {
      const pw = makePathway()
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'pathway is a loop')).toBe(false)
    })
  })

  describe('endpoint level assignments', () => {
    test('critical error when elevator from_stop has no level', () => {
      const pw = makePathway({
        pathway_mode: 5,
        from_stop: { id: 1, stop_id: 'from' },
        to_stop: { id: 2, stop_id: 'to', level: { id: 11, level_name: 'Upper' } }
      })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'Elevator pathway endpoint stops must have level assignments')).toBe(true)
      expect(errs.find(e => e.message.includes('Elevator'))?.severity).toBe('critical')
    })

    test('critical error when elevator to_stop has no level', () => {
      const pw = makePathway({
        pathway_mode: 5,
        from_stop: { id: 1, stop_id: 'from', level: { id: 10, level_name: 'Ground' } },
        to_stop: { id: 2, stop_id: 'to' }
      })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'Elevator pathway endpoint stops must have level assignments')).toBe(true)
      expect(errs.find(e => e.message.includes('Elevator'))?.severity).toBe('critical')
    })

    test('interline error when non-elevator from_stop has no level', () => {
      const pw = makePathway({
        pathway_mode: 1,
        from_stop: { id: 1, stop_id: 'from' },
        to_stop: { id: 2, stop_id: 'to', level: { id: 11, level_name: 'Upper' } }
      })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'Interline recommendation: pathway endpoint stops should have level assignments')).toBe(true)
      expect(errs.find(e => e.message.includes('endpoint stops'))?.severity).toBe('interline')
    })

    test('no error when both stops have levels', () => {
      const pw = makePathway()
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'level assignments')).toBe(false)
    })
  })

  describe('exit-gate bidirectional', () => {
    test('error when exit-gate (mode=7) is bidirectional', () => {
      const pw = makePathway({ pathway_mode: 7, is_bidirectional: 1 })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'Exit-gate pathways must be one-way')).toBe(true)
    })

    test('no error when exit-gate is one-way', () => {
      const pw = makePathway({ pathway_mode: 7, is_bidirectional: 0 })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'Exit-gate pathways must be one-way')).toBe(false)
    })

    test('no error when non-exit-gate is bidirectional', () => {
      const pw = makePathway({ pathway_mode: 1, is_bidirectional: 1 })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'Exit-gate pathways must be one-way')).toBe(false)
    })
  })

  describe('stairs stair_count', () => {
    test('error when stairs on same level have no stair_count', () => {
      const pw = makePathway({
        pathway_mode: 2,
        stair_count: undefined,
        from_stop: { id: 1, stop_id: 'from', level: { id: 10, level_name: 'Ground' } },
        to_stop: { id: 2, stop_id: 'to', level: { id: 10, level_name: 'Ground' } }
      })
      // stair_count defaults to undefined from constructor; set to null to match the check
      pw.stair_count = null as any
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'stairs pathways should have a stair_count')).toBe(true)
    })

    test('no error when stairs connect different levels without stair_count', () => {
      const pw = makePathway({
        pathway_mode: 2,
        stair_count: undefined,
        from_stop: { id: 1, stop_id: 'from', level: { id: 10, level_name: 'Ground' } },
        to_stop: { id: 2, stop_id: 'to', level: { id: 11, level_name: 'Upper' } }
      })
      pw.stair_count = null as any
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'stairs pathways should have a stair_count')).toBe(false)
    })

    test('no error when stairs have a stair_count', () => {
      const pw = makePathway({
        pathway_mode: 2,
        stair_count: 12,
        from_stop: { id: 1, stop_id: 'from', level: { id: 10, level_name: 'Ground' } },
        to_stop: { id: 2, stop_id: 'to', level: { id: 10, level_name: 'Ground' } }
      })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'stairs pathways should have a stair_count')).toBe(false)
    })
  })

  describe('length and traversal_time', () => {
    test('info when length is missing (default options)', () => {
      const pw = makePathway({ length: undefined })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'missing a length value')).toBe(true)
      expect(errs.find(e => e.message.includes('length'))?.severity).toBe('info')
    })

    test('info when traversal_time is missing (default options)', () => {
      const pw = makePathway({ traversal_time: undefined })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'missing a traversal_time value')).toBe(true)
      expect(errs.find(e => e.message.includes('traversal_time'))?.severity).toBe('info')
    })

    test('no error when length and traversal_time are present', () => {
      const pw = makePathway({ length: 50, traversal_time: 30 })
      const errs = validatePathway(pw)
      expect(hasMessage(errs, 'missing a length')).toBe(false)
      expect(hasMessage(errs, 'missing a traversal_time')).toBe(false)
    })

    test('no error when requireLengthAndTraversalTime is false', () => {
      const pw = makePathway({ length: undefined, traversal_time: undefined })
      const errs = validatePathway(pw, [], { requireLengthAndTraversalTime: false })
      expect(hasMessage(errs, 'missing a length')).toBe(false)
      expect(hasMessage(errs, 'missing a traversal_time')).toBe(false)
    })
  })

  describe('valid pathway produces no errors', () => {
    test('well-formed walkway has no errors', () => {
      const pw = makePathway({
        pathway_mode: 1,
        is_bidirectional: 1,
        length: 50,
        traversal_time: 30
      })
      const errs = validatePathway(pw)
      expect(errs).toEqual([])
    })

    test('well-formed walkway has no errors with editor options', () => {
      const pw = makePathway({
        pathway_mode: 1,
        is_bidirectional: 1
      })
      const errs = validatePathway(pw, [], { requireLengthAndTraversalTime: false })
      expect(errs).toEqual([])
    })
  })
})

describe('validateConnectivity', () => {
  test('returns empty when no entrances exist', () => {
    const station = new Station()
    // Add only generic nodes, no entrances
    station.addStops([
      makeStop({ id: 1, location_type: 3 }),
      makeStop({ id: 2, location_type: 3 })
    ])
    const results = validateConnectivity(station)
    expect(results).toEqual([])
  })

  test('returns results when entrance cannot reach other stops', () => {
    const entrance = makeStop({
      id: 1,
      location_type: 2,
      stop_name: 'Entrance',
      pathways_from_stop: [],
      pathways_to_stop: []
    })
    const platform = makeStop({
      id: 2,
      location_type: 0,
      stop_name: 'Platform',
      pathways_from_stop: [],
      pathways_to_stop: []
    })
    const station = new Station()
    station.addStops([entrance, platform])
    const results = validateConnectivity(station)
    expect(results.length).toBeGreaterThan(0)
    expect(results[0]?.stop.id).toBe(1)
  })

  test('returns empty when all stops are reachable from entrance', () => {
    const entrance = makeStop({
      id: 1,
      location_type: 2,
      stop_name: 'Entrance',
      geometry: { type: 'Point', coordinates: [-122.0, 37.0] },
      pathways_from_stop: [{
        id: 100,
        pathway_id: 'pw-1',
        pathway_mode: 1,
        is_bidirectional: 1,
        from_stop: { id: 1 },
        to_stop: { id: 2 }
      }],
      pathways_to_stop: []
    })
    const platform = makeStop({
      id: 2,
      location_type: 0,
      stop_name: 'Platform',
      geometry: { type: 'Point', coordinates: [-122.001, 37.0] },
      pathways_from_stop: [],
      pathways_to_stop: [{
        id: 100,
        pathway_id: 'pw-1',
        pathway_mode: 1,
        is_bidirectional: 1,
        from_stop: { id: 1 },
        to_stop: { id: 2 }
      }]
    })
    const station = new Station()
    station.addStops([entrance, platform])
    const results = validateConnectivity(station)
    // All paths should have info (OK) messages, so no error paths → empty result
    expect(results.every(r => r.paths.every(p => p.info))).toBe(true)
  })
})
