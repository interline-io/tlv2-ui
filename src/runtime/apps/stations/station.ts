import { gql } from 'graphql-tag'
import type { Point, MultiPolygon } from 'geojson'
import { RoutingGraph, DefaultCost } from '../../lib/pathways/graph'
import type { CostFunction, AStarResult } from '../../lib/pathways/graph'
import type {
  FeedVersionData,
  FeedInfo,
  StopData,
  PathwayData,
  LevelData,
  RouteStopData,
  StopExternalReferenceData,
  ValidationPath
} from './types'

export const stationQuery = gql`
fragment level on Level {
  id
  level_id
  level_name
  level_index
  geometry
}

query stationQuery ($stop_id: String, $feed_onestop_id: String!, $feed_version_ids: [Int!]) {
  feed_versions(ids: $feed_version_ids, where: {feed_onestop_id: $feed_onestop_id}) {
    stops(limit: 1, where: {stop_id: $stop_id}) {
      id
      stop_id
      stop_name
      location_type
      geometry
      children(limit:1000) {
        id
        location_type
      }
      parent {
        id
        location_type
      }
      level {
        ...level
      }
      child_levels {
        ...level
      }
      feed_version {
        id
        sha1
        file
        feed {
          id
          name
          onestop_id
        }
      }
    }
  }
}`

export const stationStopQuery = gql`
fragment pathwayStop on Stop {
  id
  stop_id
  stop_name
  geometry
  location_type
  platform_code
  level {
    id
    level_id
    level_name
    level_index
  }
  parent {
    id
  }
  feed_version {
    id
    feed {
      id
      onestop_id
    }
  }
}

fragment childStop on Stop {
  id
  stop_id
  stop_name
  location_type
  geometry
  level {
    id
  }
  feed_version {
    id
    feed {
      id
      onestop_id
    }
  }
}

fragment level on Level {
  id
  level_id
  level_name
  level_index
  geometry
}

fragment pathway on Pathway {
  id
  pathway_id
  is_bidirectional
  pathway_mode
  stair_count
  signposted_as
  reverse_signposted_as
  length
  traversal_time
  min_width
  max_slope
  from_stop {
    ...pathwayStop
  }
  to_stop {
    ...pathwayStop
  }
}

query stationStopQuery($stop_ids: [Int!]!) {
  stops(ids: $stop_ids, limit:1000) {
    id
    stop_id
    stop_name
    location_type
    stop_code
    stop_timezone
    zone_id
    wheelchair_boarding
    stop_desc
    platform_code
    geometry
    feed_version {
      id
      feed {
        id
        onestop_id
      }
    }
    level {
      ...level
      stops {
        id
      }
    }
    parent {
      ...childStop
    }
    children {
      ...childStop
    }
    pathways_to_stop {
      ...pathway
    }
    pathways_from_stop {
      ...pathway
    }
    route_stops {
          route {
            id
            route_short_name
            route_long_name
            agency {
              id
              agency_id
              agency_name
            }
          }
    }
    external_reference {
      id
      target_stop_id
      target_feed_onestop_id
      target_active_stop {
        ...childStop
        route_stops {
          route {
            id
            route_short_name
            route_long_name
            agency {
              id
              agency_id
              agency_name
            }
          }
        }
      }
    }
  }
}`

export function mapLevelKeyFn (level: LevelData): string {
  return `mapLevelKey-${level.id || 'unassigned'}`
}

function def<T> (v: T | null | undefined, d: T): T {
  if (v == null) {
    return d
  }
  return v
}

// Helper function to build route keys with prefix
export function getRouteKeys (prefix = 'editor'): Record<string, string> {
  return {
    levels: `${prefix}-feedKey-feedVersionKey-stations-stationKey`,
    stops: `${prefix}-feedKey-feedVersionKey-stations-stationKey-stops`,
    pathways: `${prefix}-feedKey-feedVersionKey-stations-stationKey-pathways`,
    diagram: `${prefix}-feedKey-feedVersionKey-stations-stationKey-diagram`
  }
}

export class FeedVersion {
  id?: number
  fetched_at?: string
  name?: string
  sha1?: string
  file?: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  feed: FeedInfo

