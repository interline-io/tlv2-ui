import type { Stop, Pathway } from './station'

export type ValidationSeverity = 'critical' | 'info' | 'interline'

export interface ValidationError {
  message: string
  severity: ValidationSeverity
}

export function validateStop (stop: Stop, stationStops: Stop[]): ValidationError[] {
  const fromPathways = stop.pathways_from_stop || []
  const toPathways = stop.pathways_to_stop || []
  const targetStop = stop.external_reference?.target_active_stop || null
  const errs: ValidationError[] = []
  if (stop.location_type === 0 && !targetStop) {
    // errs.push({
    //   message: 'Platform (location_type = 0) must have a stop association'
    // })
  }
  if (targetStop && targetStop.location_type !== stop.location_type) {
    errs.push({
      severity: 'interline',
      message: `Interline recommendation: stop must have the same location_type as the target stop (location_type = ${targetStop.location_type})`
    })
  }
  // if (stop.location_type === 2 && !stop.external_reference?.target_active_stop) {
  //   errs.push({
  //     message: 'Entrance (location_type = 2) must have a stop association'
  //   })
  // }
  if (stop.location_type === 1 && (fromPathways.length > 0 || toPathways.length > 0)) {
    errs.push({
      severity: 'critical',
      message: 'Pathways cannot use Station (location_type = 1)'
    })
  }
  if (stop.parent?.id && stop.parent.id === stop.id) {
    errs.push({
      severity: 'critical',
      message: 'Cannot have self as parent_station'
    })
  }
  if (stop.location_type !== 4 && stop.parent?.id && stop.parent.location_type !== 1) {
    errs.push({
      severity: 'critical',
      message: 'The parent_station must be a Station (location_type = 1)'
    })
  }
  if (
    (stop.location_type === 4 && stop.parent === null) || (stop.location_type === 4 && stop.parent && stop.parent.location_type !== 0)
  ) {
    errs.push({
      severity: 'critical',
      message: 'Boarding areas require a Platform (location_type = 0) as a parent_station'
    })
  }
  if (stop.external_reference && stop.external_reference.target_active_stop === null) {
    errs.push({
      severity: 'interline',
      message: `Interline recommendation: cannot resolve reference to stop ${stop.external_reference.target_feed_onestop_id}:${stop.external_reference.target_stop_id}`
    })
  }
  const hasBoardingAreas = stop.location_type === 0 && stationStops.some(s => s.location_type === 4 && s.parent?.id === stop.id)
  if (stop.location_type !== 1 && !hasBoardingAreas && fromPathways.length === 0 && toPathways.length === 0) {
    errs.push({
      severity: 'critical',
      message: 'All locations within a station require at least one connecting pathway, except platforms with boarding areas'
    })
  }
  if (stop.location_type === 3 && (fromPathways.length + toPathways.length < 2)) {
    errs.push({
      severity: 'interline',
      message: 'Interline recommendation: generic nodes should connect to at least two pathways so a rider can transit through the node to another node'
    })
  }
  if (stop.location_type === 0) {
    if (hasBoardingAreas && (fromPathways.length + toPathways.length > 0)) {
      errs.push({
        severity: 'critical',
        message: 'Platforms with boarding areas must not have pathways; assign pathways to the boarding areas instead'
      })
    } else if (!hasBoardingAreas && (fromPathways.length + toPathways.length > 1)) {
      errs.push({
        severity: 'interline',
        message: 'Interline recommendation: do not transit through platforms'
      })
    }
  }
  if (stop.location_type === 4 && stop.parent?.id) {
    const allPathways = [...fromPathways, ...toPathways]
    const hasParentPathway = allPathways.some(pw => pw.from_stop.id === stop.parent!.id || pw.to_stop.id === stop.parent!.id)
    if (hasParentPathway) {
      errs.push({
        severity: 'info',
        message: 'Boarding areas connect to their parent platform via the parent_station setting, not via drawn pathways'
      })
    }
  }
  return errs
}

export function validatePathway (pathway: Pathway): ValidationError[] {
  const errs: ValidationError[] = []
  if (pathway.from_stop.id === pathway.to_stop.id) {
    errs.push({
      severity: 'interline',
      message: 'Interline recommendation: pathway is a loop — from_stop_id should not equal to_stop_id'
    })
  }
  if (pathway.pathway_mode === 7 && pathway.is_bidirectional === 1) {
    errs.push({
      severity: 'critical',
      message: 'Exit-gate pathways must be one-way'
    })
  }
  if (pathway.pathway_mode === 2 && pathway.stair_count === null) {
    if (pathway.from_stop.level?.id !== pathway.to_stop.level?.id) {
      // ok
    } else {
      errs.push({
        severity: 'interline',
        message: 'Interline recommendation: stairs pathways should have a stair_count or connect stops with different levels'
      })
    }
  }
  return errs
}
