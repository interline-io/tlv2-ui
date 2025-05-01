import { gql } from 'graphql-tag'
import { RoutingGraph } from './graph'

export const stationQuery = gql`
fragment level on Level {
  id
  level_id
  level_name
  level_index
  geometry
}

query stationQuery ($stop_id: String, $feed_onestop_id: String!, $feed_version_file: String!) {
  feed_versions(where: {file: $feed_version_file, feed_onestop_id: $feed_onestop_id}) {
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
    stop_ext: external_reference {
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

function def (v, d) {
  if (v == null) {
    return d
  }
  return v
}

export const routeKeys = {
  levels: 'editor-feedKey-feedVersionKey-stations-stationKey',
  stops: 'editor-feedKey-feedVersionKey-stations-stationKey-stops',
  pathways: 'editor-feedKey-feedVersionKey-stations-stationKey-pathways',
  diagram: 'editor-feedKey-feedVersionKey-stations-stationKey-diagram'
}

export class FeedVersion {
  constructor (fv) {
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

export class Stop {
  constructor (stop) {
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
    this.parent = { id: null }
    if (stop.parent) {
      this.parent = new Stop(stop.parent)
    }
    this.children = []
    for (const c of (stop.children || [])) {
      this.children.push(new Stop(c))
    }
    // levels
    this.level = { id: null, level_name: 'Unassigned' }
    if (stop.level) {
      this.level = new Level(stop.level)
    }
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
    this.stop_ext = stop.stop_ext
  }

  setCoords (lon, lat) {
    this.geometry.coordinates = [lon, lat]
  }

  setDefaults () {
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

  value () {
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
      parent: { id: this.parent.id },
      level: { id: this.level.id },
      feed_version: { id: this.feed_version.id }
    }
  }
}

export class Pathway {
  constructor (pw) {
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
    this.feed_version = new FeedVersion(pw.from_stop.feed_version)
  }

  setDefaults () {
    this.feed_version = { id: def(this.feed_version.id, this.from_stop.feed_version.id) } // fix
    this.length = this.length
    this.pathway_id = def(this.pathway_id, String(Date.now()))
    this.pathway_mode = def(this.pathway_mode, 1)
    this.max_slope = this.max_slope
    this.min_width = this.min_width
    this.signposted_as = def(this.signposted_as, '')
    this.reverse_signposted_as = def(this.reverse_signposted_as, '')
    this.stair_count = this.stair_count
    this.traversal_time = this.traversal_time
    this.is_bidirectional = def(this.is_bidirectional, 1)
    return this
  }

  value () {
    return {
      id: this.id,
      length: this.length,
      pathway_id: this.pathway_id,
      pathway_mode: this.pathway_mode,
      max_slope: this.max_slope,
      min_width: this.min_width,
      signposted_as: this.signposted_as,
      reverse_signposted_as: this.reverse_signposted_as,
      stair_count: this.stair_count,
      traversal_time: this.traversal_time,
      is_bidirectional: this.is_bidirectional,
      from_stop: { id: this.from_stop.id },
      to_stop: { id: this.to_stop.id },
      feed_version: { id: this.feed_version.id }
    }
  }
}

export class Level {
  constructor (lvl) {
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
    this.stops = lvl.stops || []
  }

  setDefaults () {
    this.level_index = def(this.level_index, 0.0)
    this.level_name = def(this.level_name, String(Date.now()))
    this.level_id = def(this.level_id, String(Date.now()))
    return this
  }

  value () {
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
  constructor (stop) {
    this.graph = null
    this.stop = new Stop(stop)
    this.pathways = []
    this.stops = []
    this.levels = []
    for (const level of (this.stop.levels || [])) {
      this.levels.push(new Level(level))
    }
  }

  get id () {
    return this.stop.id
  }

  get geometry () {
    return this.stop.geometry
  }

  setDefaults () {
    this.stop.location_type = 1
    this.stop.stop_name = def(this.stop.stop_name, String(Date.now()))
    this.stop.stop_id = def(this.stop.stop_id, String(Date.now()))
    this.stop.setDefaults()
    return this
  }

  getStop (stopId) {
    for (const stop of this.stops) {
      if (stop.id === stopId) {
        return stop
      }
    }
    return null
  }

  findRoute (start, goal) {
    if (this.stops.length === 0) {
      return
    }
    if (!this.graph) {
      this.graph = new RoutingGraph(this.stops, null)
    }
    return this.graph.aStar(start, goal)
  }

  validatePathsToStops (source, targets) {
    const paths = []
    for (const target of targets) {
      const route = this.findRoute(source.id, target.id)
      if (!route || route.path.length === 0) {
        paths.push({ target, error: `no route between ${source.stop_name} (${source.id}) and ${target.stop_name} (${target.id})`, distance: route.distance })
      } else {
        paths.push({ target, info: `OK: route between ${source.stop_name} (${source.id}) and ${target.stop_name} (${target.id})`, distance: route.distance })
      }
    }
    return paths.sort((a, b) => { return b.distance - a.distance })
  }

  addStops (stops) {
    // Add these stops/levels to the station and return a list of new stops to fetch.
    // console.log('addStops:', stops)
    const currentStops = new Map()
    currentStops.set(this.stop.id, this.stop)
    for (const i of this.stops) {
      currentStops.set(i.id, i)
    }
    for (const i of stops) {
      currentStops.set(i.id, i)
    }
    const pwIndex = new Map()
    const checkStops = new Set()
    for (const c of this.stop.children || []) {
      checkStops.add(c.id)
    }
    for (const stop of stops) {
      if (stop.parent?.id) {
        checkStops.add(stop.parent.id)
      }
      for (const pw of stop.pathways_from_stop || []) {
        pwIndex.set(pw.id, pw)
        checkStops.add(pw.to_stop.id)
      }
      for (const pw of stop.pathways_to_stop || []) {
        pwIndex.set(pw.id, pw)
        checkStops.add(pw.from_stop.id)
      }
      for (const c of stop.children || []) {
        checkStops.add(c.id)
      }
    }
    const toFetch = new Set()
    for (const i of checkStops) {
      toFetch.add(i)
    }
    for (const i of currentStops.keys()) {
      toFetch.add(i)
    }
    // remove self
    currentStops.delete(this.stop.id)
    toFetch.delete(this.stop.id)
    const newStops = Array.from(currentStops.values())
    // update levels
    const lvls = new Map()
    for (const lvl of this.levels || []) {
      lvls.set(lvl.id, lvl)
    }
    for (const stop of newStops) {
      let lvl = stop.level
      if (lvl && lvls.has(lvl.id)) {
        lvl = lvls.get(lvl.id)
      } else {
        lvl = new Level(lvl)
      }
      lvl.stops.push(stop)
      lvls.set(lvl.id, lvl)
    }
    // Update
    this.stops = newStops
    this.pathways = Array.from(pwIndex.values())
    this.levels = Array.from(lvls.values())
    // Update stoplist
    return Array.from(toFetch)
  }

  // Mutations

  error (msg) {
    console.log('station error:', msg)
  }

  // STATION
  createStation ($apollo, ent) {
    return this.createStop($apollo, ent)
  }

  updateStation ($apollo, ent) {
    return this.updateStop($apollo, ent)
  }

  deleteStation ($apollo, ent) {
    return this.deleteStop($apollo, ent.stop)
  }

  // LEVELS
  createLevel ($apollo, ent) {
    ent.feed_version = { id: this.stop.feed_version.id }
    ent.parent = { id: this.stop.id }
    ent.setDefaults()
    const vars = { set: ent.value() }
    console.log('create level:', vars)
    const q = gql`mutation ($set: LevelSetInput!) {level_create(set:$set) {id}}`
    return $apollo.mutate({
      mutation: q,
      variables: vars
    })
  }

  updateLevel ($apollo, ent) {
    ent.feed_version = { id: this.stop.feed_version.id }
    ent.parent = { id: this.stop.id }
    const vars = { set: ent.value() }
    console.log('update level:', vars)
    const q = gql`mutation ($set: LevelSetInput!) {level_update(set:$set) {id}}`
    return $apollo.mutate({
      mutation: q,
      variables: vars
    })
  }

  deleteLevel ($apollo, ent) {
    console.log('delete level:', ent)
    const q = gql`mutation ($id: Int!) {level_delete(id:$id) {id}}`
    return $apollo.mutate({
      mutation: q,
      variables: { id: ent.id }
    })
  }

  // PATHWAYS
  createPathway ($apollo, ent) {
    ent.feed_version = { id: this.stop.feed_version.id }
    ent.setDefaults()
    const vars = { set: ent.value() }
    console.log('create pathway:', vars)
    const q = gql`mutation ($set: PathwaySetInput!) {pathway_create(set:$set) {id}}`
    return $apollo.mutate({
      mutation: q,
      variables: vars
    })
  }

  updatePathway ($apollo, ent) {
    const vars = { set: ent.value() }
    console.log('update pathway:', vars)
    const q = gql`mutation ($set: PathwaySetInput!) {pathway_update(set:$set) {id}}`
    return $apollo.mutate({
      mutation: q,
      variables: vars
    })
  }

  deletePathway ($apollo, pw) {
    console.log('delete pathway:', pw.value())
    const q = gql`mutation ($id: Int!) {pathway_delete(id:$id) {id}}`
    return $apollo.mutate({
      mutation: q,
      variables: { id: pw.id }
    })
  }

  // STOPS
  createStop ($apollo, ent) {
    console.log('create stop raw:', ent)
    if (!this.feed_version?.id) {
      ent.feed_version = { id: this.stop.feed_version.id }
      ent.parent = { id: this.stop.id }
    }
    ent.setDefaults()
    const vars = { set: ent.value() }
    console.log('create stop:', vars)
    const q = gql`mutation ($set: StopSetInput!) {stop_create(set:$set) {id}}`
    return $apollo.mutate({
      mutation: q,
      variables: vars
    })
  }

  updateStop ($apollo, ent) {
    if (ent.id === this.stop.id) {
      ent.parent = { id: null }
    }
    const vars = { set: ent.value() }
    console.log('update stop:', vars)
    const q = gql`mutation ($set: StopSetInput!) {stop_update(set:$set) {id}}`
    return $apollo.mutate({
      mutation: q,
      variables: vars
    })
  }

  deleteStop ($apollo, ent) {
    console.log('delete stop:', ent.value())
    const q = gql`mutation ($id: Int!) {stop_delete(id:$id) {id}}`
    return $apollo.mutate({
      mutation: q,
      variables: { id: ent.id }
    })
  }

  // Associations
  importStop ($apollo, ent, _cb) {
    console.log('node:', ent, 'this.stop:', this.stop)
    if (ent.feed_version?.id === this.stop.feed_version?.id) {
      ent.parent = { id: this.stop.id }
      return this.updateStop($apollo, ent)
    }
    throw new Error('temporarily unsupported')
  }

  createAssociation ($apollo, ent) {
    _ = $apollo
    _ = ent
  }

  deleteAssociation ($apollo, ent) {
    _ = $apollo
    _ = ent
  }
}