  constructor (fv?: FeedVersionData) {
    fv = fv || {}
    this.id = fv.id
    this.fetched_at = fv.fetched_at
    this.name = fv.name
    this.sha1 = fv.sha1
    this.file = fv.file
    this.earliest_calendar_date = fv.earliest_calendar_date
    this.latest_calendar_date = fv.latest_calendar_date
    this.feed = {}
    if (fv.feed) {
      this.feed.id = fv.feed.id
      this.feed.onestop_id = fv.feed.onestop_id
    }
  }
}

export class Stop {
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
  route_stops: RouteStopData[]
  parent: Partial<Stop>
  children: Stop[]
  level: Level
  levels: Level[]
  pathways_from_stop: Pathway[]
  pathways_to_stop: Pathway[]
  feed_version: FeedVersion
  external_reference?: StopExternalReferenceData

  constructor (stop?: StopData) {
    stop = stop || {}
    this.id = stop.id
    this.stop_id = stop.stop_id
    this.stop_name = stop.stop_name
    this.stop_code = stop.stop_code
    this.platform_code = stop.platform_code
    this.stop_timezone = stop.stop_timezone
    this.zone_id = stop.zone_id
    this.wheelchair_boarding = stop.wheelchair_boarding
    this.stop_desc = stop.stop_desc
    if (stop.geometry) {
      this.geometry = { type: 'Point', coordinates: stop.geometry.coordinates }
    }
    this.location_type = stop.location_type

    // objects
    this.route_stops = stop.route_stops || []
    this.parent = { id: undefined }
    if (stop.parent) {
      this.parent = new Stop(stop.parent)
    }
    this.children = []
    for (const c of (stop.children || [])) {
      this.children.push(new Stop(c))
    }

    // levels
    if (stop.level) {
      this.level = new Level(stop.level)
    } else {
      this.level = new Level({ level_name: 'Unassigned' })
    }

    // Child levels
    this.levels = []
    if (stop.child_levels) {
      this.levels = stop.child_levels.map((s) => { return new Level(s) })
    }

    // pathways
    this.pathways_from_stop = (stop.pathways_from_stop || []).map((s) => { return new Pathway(s) })
    this.pathways_to_stop = (stop.pathways_to_stop || []).map((s) => { return new Pathway(s) })

    // feed version
    this.feed_version = new FeedVersion(stop.feed_version)

    // stop ext
    this.external_reference = stop.external_reference
  }

  setCoords (lon: number, lat: number): void {
    if (this.geometry) {
      this.geometry.coordinates = [lon, lat]
    }
  }

  setDefaults (): this {
    this.stop_id = def(this.stop_id, String(Date.now()))
    this.stop_name = def(this.stop_name, '')
    this.stop_code = def(this.stop_code, '')
    this.platform_code = def(this.platform_code, '')
    this.stop_desc = def(this.stop_desc, '')
    this.zone_id = def(this.zone_id, '')
    this.stop_url = def(this.stop_url, '')
    this.stop_timezone = def(this.stop_timezone, '')
    this.location_type = def(this.location_type, 3)
    this.wheelchair_boarding = def(this.wheelchair_boarding, 0)
    return this
  }

  value (): Record<string, unknown> {
    return {
      id: this.id,
      stop_id: this.stop_id,
      stop_name: this.stop_name,
      stop_code: this.stop_code,
      platform_code: this.platform_code,
      stop_timezone: this.stop_timezone,
      zone_id: this.zone_id,
      stop_url: this.stop_url,
      wheelchair_boarding: this.wheelchair_boarding,
      stop_desc: this.stop_desc,
      geometry: this.geometry,
      location_type: this.location_type,
      parent: this.parent?.id ? { id: this.parent.id } : { id: null },
      level: this.level?.id ? { id: this.level.id } : { id: null },
      feed_version: { id: this.feed_version.id },
      external_reference: this.external_reference
        ? {
            target_feed_onestop_id: this.external_reference?.target_feed_onestop_id || null,
            target_stop_id: this.external_reference?.target_stop_id || null,
          }
        : null
    }
  }
}

export class Pathway {
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
  from_stop: Stop
  to_stop: Stop
  feed_version: Partial<FeedVersion>

