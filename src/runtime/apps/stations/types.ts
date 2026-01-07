/**
 * TypeScript type definitions for GTFS station editor
 * Based on GraphQL schema types from transitland-lib
 */

import type { Point, MultiPolygon } from 'geojson'

/**
 * Basic feed information
 */
export interface FeedInfo {
  id?: number
  onestop_id?: string
}

/**
 * GTFS feed version metadata from GraphQL
 */
export interface FeedVersionData {
  id?: number
  fetched_at?: string
  name?: string
  sha1?: string
  file?: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  feed?: FeedInfo
}

/**
 * GTFS level (floor) data from GraphQL
 */
export interface LevelData {
  id?: number
  level_id?: string
  level_index?: number
  level_name?: string
  geometry?: MultiPolygon
  parent?: StopData
  stops?: StopData[]
  feed_version?: FeedVersionData
}

/**
 * GTFS pathway data from GraphQL
 */
export interface PathwayData {
  id?: number
  length?: number
  pathway_id?: string
  pathway_mode?: number
  max_slope?: number
  min_width?: number
  signposted_as?: string
  reverse_signposted_as?: string
  stair_count?: number
  traversal_time?: number
  is_bidirectional?: number
  from_stop?: StopData
  to_stop?: StopData
  feed_version?: FeedVersionData
}

/**
 * GTFS route stop association from GraphQL
 */
export interface RouteStopData {
  id?: number
  route?: RouteData
  agency?: AgencyData
}

/**
 * GTFS route data from GraphQL
 */
export interface RouteData {
  id?: number
  route_id?: string
  route_short_name?: string
  route_long_name?: string
  agency?: AgencyData
}

/**
 * GTFS agency data from GraphQL
 */
export interface AgencyData {
  id?: number
  agency_id?: string
  agency_name?: string
}

/**
 * External reference for stop associations
 */
export interface StopExternalReferenceData {
  id?: number
  target_feed_onestop_id?: string
  target_stop_id?: string
  inactive?: boolean
  target_active_stop?: StopData
}

/**
 * GTFS stop data from GraphQL
 */
export interface StopData {
  id?: number
  stop_id?: string
  stop_name?: string
  stop_code?: string
  platform_code?: string
  stop_timezone?: string
  zone_id?: string
  wheelchair_boarding?: number
  stop_desc?: string
  stop_url?: string
  geometry?: Point
  location_type?: number
  parent?: StopData
  children?: StopData[]
  level?: LevelData
  levels?: LevelData[]
  child_levels?: LevelData[]
  pathways_from_stop?: PathwayData[]
  pathways_to_stop?: PathwayData[]
  route_stops?: RouteStopData[]
  feed_version?: FeedVersionData
  external_reference?: StopExternalReferenceData
}

/**
 * Basemap layer configuration
 */
export interface BasemapLayer {
  label: string
  source: {
    type: string
    tiles: string[]
    tileSize: number
    attribution: string
  }
  layer: {
    type: string
    minzoom: number
    maxzoom: number
    layout?: {
      visibility: string
    }
  }
}

/**
 * Pathway mode icon configuration
 */
export interface PathwayModeIcon {
  icon: string
  label: string
  altIcon?: string
}

/**
 * Routing graph edge information
 */
export interface RouteEdge {
  pathway_id?: number
  cost: number
}

/**
 * Routing graph result
 */
export interface RouteResult {
  distance: number | null
  path: number[]
  edges?: RouteEdge[]
  error?: string
}

/**
 * Profile function for routing cost calculation
 */
export type ProfileFunction = (pw: PathwayData, distance: number, speed?: number) => number

/**
 * Validation path result
 */
export interface ValidationPath {
  target: StopData
  error?: string
  info?: string
  distance: number
}

/**
 * GraphQL query response types
 */
export interface FeedQueryResponse {
  id: number
  name?: string
  onestop_id: string
  feed_versions: Array<{
    id: number
    file?: string
    name?: string
    description?: string
    sha1?: string
    agencies?: AgencyData[]
    stations?: Array<{
      feed_version: { id: number }
      station_id: string
      stationName: string
      geometry?: Point
    }>
  }>
}

export interface StationQueryResponse {
  feed_versions: Array<{
    stops: StopData[]
  }>
}

export interface StopsQueryResponse {
  stops: StopData[]
}

/**
 * Map change event from map components
 */
export interface MapChangeEvent {
  features: Array<{
    geometry: Point | MultiPolygon
    properties?: Record<string, unknown>
  }>
}

/**
 * Station data for editor components
 */
export interface StationData {
  id?: number
  feed_version_id?: number
  geometry?: Point | null
  stop?: StopData
  levels: LevelData[]
  stops: StopData[]
}
