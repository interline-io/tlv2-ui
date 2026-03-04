import type { Stop, Pathway } from './station'

export interface FilterCounts {
  stopsByLocationType: Record<number, number>
  stopsWithAssociations: number
  platformsWithoutAssociations: number
  entrancesWithoutAssociations: number
  stopsWithPairedPathways: number
  pathwaysByMode: Record<number, number>
  pathwaysWithPairs: number
  pathwaysOneway: number
  pathwaysBidirectional: number
}

export function computeFilterCounts (stops: Stop[], pathways: Pathway[]): FilterCounts {
  const stopsByLocationType: Record<number, number> = {}
  for (const s of stops) {
    if (s.location_type != null) {
      stopsByLocationType[s.location_type] = (stopsByLocationType[s.location_type] || 0) + 1
    }
  }

  const pathwaysByMode: Record<number, number> = {}
  for (const p of pathways) {
    if (p.pathway_mode != null) {
      pathwaysByMode[p.pathway_mode] = (pathwaysByMode[p.pathway_mode] || 0) + 1
    }
  }

  // A stop "has paired pathways" when it participates in both directions of a
  // pair (A→B and B→A). Each stop contributes canonical keys for its outgoing
  // pathways (from_stop perspective) and incoming pathways (to_stop reversed),
  // and a match occurs when another stop has already contributed the same key.
  const pairedStopMap = new Map<string, boolean>()
  const stopsWithPairedPathways = stops.filter((s) => {
    const keys: string[] = []
    for (const pw of (s.pathways_from_stop || [])) {
      keys.push(`${pw.from_stop.id}-${pw.to_stop.id}`)
    }
    for (const pw of (s.pathways_to_stop || [])) {
      keys.push(`${pw.to_stop.id}-${pw.from_stop.id}`)
    }
    let matched = false
    for (const k of keys) {
      if (pairedStopMap.has(k)) {
        matched = true
      }
      pairedStopMap.set(k, true)
    }
    return matched
  }).length

  const allPathwayKeys = new Set(pathways.map(p => `${p.from_stop.id}-${p.to_stop.id}`))
  const pathwaysWithPairs = pathways.filter(p =>
    allPathwayKeys.has(`${p.to_stop.id}-${p.from_stop.id}`)
  ).length

  return {
    stopsByLocationType,
    stopsWithAssociations: stops.filter(s => s.external_reference?.target_stop_id).length,
    platformsWithoutAssociations: stops.filter(s => s.location_type === 0 && !s.external_reference).length,
    entrancesWithoutAssociations: stops.filter(s => s.location_type === 2 && !s.external_reference).length,
    stopsWithPairedPathways,
    pathwaysByMode,
    pathwaysWithPairs,
    pathwaysOneway: pathways.filter(p => p.is_bidirectional === 0).length,
    pathwaysBidirectional: pathways.filter(p => p.is_bidirectional === 1).length
  }
}
