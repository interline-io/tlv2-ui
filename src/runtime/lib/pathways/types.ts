/**
 * Minimal type definitions for pathway map visualization
 * These interfaces define only the properties needed for map rendering
 * Both stations and transfers app types satisfy these interfaces
 */

import type { Point, MultiPolygon } from 'geojson'

/**
 * Minimal level interface for map rendering
 */
export interface MapLevel {
  id?: number
  level_id?: string
  level_index?: number
  level_name?: string
  geometry?: MultiPolygon
}

/**
 * Minimal stop interface for map rendering
 */
export interface MapStop {
  id?: number
  stop_id?: string
  stop_name?: string
  geometry?: Point
  location_type?: number
  level?: MapLevel | null
  parent?: { id?: number }
  external_reference?: {
    target_active_stop?: {
      stop_name?: string
      geometry?: Point
    }
  }
}

/**
 * Minimal pathway interface for map rendering
 */
export interface MapPathway {
  id?: number
  pathway_id?: string
  pathway_mode?: number
  is_bidirectional?: number
  from_stop: MapStop
  to_stop: MapStop
}

/**
 * Minimal station interface for map rendering
 */
export interface MapStation {
  id?: number
  stops: MapStop[]
  pathways: MapPathway[]
  levels?: MapLevel[]
}
