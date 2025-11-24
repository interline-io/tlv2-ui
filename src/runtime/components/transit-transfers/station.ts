/**
 * GTFS station, stop, pathway, and level data models
 */

import type { Point } from 'geojson'
import { haversinePosition } from 'tlv2-ui/geom'
import type { Graph } from './graph'

/**
 * Basic feed information
 */
export interface FeedInfo {
  id?: number
  onestop_id?: string
}

/**
 * GTFS feed version metadata
 */
export interface FeedVersionData {
  id?: number
  fetched_at?: string
  name?: string
  sha1?: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  feed?: FeedInfo
}

/**
 * GTFS feed version
 */
export class FeedVersion {
  id?: number
  fetched_at?: string
  name?: string
  sha1?: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  feed: FeedInfo

  constructor (fv?: FeedVersionData) {
    fv = fv || {}
    this.id = fv.id
    this.fetched_at = fv.fetched_at
    this.name = fv.name
    this.sha1 = fv.sha1
    this.earliest_calendar_date = fv.earliest_calendar_date
    this.latest_calendar_date = fv.latest_calendar_date
    this.feed = {}
    if (fv.feed) {
      this.feed.id = fv.feed.id
      this.feed.onestop_id = fv.feed.onestop_id
    }
  }
}

/**
 * GTFS level (floor) information
 */
export interface LevelData {
  id?: number
  level_id?: string
  level_index?: number
  level_name?: string
  geometry?: Point
  parent_station?: number
  stops?: StopData[]
}

/**
 * GTFS level (floor) in a station
 */
export class Level {
  id?: number
  level_id?: string
  level_index?: number
  level_name?: string
  geometry?: Point
  parent_station?: number
  stops: Stop[]

  constructor (lvl?: LevelData) {
    lvl = lvl || {}
    this.id = lvl.id
    this.level_id = lvl.level_id
    this.level_index = lvl.level_index
    this.level_name = lvl.level_name
    this.geometry = lvl.geometry
    this.parent_station = lvl.parent_station
    this.stops = (lvl.stops || []).map(s => new Stop(s))
  }
}

/**
 * GTFS pathway data from API
 */
export interface PathwayData {
  id?: number
  length?: number
  pathway_id?: string
  pathway_mode?: number
  max_slope?: number
  min_Width?: number
  signposted_as?: string
  reverse_signposted_as?: string
  stair_count?: number
  traversal_time?: number
  is_bidirectional?: number
  from_stop?: StopData
  to_stop?: StopData
  from_stop_id?: number
  to_stop_id?: number
  generated?: boolean
}

/**
 * GTFS stop data from API
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
  geometry?: Point
  location_type?: number
  parent_station?: number
  parent?: StopData
  children?: StopData[]
  level?: LevelData
  levels?: LevelData[]
  pathways_from_stop?: PathwayData[]
  pathways_to_stop?: PathwayData[]
  feed_version?: FeedVersionData
  stop_ext?: any
  level_id?: number
}

/**
 * GTFS stop/platform/entrance
 * @see https://gtfs.org/schedule/reference/#stopstxt
 */
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
  geometry?: Point
  location_type?: number
  parent_station?: number
  parent?: Stop
  children: Stop[]
  level: Level | null
  level_id: number | null
  levels: Level[]
  pathways_from_stop: Pathway[]
  pathways_to_stop: Pathway[]
  feed_version: FeedVersion
  stop_ext?: any

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
    this.geometry = stop.geometry
    this.location_type = stop.location_type
    this.parent_station = stop.parent_station

    // objects
    if (stop.parent) {
      this.parent = new Stop(stop.parent)
    }

    this.children = []
    for (const c of (stop.children || [])) {
      this.children.push(new Stop(c))
    }

    // levels
    this.level = null
    this.level_id = null // backwards compat
    if (stop.level) {
      this.level = new Level(stop.level)
      this.level_id = stop.level.id ?? null
    }

    this.levels = []
    if (stop.levels) {
      this.levels = stop.levels.map((s) => { return new Level(s) })
    }

    // pathways
    this.pathways_from_stop = (stop.pathways_from_stop || []).map((s) => { return new Pathway(s) })
    this.pathways_to_stop = (stop.pathways_to_stop || []).map((s) => { return new Pathway(s) })

    // feed version
    this.feed_version = new FeedVersion(stop.feed_version)

    // stop ext
    this.stop_ext = stop.stop_ext
  }
}

/**
 * GTFS pathway between stops
 * @see https://gtfs.org/schedule/reference/#pathwaystxt
 */
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
  feed_version: FeedVersion
  generated?: boolean

  constructor (pw?: PathwayData) {
    pw = pw || {}
    this.id = pw.id
    this.length = pw.length
    this.pathway_id = pw.pathway_id
    this.pathway_mode = pw.pathway_mode
    this.max_slope = pw.max_slope
    this.min_width = pw.min_Width
    this.signposted_as = pw.signposted_as
    this.reverse_signposted_as = pw.reverse_signposted_as
    this.stair_count = pw.stair_count
    this.traversal_time = pw.traversal_time
    this.is_bidirectional = pw.is_bidirectional
    this.generated = pw.generated

    // objects
    this.from_stop = new Stop(pw.from_stop)
    this.to_stop = new Stop(pw.to_stop)
    this.feed_version = new FeedVersion(pw.from_stop?.feed_version)
  }
}

