import { describe, test, expect, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { Stop, Pathway, Station } from '../station'
import { usePathwaySelection } from './usePathwaySelection'
import type { StopData, PathwayData } from '../types'

// ─── Factories ────────────────────────────────────────────────────────────────

function makeStop (id: number, overrides: Partial<StopData> = {}): Stop {
  return new Stop({
    id,
    stop_id: `stop-${id}`,
    stop_name: `Stop ${id}`,
    location_type: 3,
    geometry: { type: 'Point', coordinates: [0, 0] },
    pathways_from_stop: [],
    pathways_to_stop: [],
    ...overrides
  })
}

let nextPwId = 0

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

function makeFilledStation (stops: Stop[]): Station {
  const st = new Station({
    id: 100,
    stop_id: 'station',
    stop_name: 'Station',
    location_type: 1,
    geometry: { type: 'Point', coordinates: [0, 0] }
  })
  st.addStops(stops)
  return st
}

// ─── Setup helper ─────────────────────────────────────────────────────────────

function setup (stops: Stop[] = []) {
  const stationRef = ref(makeFilledStation(stops))
  const selectedProfile = ref('Pathways: Default')
  const toasts: string[] = []
  const sel = usePathwaySelection(stationRef, selectedProfile, msg => toasts.push(msg))
  return { ...sel, stationRef, toasts }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('usePathwaySelection', () => {
  beforeEach(() => { nextPwId = 0 })

  // ── Initial state ──────────────────────────────────────────────────────────

  describe('initial state', () => {
    test('selectMode is "select"', () => {
      const { selectMode } = setup()
      expect(selectMode.value).toBe('select')
    })

    test('selectedStops and selectedPathways are empty', () => {
      const { selectedStops, selectedPathways } = setup()
      expect(selectedStops.value).toHaveLength(0)
      expect(selectedPathways.value).toHaveLength(0)
    })

    test('selectedStop and selectedSource are null', () => {
      const { selectedStop, selectedSource } = setup()
      expect(selectedStop.value).toBeNull()
      expect(selectedSource.value).toBeNull()
    })
  })

  // ── selectStop ─────────────────────────────────────────────────────────────

  describe('selectStop', () => {
    test('null clears selection and resets mode to select', () => {
      const { selectStop, selectMode, selectedStops } = setup([makeStop(1)])
      selectStop(1)
      selectStop(null)
      expect(selectMode.value).toBe('select')
      expect(selectedStops.value).toHaveLength(0)
    })

    test('unknown ID is a no-op', () => {
      const { selectStop, selectMode, selectedStops } = setup([makeStop(1)])
      selectStop(999)
      expect(selectMode.value).toBe('select')
      expect(selectedStops.value).toHaveLength(0)
    })

    test('first click enters edit-node mode with one stop', () => {
      const { selectStop, selectMode, selectedStops } = setup([makeStop(1)])
      selectStop(1)
      expect(selectMode.value).toBe('edit-node')
      expect(selectedStops.value).toHaveLength(1)
      expect(selectedStops.value[0]!.id).toBe(1)
    })

    test('second click on a different stop enters add-pathway mode with two stops', () => {
      const { selectStop, selectMode, selectedStops } = setup([makeStop(1), makeStop(2)])
      selectStop(1)
      selectStop(2)
      expect(selectMode.value).toBe('add-pathway')
      expect(selectedStops.value).toHaveLength(2)
      expect(selectedStops.value[0]!.id).toBe(1)
      expect(selectedStops.value[1]!.id).toBe(2)
    })

    test('second click on the same stop deselects and resets to select mode', () => {
      const { selectStop, selectMode, selectedStops } = setup([makeStop(1)])
      selectStop(1)
      selectStop(1)
      expect(selectMode.value).toBe('select')
      expect(selectedStops.value).toHaveLength(0)
    })

    test('selecting a stop clears any selected pathways', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      connectStops(a, b)
      const { selectStop, selectPathway, selectedPathways } = setup([a, b])
      selectPathway(a.pathways_from_stop[0]!.id!)
      expect(selectedPathways.value).toHaveLength(1)
      selectStop(1)
      expect(selectedPathways.value).toHaveLength(0)
    })

    describe('find-route mode', () => {
      test('second click replaces slot 2 while preserving slot 1', () => {
        const { selectStop, selectMode, selectedStops } = setup([makeStop(1), makeStop(2), makeStop(3)])
        selectStop(1)
        selectStop(2)
        selectMode.value = 'find-route'
        selectStop(3)
        expect(selectedStops.value[0]!.id).toBe(1)
        expect(selectedStops.value[1]!.id).toBe(3)
      })

      test('clicking the current last stop clears the selection', () => {
        const { selectStop, selectMode, selectedStops } = setup([makeStop(1), makeStop(2)])
        selectStop(1)
        selectStop(2)
        selectMode.value = 'find-route'
        selectStop(2)
        expect(selectedStops.value).toHaveLength(0)
      })
    })
  })

  // ── selectPathway ──────────────────────────────────────────────────────────

  describe('selectPathway', () => {
    test('null clears selection and resets mode to select', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      connectStops(a, b)
      const { selectPathway, selectMode, selectedPathways } = setup([a, b])
      selectPathway(a.pathways_from_stop[0]!.id!)
      selectPathway(null)
      expect(selectMode.value).toBe('select')
      expect(selectedPathways.value).toHaveLength(0)
    })

    test('valid pathway enters edit-pathway mode', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      const pw = connectStops(a, b)
      const { selectPathway, selectMode, selectedPathways } = setup([a, b])
      selectPathway(pw.id!)
      expect(selectMode.value).toBe('edit-pathway')
      expect(selectedPathways.value).toHaveLength(1)
      expect(selectedPathways.value[0]!.id).toBe(pw.id)
    })

    test('clicking the same pathway a second time deselects it', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      const pw = connectStops(a, b)
      const { selectPathway, selectMode, selectedPathways } = setup([a, b])
      selectPathway(pw.id!)
      selectPathway(pw.id!)
      expect(selectMode.value).toBe('select')
      expect(selectedPathways.value).toHaveLength(0)
    })

    test('selecting a pathway clears any selected stops', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      const pw = connectStops(a, b)
      const { selectStop, selectPathway, selectedStops } = setup([a, b])
      selectStop(1)
      expect(selectedStops.value).toHaveLength(1)
      selectPathway(pw.id!)
      expect(selectedStops.value).toHaveLength(0)
    })

    test('unknown ID clears selection and resets mode to select', () => {
      const { selectPathway, selectMode } = setup([makeStop(1)])
      selectPathway(999)
      expect(selectMode.value).toBe('select')
    })
  })

  // ── selectPath ─────────────────────────────────────────────────────────────

  describe('selectPath', () => {
    test('enters find-route mode with the two given stops', () => {
      const { selectPath, selectMode, selectedStops } = setup([makeStop(1), makeStop(2)])
      selectPath(1, 2)
      expect(selectMode.value).toBe('find-route')
      expect(selectedStops.value[0]!.id).toBe(1)
      expect(selectedStops.value[1]!.id).toBe(2)
    })

    test('is a no-op when station is null', () => {
      const stationRef = ref<Station | null>(null)
      const sel = usePathwaySelection(stationRef, ref('Pathways: Default'), () => {})
      sel.selectPath(1, 2)
      expect(sel.selectMode.value).toBe('select')
      expect(sel.selectedStops.value).toHaveLength(0)
    })
  })

  // ── unselectAll ────────────────────────────────────────────────────────────

  describe('unselectAll', () => {
    test('resets all state to initial defaults', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      connectStops(a, b)
      const { selectStop, selectPoint, unselectAll,
        selectMode, selectedStops, selectedPathways,
        selectedPoint, hoverStopId, hoverPathwayId, lastFilterApplied } = setup([a, b])

      selectStop(1)
      selectPoint({ lng: 1, lat: 2 })
      hoverStopId.value = 5
      hoverPathwayId.value = 7
      lastFilterApplied.value = 'some filter'

      unselectAll()

      expect(selectMode.value).toBe('select')
      expect(selectedStops.value).toHaveLength(0)
      expect(selectedPathways.value).toHaveLength(0)
      expect(selectedPoint.value).toBeNull()
      expect(hoverStopId.value).toBeNull()
      expect(hoverPathwayId.value).toBeNull()
      expect(lastFilterApplied.value).toBe('')
    })
  })

  // ── add-node mode watch ────────────────────────────────────────────────────

  describe('add-node mode watch', () => {
    test('entering add-node mode clears selected stops and pathways', async () => {
      const a = makeStop(1)
      const b = makeStop(2)
      connectStops(a, b)
      const { selectStop, selectMode, selectedStops, selectedPathways } = setup([a, b])

      selectStop(1)
      expect(selectedStops.value).toHaveLength(1)

      selectMode.value = 'add-node'
      await nextTick()

      expect(selectedStops.value).toHaveLength(0)
      expect(selectedPathways.value).toHaveLength(0)
    })
  })

  // ── selectedStop computed ──────────────────────────────────────────────────

  describe('selectedStop computed', () => {
    test('is null when nothing is selected', () => {
      const { selectedStop } = setup([makeStop(1)])
      expect(selectedStop.value).toBeNull()
    })

    test('is the selected stop when one is selected', () => {
      const { selectStop, selectedStop } = setup([makeStop(1)])
      selectStop(1)
      expect(selectedStop.value?.id).toBe(1)
    })

    test('is the second stop (destination) when two are selected', () => {
      const { selectStop, selectedStop } = setup([makeStop(1), makeStop(2)])
      selectStop(1)
      selectStop(2)
      expect(selectedStop.value?.id).toBe(2)
    })
  })

  // ── selectedSource computed ────────────────────────────────────────────────

  describe('selectedSource computed', () => {
    test('is null when fewer than 2 stops are selected', () => {
      const { selectStop, selectedSource } = setup([makeStop(1)])
      selectStop(1)
      expect(selectedSource.value).toBeNull()
    })

    test('is the first stop (source) when two stops are selected', () => {
      const { selectStop, selectedSource } = setup([makeStop(1), makeStop(2)])
      selectStop(1)
      selectStop(2)
      expect(selectedSource.value?.id).toBe(1)
    })
  })

  // ── selectedPath computed ──────────────────────────────────────────────────

  describe('selectedPath computed', () => {
    test('is null when not in find-route mode', () => {
      const { selectedPath } = setup([makeStop(1), makeStop(2)])
      expect(selectedPath.value).toBeNull()
    })

    test('is null when fewer than 2 stops are selected', () => {
      const { selectStop, selectMode, selectedPath } = setup([makeStop(1)])
      selectStop(1)
      selectMode.value = 'find-route'
      expect(selectedPath.value).toBeNull()
    })

    test('returns route edges for a connected station', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      const pw = connectStops(a, b, { traversal_time: 30 })
      const { selectPath, selectedPath } = setup([a, b])
      selectPath(1, 2)
      expect(selectedPath.value).toHaveLength(1)
      expect(selectedPath.value![0]!.pathway.id).toBe(pw.id)
      expect(selectedPath.value![0]!.cost).toBe(30)
    })

    test('returns an empty array when stops are not connected', () => {
      const { selectPath, selectedPath } = setup([makeStop(1), makeStop(2)])
      selectPath(1, 2)
      expect(selectedPath.value).toHaveLength(0)
    })
  })

  // ── pathwayIndex computed ──────────────────────────────────────────────────

  describe('pathwayIndex computed', () => {
    test('maps pathway IDs to their Pathway objects', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      const pw = connectStops(a, b)
      const { pathwayIndex } = setup([a, b])
      expect(pathwayIndex.value[pw.id!]).toBeDefined()
      expect(pathwayIndex.value[pw.id!]!.id).toBe(pw.id)
    })

    test('is empty when the station has no pathways', () => {
      const { pathwayIndex } = setup([makeStop(1)])
      expect(Object.keys(pathwayIndex.value)).toHaveLength(0)
    })
  })

  // ── filter methods ─────────────────────────────────────────────────────────

  describe('filter methods', () => {
    test('selectLocationTypes selects stops matching that type', () => {
      const stops = [
        makeStop(1, { location_type: 0 }),
        makeStop(2, { location_type: 0 }),
        makeStop(3, { location_type: 2 })
      ]
      const { selectLocationTypes, selectedStops } = setup(stops)
      selectLocationTypes(0)
      expect(selectedStops.value).toHaveLength(2)
      expect(selectedStops.value.every(s => s.location_type === 0)).toBe(true)
    })

    test('selectLocationTypes sets lastFilterApplied', () => {
      const { selectLocationTypes, lastFilterApplied } = setup([makeStop(1, { location_type: 0 })])
      selectLocationTypes(0)
      expect(lastFilterApplied.value).toBe('Stops: Platform')
    })

    test('selectPathwayModes selects pathways of that mode', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      const c = makeStop(3)
      connectStops(a, b, { pathway_mode: 1 })
      connectStops(b, c, { pathway_mode: 2 })
      const { selectPathwayModes, selectedPathways } = setup([a, b, c])
      selectPathwayModes(2)
      expect(selectedPathways.value).toHaveLength(1)
      expect(selectedPathways.value[0]!.pathway_mode).toBe(2)
    })

    test('selectStopsWithAssociations selects stops that have an external reference', () => {
      const stops = [
        makeStop(1, { external_reference: { target_feed_onestop_id: 'f', target_stop_id: 'ext-1' } }),
        makeStop(2),
        makeStop(3, { external_reference: { target_feed_onestop_id: 'f', target_stop_id: 'ext-3' } })
      ]
      const { selectStopsWithAssociations, selectedStops } = setup(stops)
      selectStopsWithAssociations()
      expect(selectedStops.value.map(s => s.id)).toEqual(expect.arrayContaining([1, 3]))
      expect(selectedStops.value).toHaveLength(2)
    })

    test('selectPathwaysOneway selects non-bidirectional pathways', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      const c = makeStop(3)
      connectStops(a, b, { is_bidirectional: 0 })
      connectStops(b, c, { is_bidirectional: 1 })
      const { selectPathwaysOneway, selectedPathways } = setup([a, b, c])
      selectPathwaysOneway()
      expect(selectedPathways.value).toHaveLength(1)
      expect(selectedPathways.value[0]!.is_bidirectional).toBe(0)
    })

    test('selectPathwaysBidirectional selects bidirectional pathways', () => {
      const a = makeStop(1)
      const b = makeStop(2)
      const c = makeStop(3)
      connectStops(a, b, { is_bidirectional: 1 })
      connectStops(b, c, { is_bidirectional: 0 })
      const { selectPathwaysBidirectional, selectedPathways } = setup([a, b, c])
      selectPathwaysBidirectional()
      expect(selectedPathways.value).toHaveLength(1)
      expect(selectedPathways.value[0]!.is_bidirectional).toBe(1)
    })

    test('filter resets selectMode to "select"', () => {
      const { selectStop, selectLocationTypes, selectMode } = setup([makeStop(1, { location_type: 0 })])
      selectStop(1)
      expect(selectMode.value).toBe('edit-node')
      selectLocationTypes(0)
      expect(selectMode.value).toBe('select')
    })

    test('filter calls showToast when no results are found', () => {
      const { selectLocationTypes, toasts } = setup([makeStop(1, { location_type: 3 })])
      selectLocationTypes(0) // no platforms exist
      expect(toasts).toHaveLength(1)
      expect(toasts[0]).toMatch(/no.*platform/i)
    })
  })
})