  constructor (pw?: PathwayData) {
    pw = pw || {}
    this.id = pw.id
    this.length = pw.length
    this.pathway_id = pw.pathway_id
    this.pathway_mode = pw.pathway_mode
    this.max_slope = pw.max_slope
    this.min_width = pw.min_width
    this.signposted_as = pw.signposted_as
    this.reverse_signposted_as = pw.reverse_signposted_as
    this.stair_count = pw.stair_count
    this.traversal_time = pw.traversal_time
    this.is_bidirectional = pw.is_bidirectional
    // objects
    this.from_stop = new Stop(pw.from_stop)
    this.to_stop = new Stop(pw.to_stop)
    this.feed_version = new FeedVersion(pw.from_stop?.feed_version)
  }

  setDefaults (): this {
    this.feed_version = { id: def(this.feed_version.id, this.from_stop.feed_version.id) }
    // length, max_slope, min_width, stair_count, traversal_time are optional - keep as-is
    this.pathway_id = def(this.pathway_id, String(Date.now()))
    this.pathway_mode = def(this.pathway_mode, 1)
    this.signposted_as = def(this.signposted_as, '')
    this.reverse_signposted_as = def(this.reverse_signposted_as, '')
    this.is_bidirectional = def(this.is_bidirectional, 1)
    return this
  }

  value (): Record<string, unknown> {
    // Convert empty strings to undefined for numeric fields to avoid GraphQL validation errors
    const toNumber = (val: any): number | undefined => {
      if (val === '' || val === null || val === undefined) return undefined
      const num = Number(val)
      return Number.isNaN(num) ? undefined : num
    }

    return {
      id: this.id,
      length: toNumber(this.length),
      pathway_id: this.pathway_id,
      pathway_mode: this.pathway_mode,
      max_slope: toNumber(this.max_slope),
      min_width: toNumber(this.min_width),
      signposted_as: this.signposted_as,
      reverse_signposted_as: this.reverse_signposted_as,
      stair_count: toNumber(this.stair_count),
      traversal_time: toNumber(this.traversal_time),
      is_bidirectional: this.is_bidirectional,
      from_stop: { id: this.from_stop.id },
      to_stop: { id: this.to_stop.id },
      feed_version: { id: this.feed_version.id }
    }
  }
}

export class Level {
  id?: number
  level_id?: string
  level_index?: number
  level_name?: string
  geometry?: MultiPolygon
  feed_version: Partial<FeedVersion>
  parent: Partial<Stop>
  stops: Stop[]

  constructor (lvl?: LevelData) {
    lvl = lvl || {}
    this.id = lvl.id
    this.level_id = lvl.level_id
    this.level_index = lvl.level_index
    this.level_name = lvl.level_name
    this.geometry = lvl.geometry
    // objects
    this.feed_version = { id: lvl.feed_version?.id }
    this.parent = { id: lvl.parent?.id }
    this.stops = []
    for (const s of (lvl.stops || [])) {
      this.stops.push(new Stop(s))
    }
  }

  setDefaults (): this {
    this.level_index = def(this.level_index, 0.0)
    this.level_name = def(this.level_name, String(Date.now()))
    this.level_id = def(this.level_id, String(Date.now()))
    return this
  }

  value (): Record<string, unknown> {
    return {
      id: this.id,
      level_id: this.level_id,
      level_index: this.level_index,
      level_name: this.level_name,
      geometry: this.geometry,
      feed_version: { id: this.feed_version.id },
      parent: { id: this.parent?.id }
    }
  }
}

export class Station {
  client: string
  graph: RoutingGraph | null
  graphProfile: CostFunction | null
  stop: Stop
  pathways: Pathway[]
  stops: Stop[]
  levels: Level[]

  constructor (stop?: StopData) {
    this.client = 'stationEditor'
    this.graph = null
    this.graphProfile = null
    this.stop = new Stop(stop)
    this.pathways = []
    this.stops = []
    this.levels = []
    for (const level of (this.stop.levels || [])) {
      this.levels.push(new Level(level))
    }
    // Only add an Unassigned level if one doesn't already exist
    const hasUnassigned = this.levels.some(level => level.level_name === 'Unassigned' && level.level_index === null)
    if (!hasUnassigned) {
      this.levels.push(new Level({ level_name: 'Unassigned' }))
    }
  }

  get id (): number | undefined {
    return this.stop.id
  }

  get geometry (): Point | undefined {
    return this.stop.geometry
  }