/**
 * Station with complete stop hierarchy and pathways
 * Manages the graph of stops, levels, and pathways within a station
 */
export class Station {
  stopIndex: Map<number, Stop>
  graph: Graph | null
  stop: Stop
  pathways: Pathway[]
  stops: Stop[]
  levels: Level[]

  constructor (stop: StopData) {
    this.stopIndex = new Map()
    this.graph = null
    this.stop = new Stop(stop)
    this.pathways = []
    this.stops = []
    this.levels = []

    for (const level of (this.stop.levels || [])) {
      this.levels.push(new Level(level as LevelData))
    }
  }

  get id (): number | undefined {
    return this.stop.id
  }

  get geometry (): Point | undefined {
    return this.stop.geometry
  }

  /**
   * Get a stop by ID from the station
   */
  getStop (stopId: number): Stop | undefined {
    return this.stopIndex.get(stopId)
  }

  /**
   * Add stops to the station and return list of stops to fetch
   * Builds the complete station hierarchy including levels and pathways
   */
  addStops (stops: StopData[]): number[] {
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
      const stop = new Stop(i)
      if (stop.id) {
        currentStops.set(stop.id, stop)
      }
    }

    const pwIndex = new Map<number, Pathway>()
    const checkStops = new Set<number>()

    for (const stopData of stops) {
      const stop = new Stop(stopData)
      if (stop.parent_station) {
        checkStops.add(stop.parent_station)
      }
      for (const pw of stop.pathways_from_stop || []) {
        if (pw.id) {
          pwIndex.set(pw.id, pw)
        }
        if (pw.to_stop.id) {
          checkStops.add(pw.to_stop.id)
        }
      }
      for (const pw of stop.pathways_to_stop || []) {
        if (pw.id) {
          pwIndex.set(pw.id, pw)
        }
        if (pw.from_stop.id) {
          checkStops.add(pw.from_stop.id)
        }
      }
      for (const c of stop.children || []) {
        if (c.id) {
          checkStops.add(c.id)
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
    const lvls = new Map<number, Level>()
    for (const lvl of this.levels || []) {
      if (lvl.id) {
        lvls.set(lvl.id, lvl)
      }
    }
    for (const stop of newStops) {
      let lvl = stop.level
      if (lvl?.id && lvls.has(lvl.id)) {
        lvl = lvls.get(lvl.id)!
      } else if (lvl) {
        lvl = new Level(lvl as LevelData)
      }
      if (lvl) {
        lvl.stops.push(stop)
        if (lvl.id) {
          lvls.set(lvl.id, lvl)
        }
      }
    }

    // Update
    this.stops = newStops
    this.stopIndex = currentStops
    this.pathways = Array.from(pwIndex.values())
    this.levels = Array.from(lvls.values())

    // Return list of stop IDs to fetch
    return Array.from(toFetch)
  }
}

/**
 * Add street-level pathways to connect disconnected stops
 * Generates synthetic pathways between platforms and nearest entrances
 */
export function addStreetPathways (station: Station): void {
  const disconnectedStops: Stop[] = []
  for (const stop of station.stops) {
    const count
      = (stop.pathways_from_stop || []).length
        + (stop.pathways_to_stop || []).length
    if (count === 0 && stop.location_type === 0) {
      disconnectedStops.push(stop)
    }
  }

  let fwpid = -1
  for (const fromStop of disconnectedStops) {
    console.log(
      'disconnected stop:',
      fromStop.stop_id,
      fromStop.stop_name,
      fromStop.location_type
    )

    // find closest stop; caching won't save much
    let nearestStop: Stop | null = null
    let nearestDistance = 10000.0

    for (const toStop of station.stops) {
      if (toStop.location_type !== 2) {
        continue
      }
      if (fromStop.id === toStop.id) {
        continue
      }
      if (!fromStop.geometry || !toStop.geometry) {
        continue
      }

      const d = haversinePosition(fromStop.geometry.coordinates, toStop.geometry.coordinates)
      if (toStop.stop_name === fromStop.stop_name) {
        nearestDistance = d
        nearestStop = toStop
        break
      }
      if (d > nearestDistance) {
        continue
      }
      nearestDistance = d
      nearestStop = toStop
    }

    if (nearestStop) {
      console.log(
        '    nearest:',
        nearestStop.stop_id,
        nearestStop.stop_name,
        nearestStop.location_type,
        nearestDistance
      )
    } else {
      console.log('    no nearest candidates')
      continue
    }

    fwpid = fwpid - 1
    const pw: PathwayData = {
      id: fwpid,
      from_stop_id: fromStop.id,
      from_stop: {
        id: fromStop.id,
        stop_name: fromStop.stop_name,
        stop_id: fromStop.stop_id,
        geometry: fromStop.geometry,
        level_id: fromStop.level_id ?? undefined
      },
      to_stop: {
        id: nearestStop.id,
        stop_name: nearestStop.stop_name,
        stop_id: nearestStop.stop_id,
        geometry: nearestStop.geometry,
        level_id: nearestStop.level_id ?? undefined
      },
      to_stop_id: nearestStop.id,
      pathway_mode: 1,
      length: nearestDistance,
      is_bidirectional: 1,
      generated: true
    }

    const pathwayObj = new Pathway(pw)
    fromStop.pathways_from_stop.push(pathwayObj)
    nearestStop.pathways_to_stop.push(pathwayObj)
  }
}
