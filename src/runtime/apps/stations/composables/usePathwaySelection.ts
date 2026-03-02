import { ref, computed, watch, type Ref } from 'vue'
import { Pathway } from '../station'
import type { Station, Stop } from '../station'
import { Profiles } from '../../../lib/pathways/graph'
import { computeFilterCounts } from '../station-pathways-filter-counts'
import { LocationTypes } from '../basemaps'
import { PathwayModes } from '../../../lib/pathways/pathway-icons'

type SelectMode = 'select' | 'add-node' | 'add-pathway' | 'find-route' | 'edit-node' | 'edit-pathway' | 'export'
type LngLat = { lng: number, lat: number }

export function usePathwaySelection (
  station: Ref<Station | null>,
  selectedProfile: Ref<string>,
  showToast: (msg: string) => void
) {
  const selectMode = ref<SelectMode>('select')
  const selectedStops = ref<Stop[]>([])
  const selectedPathways = ref<Pathway[]>([])
  const selectedPoint = ref<LngLat | null>(null)
  const hoverStopId = ref<number | null>(null)
  const hoverPathwayId = ref<number | null>(null)
  const lastFilterApplied = ref('')

  // Clear selection when entering add-node mode
  watch(selectMode, (mode) => {
    if (mode === 'add-node') {
      selectedStops.value = []
      selectedPathways.value = []
    }
  })

  const pathwayIndex = computed<Record<number, Pathway>>(() => {
    const pwi: Record<number, Pathway> = {}
    for (const pw of (station.value?.pathways || [])) {
      if (pw.id != null) {
        pwi[pw.id] = pw
      }
    }
    return pwi
  })

  const filterCounts = computed(() => {
    return computeFilterCounts(station.value?.stops || [], station.value?.pathways || [])
  })

  const selectedStop = computed<Stop | null>(() => {
    const stops = selectedStops.value
    return stops.length > 0 ? (stops[stops.length - 1] ?? null) : null
  })

  const selectedSource = computed<Stop | null>(() => {
    const stops = selectedStops.value
    return stops.length === 2 ? (stops[0] ?? null) : null
  })

  const selectedPath = computed(() => {
    if (selectMode.value !== 'find-route' || selectedStops.value.length < 2 || !station.value) {
      return null
    }
    const from = selectedStops.value[0]
    const to = selectedStops.value[1]
    if (!from?.id || !to?.id) { return null }
    const p = station.value.findRoute(
      from.id,
      to.id,
      Profiles[selectedProfile.value]
    )
    if (!p) {
      return null
    }
    const edges: { cost: number, pathway: Pathway }[] = []
    for (const edge of (p.edges || [])) {
      if (edge.pathway_id) {
        const pathway = pathwayIndex.value[edge.pathway_id]
        if (pathway) {
          edges.push({ cost: edge.cost, pathway })
        }
      } else if (edge.from_stop_id && edge.to_stop_id) {
        const fromStop = station.value.getStop(edge.from_stop_id)
        const toStop = station.value.getStop(edge.to_stop_id)
        if (fromStop && toStop) {
          edges.push({
            cost: edge.cost,
            pathway: new Pathway({ pathway_mode: 1, is_bidirectional: 1, from_stop: fromStop, to_stop: toStop })
          })
        }
      }
    }
    return edges
  })

  function selectStop (stopId: number | null) {
    if (stopId === null) {
      selectedStops.value = []
      selectMode.value = 'select'
      return
    }
    const cur = station.value?.getStop(stopId)
    const prev = selectedStops.value.length > 0 ? selectedStops.value[selectedStops.value.length - 1] : null
    if (!cur) {
      return
    }
    // find-route is sticky on first selected stop
    if (prev && selectMode.value === 'find-route') {
      if (prev === cur) {
        selectedStops.value = []
        return
      }
      selectedStops.value = [selectedStops.value[0]!, cur]
      return
    }
    selectedPathways.value = []
    if (prev) {
      if (prev === cur) {
        selectedStops.value = []
        selectMode.value = 'select'
      } else {
        selectedStops.value = [prev, cur]
        selectMode.value = 'add-pathway'
      }
    } else {
      selectedStops.value = [cur]
      selectMode.value = 'edit-node'
    }
  }

  function selectPathway (pwid: number | null) {
    if (pwid === null) {
      selectedPathways.value = []
      selectMode.value = 'select'
      return
    }
    const cur = pathwayIndex.value[pwid] ?? null
    const prev = selectedPathways.value.length > 0 ? (selectedPathways.value[selectedPathways.value.length - 1] ?? null) : null
    selectedStops.value = []
    if (!cur || prev === cur) {
      selectedPathways.value = []
      selectMode.value = 'select'
    } else {
      selectedPathways.value = [cur]
      selectMode.value = 'edit-pathway'
    }
  }

  function selectPath (fromId: number, toId: number) {
    if (!station.value) { return }
    const from = station.value.getStop(fromId)
    const to = station.value.getStop(toId)
    if (from && to) {
      selectMode.value = 'find-route'
      selectedStops.value = [from, to]
    }
  }

  function selectPoint (ll: LngLat) {
    selectedPoint.value = ll
  }

  function unselectAll () {
    selectedStops.value = []
    selectedPathways.value = []
    selectedPoint.value = null
    lastFilterApplied.value = ''
    selectMode.value = 'select'
    hoverStopId.value = null
    hoverPathwayId.value = null
  }

  function applyFilter (
    filterFn: (item: Stop | Pathway) => boolean,
    filterLabel: string,
    notFoundMessage: string,
    target: 'stops' | 'pathways' = 'stops'
  ) {
    const source = target === 'stops' ? (station.value?.stops || []) : (station.value?.pathways || [])
    const results = source.filter(filterFn as (item: Stop | Pathway) => boolean)
    if (target === 'stops') {
      selectedStops.value = results as Stop[]
    } else {
      selectedPathways.value = results as Pathway[]
    }
    lastFilterApplied.value = filterLabel
    selectMode.value = 'select'
    if (results.length === 0) {
      showToast(notFoundMessage)
    }
  }

  function selectLocationTypes (stype: number) {
    const label = LocationTypes.get(stype) || String(stype)
    applyFilter(
      s => (s as Stop).location_type === stype,
      `Stops: ${label}`,
      `No ${label} stops found`
    )
  }

  function selectPathwayModes (stype: number) {
    const label = PathwayModes.get(stype) || String(stype)
    applyFilter(
      s => (s as Pathway).pathway_mode === stype,
      `Pathways: ${label}`,
      `No ${label} pathways found`,
      'pathways'
    )
  }

  function selectStopsWithAssociations () {
    applyFilter(
      s => !!(s as Stop).external_reference?.target_stop_id,
      'Stops with associations',
      'No stops with associations found'
    )
  }

  function selectStopsPlatformsWithoutAssociations () {
    applyFilter(
      s => (s as Stop).location_type === 0 && !(s as Stop).external_reference,
      'Platforms without associations',
      'No platforms without associations found'
    )
  }

  function selectStopsEntrancesWithoutAssociations () {
    applyFilter(
      s => (s as Stop).location_type === 2 && !(s as Stop).external_reference,
      'Entrances without associations',
      'No entrances without associations found'
    )
  }

  function selectStopsWithPairedPathways () {
    const pairedPathways = new Map<string, boolean>()
    applyFilter(
      (s) => {
        const stop = s as Stop
        const pwKeys: string[] = []
        for (const pw of (stop.pathways_from_stop || [])) {
          pwKeys.push(`${pw.from_stop.id}-${pw.to_stop.id}`)
        }
        for (const pw of (stop.pathways_to_stop || [])) {
          pwKeys.push(`${pw.to_stop.id}-${pw.from_stop.id}`)
        }
        let matched = false
        for (const pwkey of pwKeys) {
          if (pairedPathways.has(pwkey)) {
            matched = true
          }
          pairedPathways.set(pwkey, true)
        }
        return matched
      },
      'Stops with paired pathways',
      'No stops with paired pathways found'
    )
  }

  function selectPathwaysWithPairs () {
    const allKeys = new Set((station.value?.pathways || []).map(p => `${p.from_stop.id}-${p.to_stop.id}`))
    applyFilter(
      s => allKeys.has(`${(s as Pathway).to_stop.id}-${(s as Pathway).from_stop.id}`),
      'Pathways with pairs',
      'No pathways with pairs found',
      'pathways'
    )
  }

  function selectPathwaysOneway () {
    applyFilter(
      s => !(s as Pathway).is_bidirectional,
      'One-directional pathways',
      'No one-directional pathways found',
      'pathways'
    )
  }

  function selectPathwaysBidirectional () {
    applyFilter(
      s => !!(s as Pathway).is_bidirectional,
      'Bi-directional pathways',
      'No bi-directional pathways found',
      'pathways'
    )
  }

  return {
    selectMode,
    selectedStops,
    selectedPathways,
    selectedPoint,
    hoverStopId,
    hoverPathwayId,
    lastFilterApplied,
    pathwayIndex,
    filterCounts,
    selectedStop,
    selectedSource,
    selectedPath,
    selectStop,
    selectPathway,
    selectPath,
    selectPoint,
    unselectAll,
    selectLocationTypes,
    selectPathwayModes,
    selectStopsWithAssociations,
    selectStopsPlatformsWithoutAssociations,
    selectStopsEntrancesWithoutAssociations,
    selectStopsWithPairedPathways,
    selectPathwaysWithPairs,
    selectPathwaysOneway,
    selectPathwaysBidirectional
  }
}