  setDefaults (): this {
    this.stop.location_type = 1
    this.stop.stop_name = def(this.stop.stop_name, String(Date.now()))
    this.stop.stop_id = def(this.stop.stop_id, String(Date.now()))
    this.stop.setDefaults()
    return this
  }

  getStop (stopId: number): Stop | null {
    for (const stop of this.stops) {
      if (stop.id === stopId) {
        return stop
      }
    }
    return null
  }

  findRoute (start: number, goal: number, profile: CostFunction = DefaultCost): AStarResult | undefined {
    if (this.stops.length === 0) {
      return
    }
    if (!this.graph || this.graphProfile !== profile) {
      this.graph = new RoutingGraph(this.stops, profile)
      this.graphProfile = profile
    }
    return this.graph.aStar(start, goal)
  }

  validatePathsToStops (source: Stop, targets: Stop[]): ValidationPath[] {
    const paths: ValidationPath[] = []
    if (!source.id) {
      return paths
    }
    for (const target of targets) {
      if (!target.id) {
        continue
      }
      const route = this.findRoute(source.id, target.id)
      if (!route || route.path.length === 0) {
        paths.push({ target, error: `no route between ${source.stop_name} (${source.id}) and ${target.stop_name} (${target.id})`, distance: route?.distance || 0 })
      } else {
        paths.push({ target, info: `OK: route between ${source.stop_name} (${source.id}) and ${target.stop_name} (${target.id})`, distance: route.distance || 0 })
      }
    }
    return paths.sort((a, b) => { return b.distance - a.distance })
  }

  addStops (stops: Stop[]): number[] {
    // Add these stops/levels to the station and return a list of new stops to fetch.
    const currentStops = new Map<number, Stop>()
    if (this.stop.id) {
      currentStops.set(this.stop.id, this.stop)
    }
    for (const i of this.stops) {
      if (i.id) {
        currentStops.set(i.id, i)
      }
    }
    for (const i of stops) {
      if (i.id) {
        currentStops.set(i.id, i)
      }
    }
    const pwIndex = new Map<number, Pathway>()
    const checkStops = new Set<number>()
    for (const c of this.stop.children || []) {
      if (c.id) {
        checkStops.add(c.id)
      }
    }
    for (const stop of stops) {
      if (stop.parent?.id) {
        checkStops.add(stop.parent.id)
      }
      for (const pw of stop.pathways_from_stop || []) {
        if (pw.id && pw.to_stop.id) {
          pwIndex.set(pw.id, pw)
          checkStops.add(pw.to_stop.id)
        }
      }
      for (const pw of stop.pathways_to_stop || []) {
        if (pw.id && pw.from_stop.id) {
          pwIndex.set(pw.id, pw)
          checkStops.add(pw.from_stop.id)
        }
      }
      for (const c of stop.children || []) {
        if (c.id) {
          checkStops.add(c.id)
        }
      }
      for (const s of stop.level?.stops || []) {
        if (s.id) {
          checkStops.add(s.id)
        }
      }
    }
    const toFetch = new Set<number>()
    for (const i of checkStops) {
      toFetch.add(i)
    }
    for (const i of currentStops.keys()) {
      toFetch.add(i)
    }
    // remove self
    if (this.stop.id) {
      currentStops.delete(this.stop.id)
      toFetch.delete(this.stop.id)
    }
    const newStops = Array.from(currentStops.values())
    // update levels
    const lvls = new Map<number | string, Level>()
    for (const lvl of this.levels || []) {
      // Normalize null/undefined to a consistent key for unassigned levels
      const levelKey = lvl.id ?? 'unassigned'
      lvls.set(levelKey, lvl)
    }
    for (const stop of newStops) {
      let lvl = stop.level
      // Normalize null/undefined to a consistent key for unassigned levels
      const levelKey = lvl?.id ?? 'unassigned'
      if (lvl && lvls.has(levelKey)) {
        const existingLevel = lvls.get(levelKey)
        if (existingLevel) {
          lvl = existingLevel
        }
      } else {
        lvl = new Level(lvl)
      }
      lvl.stops.push(stop)
      lvls.set(levelKey, lvl)
    }
    // Update
    this.stops = newStops
    this.pathways = Array.from(pwIndex.values())
    this.levels = Array.from(lvls.values())
    this.graph = null
    this.graphProfile = null
    // Update stoplist
    return Array.from(toFetch)
  }
}
