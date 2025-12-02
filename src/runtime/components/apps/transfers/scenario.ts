import dayjs from 'dayjs'
import { haversinePosition, type Point, type Polygon } from '../../../geom'
import { gql } from 'graphql-tag'
import { TreeNode } from '../../../lib/tree'
import { useRouteCategories } from '../../../composables/useRouteCategories'
import { toSeconds, windowToSeconds } from '../../../lib/time-format'
import { NewGraph, Profiles, type Graph, type CostFunction } from './graph'
import { FeedVersion, type Stop } from './station'

const { routeSubcategoriesTree, routeRunningWaysTree } = useRouteCategories()

// ============================================================================
// GraphQL Query Type Definitions
// ============================================================================

export interface FeedInfo {
  id: number
  feed_version: number
  feed_start_date?: string
  feed_end_date?: string
}

export interface FeedVersionGtfsImport {
  success: boolean
  in_progress: boolean
}

export interface FeedVersionData {
  id: number
  sha1: string
  file?: string
  name?: string
  fetched_at: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  feed: {
    id: number
    onestop_id: string
    name?: string
  }
  feed_infos?: FeedInfo[]
  feed_version_gtfs_import?: FeedVersionGtfsImport
}

export interface FeedData {
  id: number
  onestop_id: string
  name?: string
  feed_state?: {
    feed_version?: {
      id: number
      stops?: any[]
    }
  }
  feed_versions: FeedVersionData[]
}

export interface AnalystFeedQueryResponse {
  feeds: FeedData[]
}

interface LevelData {
  id: number
  level_id: string
}

interface PathwayData {
  id: number
  pathway_id: string
  is_bidirectional: number
  length?: number
  max_slope?: number
  min_width?: number
  pathway_mode: number
  reverse_signposted_as?: string
  signposted_as?: string
  stair_count?: number
  traversal_time?: number
  from_stop: {
    id: number
    stop_id: string
    stop_name: string
    geometry: Point
    location_type: number
    level?: LevelData
  }
  to_stop: {
    id: number
    stop_id: string
    stop_name: string
    geometry: Point
    location_type: number
    level?: LevelData
  }
}

interface StopQueryData {
  id: number
  stop_name: string
  stop_id: string
  location_type: number
  geometry: Point
  feed_version: {
    id: number
  }
  level?: LevelData
  parent?: {
    id: number
    stop_id: string
    stop_name: string
    location_type: number
    geometry: Point
  }
  pathways_from_stop?: PathwayData[]
  pathways_to_stop?: PathwayData[]
}

interface AnalystStopQueryResponse {
  feed_versions: {
    stops: StopQueryData[]
  }[]
}

interface AnalystStopQueryVariables {
  feed_version_ids: number[]
  geometry: Polygon
}

interface RouteAttribute {
  category?: number
  subcategory?: number
  running_way?: number
}

interface AgencyData {
  id: number
  agency_id: string
  agency_name: string
}

interface RouteData {
  id: number
  route_id: string
  route_type: number
  route_short_name?: string
  route_long_name?: string
  route_attribute?: RouteAttribute
  agency: AgencyData
}

interface TripData {
  id: number
  direction_id: number
  trip_id: string
  trip_headsign?: string
  route: RouteData
}

interface StopTimeStopData {
  id: number
  stop_id: string
  stop_name: string
}

interface StopTimeData {
  scheduled_arrival_time_str: string
  scheduled_departure_time_str: string
  stop_sequence: number
  stop_headsign?: string
  stop: StopTimeStopData
  trip: TripData
}

interface ObservationData {
  schedule_relationship?: string
  source: string
  trip_start_date: string
  from_stop_id: string
  to_stop_id: string
  stop_id: string
  agency_id: string
  route_id: string
  trip_id: string
  stop_sequence: number
  scheduled_arrival_time_str: string
  scheduled_departure_time_str: string
  observed_arrival_time_str?: string
  observed_departure_time_str?: string
}

interface StopStopTimesData {
  id: number
  stop_name: string
  stop_id: string
  location_type: number
  geometry: Point
  feed_version: {
    id: number
    fetched_at: string
    sha1: string
    name?: string
    feed: {
      id: number
      onestop_id: string
    }
  }
  arrivals: StopTimeData[]
  departures: StopTimeData[]
  observations?: ObservationData[]
}

interface ScenarioStopStopTimesQueryVariables {
  stop_ids: number[]
  service_date: string
  start_time?: number
  end_time?: number
}

interface ScenarioStopStopTimesQueryResponse {
  stopStopTimes: StopStopTimesData[]
}

// ============================================================================
// GraphQL Query Definitions
// ============================================================================

export const analystFeedQuery = gql`
fragment feed on Feed {
  id
  onestop_id
  name
  feed_state {
    feed_version {
      id
      stops(limit: 1, where: { within: $geometry }) {
        id
      }
    }
  }
  feed_versions(limit:300) {
    id
    sha1
    file
    name
    fetched_at
    earliest_calendar_date
    latest_calendar_date
    feed {
      id
      onestop_id
      name
    }
    feed_infos(limit:1) {
      id
      feed_version
      feed_start_date
      feed_end_date
    }
    feed_version_gtfs_import {
      success
      in_progress
    }
    stops(limit: 1, where: { within: $geometry }) {
      id
    }
  }
}

query analystFeedQuery($geometry: Polygon) {
  feeds(where: { within: $geometry }) {
    ...feed
  }
}`

export const analystStopQuery = gql`
query analystStopQuery($feed_version_ids: [Int!]!, $geometry: Polygon!) {
    feed_versions(ids: $feed_version_ids) {
      stops(where: { within: $geometry }) {
        id
        stop_name
        stop_id
        location_type
        geometry
        feed_version {
          id
        }
        level {
          id
          level_id
        }
        parent {
          id
          stop_id
          stop_name
          location_type
          geometry
        }
        pathways_from_stop {
          id
          pathway_id
          is_bidirectional
          length
          max_slope
          min_width
          pathway_mode
          reverse_signposted_as
          signposted_as
          stair_count
          traversal_time
          from_stop {
            id
            stop_id
            stop_name
            geometry
            location_type
            level {
              id
              level_id
            }
          }
          to_stop {
            id
            stop_id
            stop_name
            geometry
            location_type
            level {
              id
              level_id
            }
          }
        }
        pathways_to_stop {
          id
          pathway_id
          is_bidirectional
          length
          max_slope
          min_width
          pathway_mode
          reverse_signposted_as
          signposted_as
          stair_count
          traversal_time
          from_stop {
            id
            stop_id
            stop_name
            geometry
            location_type
            level {
              id
              level_id
            }
          }
          to_stop {
            id
            stop_id
            stop_name
            geometry
            location_type
            level {
              id
              level_id
            }
          }
        }
      }
    }
  }`

export const scenarioStopStopTimesQuery = gql`
  fragment stopTime on StopTime {
    scheduled_arrival_time_str: arrival_time
    scheduled_departure_time_str: departure_time
    stop_sequence
    stop_headsign
    stop {
      id
      stop_id
      stop_name
    }
    trip {
      id
      direction_id
      trip_id
      trip_headsign
      route {
        id
        route_id
        route_type
        route_short_name
        route_long_name
        route_attribute {
          category
          subcategory
          running_way
        }
        agency {
          id
          agency_id
          agency_name
        }
      }
    }
  }

  query scenarioStopStopTimesQuery (
    $stop_ids: [Int!]!
    $service_date: Date!
    $start_time: Int
    $end_time: Int
  ) {
    stopStopTimes: stops(ids: $stop_ids) {
      id
      stop_name
      stop_id
      location_type
      geometry
      feed_version {
        id
        fetched_at
        sha1
        name
        feed {
          id
          onestop_id
        }
      }    
      arrivals(
        limit: 1000,
        where: {
          service_date: $service_date
          start_time: $start_time
          end_time: $end_time
        }
      ) {
        ...stopTime
      }
      departures(
        limit: 1000,
        where: {
          service_date: $service_date
          start_time: $start_time
          end_time: $end_time
        }
      ) {
        ...stopTime
      }
      observations(
        limit: 1000,
        where: {
          feed_version_id: 910
          trip_start_date: $service_date
          source: "TripUpdate"
        }
      ) {
        schedule_relationship
        source
        trip_start_date
        from_stop_id
        to_stop_id
        stop_id: to_stop_id
        agency_id
        route_id
        trip_id
        stop_sequence
        scheduled_arrival_time_str: scheduled_arrival_time
        scheduled_departure_time_str: scheduled_departure_time
        observed_arrival_time_str: observed_arrival_time
        observed_departure_time_str: observed_departure_time
      }
    }
  }`

// ============================================================================
// Type Exports for GraphQL Query Variables and Responses
// ============================================================================

export type {
  AnalystStopQueryResponse,
  AnalystStopQueryVariables,
  ScenarioStopStopTimesQueryResponse,
  ScenarioStopStopTimesQueryVariables,
  StopStopTimesData,
  StopTimeData,
  ObservationData,
  RouteData,
  TripData
}

// ============================================================================
// Domain Type Definitions
// ============================================================================

interface SelectedFeedVersionData {
  id: number | string
  serviceDate?: string
}

interface FeedVersionOptionData {
  id?: number | string
  serviceDate?: string
  hasDepartures?: boolean
  hasStops?: boolean
  feedVersion: FeedVersionData
}

interface ScenarioData {
  selectedFeedVersions?: SelectedFeedVersionData[]
  timeOfDay?: string
  excludeIncomingTrips?: string[]
  excludeOutgoingTrips?: string[]
  tripFilterGroups?: string[]
  profileName?: string | null
  useStopObservations?: boolean
  transferScoringBreakpoints?: number[]
  transferOverrides?: TransferOverrides
  hideSubsequentTransfers?: number
}

interface ScenarioResultData {
  incomingArrivals?: StopTimeEvent[]
  outgoingDepartures?: StopTimeEvent[]
  incomingTripTree?: TreeNode
  outgoingTripTree?: TreeNode
}

interface ProcessedFeedVersion {
  id: number
  fetched_at: string
  name?: string
  sha1: string
  feed: {
    id: number
    onestop_id: string
  }
}

interface ProcessedRoute {
  id: number
  route_id: string
  route_short_name?: string
  route_long_name?: string
  route_attribute?: RouteAttribute
  agency: AgencyData
}

interface ProcessedTrip {
  id: number
  trip_id: string
  trip_headsign?: string
  direction_id: number
  feed_version: ProcessedFeedVersion
  route: ProcessedRoute
}

interface StopTimeEvent {
  arrival_time: number
  departure_time: number
  scheduled_arrival_time: number
  scheduled_departure_time: number
  observed_arrival_time: number | null
  observed_departure_time: number | null
  schedule_relationship: string | null
  stop: {
    id: number
    stop_id: string
    stop_name: string
  }
  trip: ProcessedTrip
}

interface StopTimeEventsResult {
  incomingArrivals: StopTimeEvent[]
  outgoingDepartures: StopTimeEvent[]
}

interface FilterDeparturesResult {
  tree: TreeNode
  stopTimeEvents: StopTimeEvent[]
}

interface PathwayEdge {
  pathway: PathwayData | undefined
  cost: number
}

interface Transfer {
  id: number
  trip_key: number
  trip_id: string
  schedule_relationship: string | null
  agency_key: number
  agency_id: string
  agency_name: string
  route_id: string
  route_name?: string
  route: ProcessedRoute
  stop_key: number
  stop_id: string
  stop_name: string
  departure_time: number
  observed_departure_time: number | null
  scheduled_departure_time: number
  trip_headsign?: string
  transfer_time: number
  transfer_walking_time: number
  transfer_walking_distance: number
  transfer_uses_pathways: boolean
  transfer_override: boolean
  transfer_edges: PathwayEdge[]
  buffer_time: number
  scheduled_buffer_time: number
  observed_buffer_time: number | null
}

interface TransferGroup {
  id: number
  trip_key: number
  trip_id: string
  agency_key: number
  agency_id: string
  trip_headsign?: string
  schedule_relationship: string | null
  route_key: number
  route_id: string
  route_name?: string
  route: ProcessedRoute
  stop_key: number
  stop_id: string
  stop_name: string
  arrival_time: number
  scheduled_arrival_time: number
  observed_arrival_time: number | null
  agency_name: string
  hidden_transfers: Transfer[]
  transfers: Transfer[]
}

interface StopGeometry {
  latitude: number
  longitude: number
}

// ============================================================================
// Constants
// ============================================================================

const routeSubcategories = routeSubcategoriesTree()
const routeRunningWays = routeRunningWaysTree()

// ============================================================================
// Helper Functions
// ============================================================================

export function feedVersionDisplayName (fv: FeedVersionData): string {
  if (!fv.feed) {
    return fv.fetched_at ? dayjs(fv.fetched_at).format('MMMM D, YYYY') : 'Unknown Feed Version'
  }
  const feedKey = fv.feed.onestop_id
  const feedName = fv.feed.name || feedKey
  const date = dayjs(fv.fetched_at).format('MMMM D, YYYY')
  const versionName = fv.name || (fv.sha1.substring(0, 8) + '...')
  let displayName = `${feedName}: ${versionName} (${date})`
  if (feedKey === 'historic') {
    // use UTC
    displayName = `Historic RG for ${fv.fetched_at.substring(0, 7)}`
  } else if (feedKey === 'RG') {
    displayName = `Daily RG for ${date}`
  }
  return displayName
}

export function feedVersionDefaultDate (fv: FeedVersionData): string | null {
  if (!fv.fetched_at || !fv.feed) {
    return null
  }
  if (fv.feed.onestop_id === 'historic') {
    // use UTC day for historic fetched_at
    return fv.fetched_at.substring(0, 10)
  }
  return dayjs(fv.fetched_at).format('YYYY-MM-DD')
}

// ============================================================================
// Transfer Overrides
// ============================================================================

export class TransferOverrides {
  _m: Map<number, Map<number, number>>

  constructor (v?: string) {
    this._m = new Map()
    for (const elem of (v || '').split(',')) {
      const s = elem.split('|')
      if (s.length !== 3) {
        continue
      }
      const key0 = s[0]
      const key1 = s[1]
      const key2 = s[2]
      if (key0 !== undefined && key1 !== undefined && key2 !== undefined) {
        this.set(key0, key1, key2)
      }
    }
  }

  set (fromStop: string | number, toStop: string | number, t: string | number): void {
    const a = (fromStop === '*' ? -1 : Number.parseInt(String(fromStop)))
    const b = (toStop === '*' ? -1 : Number.parseInt(String(toStop)))
    const c = Number.parseInt(String(t))
    const sm = this._m.get(a) || new Map()
    sm.set(b, c)
    this._m.set(a, sm)
  }

  unset (fromStop: string | number, toStop: string | number): void {
    const a = (fromStop === '*' ? -1 : Number.parseInt(String(fromStop)))
    const b = (toStop === '*' ? -1 : Number.parseInt(String(toStop)))
    const sm = this._m.get(a) || new Map()
    sm.delete(b)
    sm.delete(-1)
    this._m.set(a, sm)
    if (a === -1) {
      this._m.delete(-1)
    }
  }

  get (fromStop: number, toStop: number): number | null {
    // -1 is *
    const a = this._m.get(fromStop) || this._m.get(-1)
    if (!a) {
      return null
    }
    return a.get(toStop) ?? a.get(-1) ?? null
  }

  getQueryString (): string {
    const a: string[] = []
    for (const [k, v] of this._m.entries()) {
      const skey = (k === -1 ? '*' : String(k))
      for (const [subk, subv] of v.entries()) {
        const subkey = (subk === -1 ? '*' : String(subk))
        a.push(`${skey}|${subkey}|${subv}`)
      }
    }
    return a.join(',')
  }
}

// ============================================================================
// Selected Feed Version
// ============================================================================

export class SelectedFeedVersion {
  id: number
  serviceDate?: string

  constructor (v: SelectedFeedVersionData) {
    this.id = Number.parseInt(String(v.id))
    this.serviceDate = v.serviceDate
  }
}

// ============================================================================
// Feed Version Option
// ============================================================================

export class FeedVersionOption {
  id: number
  serviceDate?: string
  hasDepartures?: boolean
  hasStops?: boolean
  feedOnestopId?: string
  fetchedAt: string
  defaultServiceDate: string | null
  displayName: string
  start_date?: string
  end_date?: string
  sha1?: string

  constructor (v: FeedVersionOptionData) {
    const fv = new FeedVersion(v.feedVersion)
    this.id = Number.parseInt(String(v.id || fv.id))
    this.serviceDate = v.serviceDate
    this.hasDepartures = v.hasDepartures
    this.hasStops = v.hasStops
    this.feedOnestopId = fv.feed?.onestop_id
    this.fetchedAt = fv.fetched_at ?? ''
    this.defaultServiceDate = feedVersionDefaultDate(v.feedVersion)
    this.displayName = feedVersionDisplayName(v.feedVersion)
    this.start_date = fv.earliest_calendar_date
    this.end_date = fv.latest_calendar_date
    this.sha1 = v.feedVersion.sha1
  }
}

// ============================================================================
// Scenario
// ============================================================================

export class Scenario {
  selectedFeedVersions: SelectedFeedVersion[]
  allowFuzzyMatching: boolean
  timeOfDay: string
  excludeIncomingTrips: string[]
  excludeOutgoingTrips: string[]
  tripFilterGroups: string[]
  profileName: string | null
  useStopObservations?: boolean
  transferScoringBreakpoints: number[]
  transferOverrides: TransferOverrides
  hideSubsequentTransfers: number

  constructor (v?: ScenarioData) {
    v = v || {}
    this.selectedFeedVersions = (v.selectedFeedVersions || []).map(s => new SelectedFeedVersion(s))
    this.allowFuzzyMatching = true
    this.timeOfDay = v.timeOfDay || '05:00-07:00'
    this.excludeIncomingTrips = v.excludeIncomingTrips || []
    this.excludeOutgoingTrips = v.excludeOutgoingTrips || []
    this.tripFilterGroups = v.tripFilterGroups || ['feed_version', 'route_category', 'agency', 'route', 'trip_headsign']
    this.profileName = v.profileName || 'Straight-line'
    this.useStopObservations = v.useStopObservations
    this.transferScoringBreakpoints = (v.transferScoringBreakpoints || [-5 * 60, 0, 6 * 60, 10 * 60, 20 * 60]).slice(0)
    this.transferOverrides = v.transferOverrides || new TransferOverrides()
    this.hideSubsequentTransfers = v.hideSubsequentTransfers || 0
  }
}

export function NewScenario (v?: ScenarioData): Scenario {
  return new Scenario(v)
}

// ============================================================================
// Scenario Result
// ============================================================================

export class ScenarioResult {
  incomingArrivals: StopTimeEvent[]
  outgoingDepartures: StopTimeEvent[]
  incomingTripTree: TreeNode
  outgoingTripTree: TreeNode
  filteredIncomingArrivals: StopTimeEvent[]
  filteredOutgoingDepartures: StopTimeEvent[]
  transferGroups: TransferGroup[]

  constructor (v?: ScenarioResultData) {
    v = v || {}
    this.incomingArrivals = v.incomingArrivals || []
    this.outgoingDepartures = v.outgoingDepartures || []
    this.incomingTripTree = v.incomingTripTree || new TreeNode({})
    this.outgoingTripTree = v.outgoingTripTree || new TreeNode({})
    this.filteredIncomingArrivals = []
    this.filteredOutgoingDepartures = []
    this.transferGroups = []
  }
}

export function NewScenarioResult (
  scenario: Scenario | null,
  station: { stops: Stop[] } | null,
  stopStopTimes: StopStopTimesData[] | null
): ScenarioResult {
  const result = new ScenarioResult({})
  if (!scenario || !station || !stopStopTimes) {
    return result
  }
  const serviceWindow = windowToSeconds(scenario.timeOfDay)
  const ste = stopTimeEvents(stopStopTimes)
  const filteredArrivals = filterDepartures(scenario, scenario.excludeIncomingTrips, ste.incomingArrivals)
  const fa2 = filteredArrivals.stopTimeEvents.filter((d) => {
    return (
      (d.scheduled_departure_time || d.departure_time) >= serviceWindow[0]
      && (d.scheduled_departure_time || d.departure_time) < serviceWindow[1]
    )
  })

  const filteredDepartures = filterDepartures(scenario, scenario.excludeOutgoingTrips, ste.outgoingDepartures)
  const tgs = calculateTransfers(
    station.stops,
    fa2,
    filteredDepartures.stopTimeEvents,
    scenario.profileName,
    scenario.transferScoringBreakpoints,
    scenario.transferOverrides,
    scenario.hideSubsequentTransfers
  )
  result.incomingArrivals = ste.incomingArrivals
  result.outgoingDepartures = ste.outgoingDepartures
  result.incomingTripTree = filteredArrivals.tree
  result.outgoingTripTree = filteredDepartures.tree
  result.filteredIncomingArrivals = filteredArrivals.stopTimeEvents
  result.filteredOutgoingDepartures = filteredDepartures.stopTimeEvents
  result.transferGroups = tgs
  return result
}

// ============================================================================
// Filter Departures
// ============================================================================

/**
 * Check if any route attributes exist in the stop time events
 */
function hasRouteAttributes (stopTimeEvents: StopTimeEvent[]): boolean {
  for (const ste of stopTimeEvents) {
    const attr = ste.trip.route.route_attribute
    if (attr && (attr.category !== undefined || attr.subcategory !== undefined || attr.running_way !== undefined)) {
      return true
    }
  }
  return false
}

/**
 * Filter trip filter groups to remove route attribute levels if they don't exist
 */
function filterTripFilterGroups (groups: string[], stopTimeEvents: StopTimeEvent[]): string[] {
  const hasAttributes = hasRouteAttributes(stopTimeEvents)
  if (hasAttributes) {
    return groups
  }
  // Remove route attribute levels if no attributes exist
  return groups.filter(g =>
    g !== 'route_category'
    && g !== 'route_subcategory'
    && g !== 'route_running_way'
  )
}

export function filterDepartures (
  scenario: Scenario,
  tripFilter: string[],
  stopTimeEvents: StopTimeEvent[]
): FilterDeparturesResult {
  const filteredGroups = filterTripFilterGroups(scenario.tripFilterGroups, stopTimeEvents)
  const tree = makeTripTree('', stopTimeEvents, filteredGroups)
  const deps = tree.selectAll().setUnselected(tripFilter).setIndet().getSelectedDeps().map((s: any) => s.trip.id)
  const includeTrips = new Set(deps)

  // take only earliest stopTimeEvent per trip
  const seenTrips = new Map<number, number>()
  const filteredDepartures = stopTimeEvents.filter((ste) => {
    const tripId = ste.trip.id
    const arrivalTime = ste.arrival_time
    const seen = seenTrips.get(tripId)
    if (seen !== undefined && seen < arrivalTime) {
      return false
    }
    seenTrips.set(tripId, arrivalTime)
    return includeTrips.has(tripId)
  })
  return { tree, stopTimeEvents: filteredDepartures }
}

// ============================================================================
// Make Trip Tree
// ============================================================================

function makeTripTree (pkey: string, deps: StopTimeEvent[], groups: string[]): TreeNode {
  if (!groups || groups.length === 0) {
    return new TreeNode({})
  }
  const ret = new TreeNode({ key: pkey })
  const group = groups[0]
  for (const dep of deps) {
    const tn: {
      key?: string
      name?: string
      opts?: Record<string, any>
    } = {}

    switch (group) {
      case 'feed_version':
        tn.key = String(dep.trip.feed_version.id)
        tn.name = feedVersionDisplayName(dep.trip.feed_version)
        tn.opts = { style: 'bold' }
        break
      case 'agency':
        tn.key = dep.trip.route.agency.agency_id
        tn.name = dep.trip.route.agency.agency_name
        break
      case 'route': {
        tn.key = dep.trip.route.route_id
        const shortName = dep.trip.route.route_short_name
        const longName = dep.trip.route.route_long_name
        if (shortName && longName) {
          tn.name = `${shortName}: ${longName}`
        } else if (shortName) {
          tn.name = shortName
        } else if (longName) {
          tn.name = longName
        } else {
          tn.name = dep.trip.route.route_id || 'Unnamed route'
        }
        tn.opts = {
          routeCategory: dep.trip.route.route_attribute?.category,
          routeSubcategory: dep.trip.route.route_attribute?.subcategory,
          showCategory: false
        }
        break
      }
      case 'direction_id':
        tn.key = String(dep.trip.direction_id)
        tn.name = (dep.trip.direction_id === 0) ? 'Direction: inbound' : 'Direction: outbound'
        break
      case 'trip_headsign':
        tn.key = dep.trip.trip_headsign
        tn.name = tn.key
        break
      case 'route_category':
        tn.key = String(dep.trip.route.route_attribute?.category ?? -1)
        tn.name = ''
        tn.opts = {
          routeCategory: dep.trip.route.route_attribute?.category ?? -1,
          showCategory: true,
        }
        break
      case 'route_subcategory': {
        const subcat = dep.trip.route.route_attribute?.subcategory
        tn.key = String(subcat)
        tn.name = (subcat !== undefined && routeSubcategories.children[subcat]?.name) || 'Default'
        break
      }
      case 'route_running_way': {
        const runningWay = dep.trip.route.route_attribute?.running_way
        tn.key = String(runningWay)
        tn.name = 'Running Way: ' + ((runningWay !== undefined && routeRunningWays.children[runningWay]?.name) || 'Default')
        break
      }
      case 'trip':
        tn.key = dep.trip.trip_id
        tn.name = dep.trip.trip_id
        break
    }

    tn.key = pkey + '|' + tn.key
    const a = ret.children[tn.key] || new TreeNode(tn)
    a.deps.push(dep)
    ret.children[tn.key] = a
  }

  for (const [k, v] of Object.entries(ret.children)) {
    const child = ret.children[k]
    if (child) {
      child.children = makeTripTree(v.key, v.deps as StopTimeEvent[], groups.slice(1)).children
    }
  }
  return ret
}

// ============================================================================
// Stop Time Events
// ============================================================================

function stopTimeEvents (stopStopTimes: StopStopTimesData[]): StopTimeEventsResult {
  // Lookups for stop to fvid and route_id to route
  const fvLookup: Record<number, StopStopTimesData['feed_version']> = {}
  const routeLookup: Record<string, RouteData> = {}

  for (const stop of stopStopTimes) {
    fvLookup[stop.feed_version.id] = stop.feed_version
    for (const st of stop.arrivals) {
      routeLookup[st.trip.route.route_id] = st.trip.route
    }
    for (const st of stop.departures) {
      routeLookup[st.trip.route.route_id] = st.trip.route
    }
  }

  const incomingArrivals: StopTimeEvent[] = []
  const outgoingDepartures: StopTimeEvent[] = []

  for (const stop of stopStopTimes) {
    const stopObs: Record<string, ObservationData> = {}

    // Add stop observations to static events and create new stop time events for ADDED trips
    for (const obs of (stop.observations || [])) {
      stopObs[obs.trip_id] = obs
      if (obs.schedule_relationship !== 'ADDED') {
        continue
      }
      const rt = routeLookup[obs.route_id]
      if (!rt) {
        console.log('no route found for added trip, skipping', obs)
        continue
      }
      // should look like a graphql stop_time fragment
      // these values will be copied again in depfn
      const fv = fvLookup[stop.id]
      if (!fv) {
        console.log('no feed version for stop of added trip, skipping', stop.id)
        continue
      }
      const st: StopTimeData = {
        scheduled_arrival_time_str: obs.observed_arrival_time_str || '',
        scheduled_departure_time_str: obs.observed_departure_time_str || '',
        stop_sequence: obs.stop_sequence,
        stop: {
          id: stop.id,
          stop_id: stop.stop_id,
          stop_name: stop.stop_name
        },
        trip: {
          id: -1,
          trip_id: obs.trip_id,
          trip_headsign: 'Added trip',
          direction_id: 0,
          route: rt
        }
      }
      outgoingDepartures.push(depfn(st, obs, fv))
    }

    for (const st of stop.arrivals) {
      const fvData = fvLookup[stop.feed_version.id]
      if (fvData) {
        incomingArrivals.push(depfn(st, stopObs[st.trip.trip_id], fvData))
      }
    }
    for (const st of stop.departures) {
      const fvData = fvLookup[stop.feed_version.id]
      if (fvData) {
        outgoingDepartures.push(depfn(st, stopObs[st.trip.trip_id], fvData))
      }
    }
  }

  return { incomingArrivals, outgoingDepartures }
}

// ============================================================================
// Merge Stop Time with Observation
// ============================================================================

function depfn (
  st: StopTimeData,
  obs: ObservationData | undefined,
  fv: StopStopTimesData['feed_version']
): StopTimeEvent {
  const rtc = st.trip.route.route_attribute || {}
  const afv: ProcessedFeedVersion = {
    id: fv.id,
    fetched_at: fv.fetched_at,
    name: fv.name,
    sha1: fv.sha1,
    feed: {
      id: fv.feed.id,
      onestop_id: fv.feed.onestop_id
    }
  }

  const d: StopTimeEvent = {
    arrival_time: toSeconds(st.scheduled_arrival_time_str),
    departure_time: toSeconds(st.scheduled_departure_time_str),
    scheduled_arrival_time: toSeconds(st.scheduled_arrival_time_str),
    scheduled_departure_time: toSeconds(st.scheduled_departure_time_str),
    observed_arrival_time: null,
    observed_departure_time: null,
    schedule_relationship: null,
    stop: {
      id: st.stop.id,
      stop_id: st.stop.stop_id,
      stop_name: st.stop.stop_name
    },
    trip: {
      id: st.trip.id,
      trip_id: st.trip.trip_id,
      trip_headsign: st.trip.trip_headsign || st.stop_headsign,
      direction_id: st.trip.direction_id,
      feed_version: afv,
      route: {
        id: st.trip.route.id,
        route_id: st.trip.route.route_id,
        route_short_name: st.trip.route.route_short_name,
        route_long_name: st.trip.route.route_long_name,
        route_attribute: {
          category: rtc.category,
          subcategory: rtc.subcategory,
          running_way: rtc.running_way
        },
        agency: {
          id: st.trip.route.agency.id,
          agency_id: st.trip.route.agency.agency_id,
          agency_name: st.trip.route.agency.agency_name
        }
      }
    }
  }

  if (obs?.observed_arrival_time_str) {
    d.observed_arrival_time = toSeconds(obs.observed_arrival_time_str)
  }
  if (obs?.observed_departure_time_str) {
    d.observed_departure_time = toSeconds(obs.observed_departure_time_str)
  }
  if (obs?.schedule_relationship) {
    d.schedule_relationship = obs.schedule_relationship
  }

  return d
}

// ============================================================================
// Calculate Transfers
// ============================================================================

function calculateTransfers (
  stops: Stop[],
  incomingTrips: StopTimeEvent[],
  outgoingTrips: StopTimeEvent[],
  profileName: string | null,
  tsbp: number[],
  transferOverrides: TransferOverrides,
  hideSubsequentTransfers: number
): TransferGroup[] {
  const routeIndex = new Map<number, ProcessedRoute>()
  for (const d of incomingTrips) {
    routeIndex.set(d.trip.route.id, d.trip.route)
  }
  for (const d of outgoingTrips) {
    routeIndex.set(d.trip.route.id, d.trip.route)
  }

  const maxBefore = Math.min(...tsbp)
  const maxAfter = Math.max(...tsbp)

  // Get pathway profile
  const profile: CostFunction | undefined = profileName ? Profiles[profileName] : undefined

  // Sort into buckets to reduce comparisons
  const timeBucketSize = Math.abs(Math.max(...tsbp))
  const timeBuckets: Record<number, StopTimeEvent[]> = {}
  for (const d of outgoingTrips) {
    const bucket = Math.floor(d.departure_time / timeBucketSize)
    if (!timeBuckets[bucket]) {
      timeBuckets[bucket] = []
    }
    timeBuckets[bucket].push(d)
  }

  // geographic distances
  const pathwayDistances: Record<string, ReturnType<Graph['aStar']>> = {}
  const straightLineDistances: Record<string, number> = {}
  const stopGeomIndex = new Map<number, StopGeometry>()
  const pwIndex = new Map<number, PathwayData>()

  for (const s of stops) {
    if (s.geometry?.coordinates && s.geometry.coordinates.length >= 2) {
      const lat = s.geometry.coordinates[1]
      const lon = s.geometry.coordinates[0]
      if (lat !== undefined && lon !== undefined && s.id !== undefined) {
        stopGeomIndex.set(s.id, { latitude: lat, longitude: lon })
      }
    }
    for (const pw of s.pathways_from_stop || []) {
      if (pw.id !== undefined) {
        // Cast to PathwayData since Station.Pathway is compatible
        pwIndex.set(pw.id, pw as unknown as PathwayData)
      }
    }
    for (const pw of s.pathways_to_stop || []) {
      if (pw.id !== undefined) {
        // Cast to PathwayData since Station.Pathway is compatible
        pwIndex.set(pw.id, pw as unknown as PathwayData)
      }
    }
  }

  // build routing graph
  const graph = profile ? NewGraph(stops, profile) : null

  // check for possible transfers +/- a bucket
  let i = 0
  const transfers: TransferGroup[] = []

  for (const incomingTrip of incomingTrips) {
    i++
    const route = routeIndex.get(incomingTrip.trip.route.id)
    if (!route) {
      continue
    }

    const tripGroup: TransferGroup = {
      id: i,
      trip_key: incomingTrip.trip.id,
      trip_id: incomingTrip.trip.trip_id,
      agency_key: route.agency.id,
      agency_id: route.agency.agency_id,
      trip_headsign: incomingTrip.trip.trip_headsign,
      schedule_relationship: incomingTrip.schedule_relationship,
      route_key: route.id,
      route_id: route.route_id,
      route_name: route.route_short_name,
      route,
      stop_key: incomingTrip.stop.id,
      stop_id: incomingTrip.stop.stop_id,
      stop_name: incomingTrip.stop.stop_name,
      arrival_time: incomingTrip.arrival_time,
      scheduled_arrival_time: incomingTrip.scheduled_arrival_time,
      observed_arrival_time: incomingTrip.observed_arrival_time,
      agency_name: route.agency.agency_name,
      hidden_transfers: [],
      transfers: []
    }

    // Check the transfer timeBuckets bracketing this departure
    const b = Math.floor(incomingTrip.departure_time / timeBucketSize)
    const check = [...(timeBuckets[b - 1] || []), ...(timeBuckets[b] || []), ...(timeBuckets[b + 1] || [])]
    const tgTransfers: Transfer[] = []

    for (const outgoingTrip of check) {
      i++
      // ignore self
      if (incomingTrip.trip.id === outgoingTrip.trip.id) {
        continue
      }
      if (!incomingTrip.stop.id || !outgoingTrip.stop.id) {
        continue
      }

      // Check and cache straight-line dist
      const dkey = incomingTrip.stop.id + ':' + outgoingTrip.stop.id
      if (straightLineDistances[dkey] === undefined) {
        const ag = stopGeomIndex.get(incomingTrip.stop.id)
        const bg = stopGeomIndex.get(outgoingTrip.stop.id)
        if (!ag || !bg) {
          continue
        }
        straightLineDistances[dkey] = haversinePosition([ag.longitude, ag.latitude], [bg.longitude, bg.latitude])
      }

      let transferWalkDistance = straightLineDistances[dkey]
      let transferWalkTime = straightLineDistances[dkey] * 1.0
      let transferUsesPathways = false
      let transferOverride = false
      const transferEdges: PathwayEdge[] = []

      // Check and cache routing dist
      if (profile && graph && pathwayDistances[dkey] === undefined) {
        const rdist = graph.aStar(incomingTrip.stop.id, outgoingTrip.stop.id)
        pathwayDistances[dkey] = rdist
      }

      // Check if we have a calculated pathway distance for this transfer
      const pathwayDistance = pathwayDistances[dkey]
      if (pathwayDistance && pathwayDistance.distance !== null && pathwayDistance.distance > 0 && pathwayDistance.edges) {
        transferWalkTime = pathwayDistance.distance
        transferUsesPathways = true
        transferWalkDistance = 0.0
        for (const edge of pathwayDistance.edges.slice(0)) {
          transferEdges.push({
            pathway: pwIndex.get(edge.pathway_id),
            cost: edge.cost
          })
        }
      }

      // Check override values
      const overrideValue = transferOverrides.get(incomingTrip.stop.id, outgoingTrip.stop.id)
      if (overrideValue !== null) {
        console.log('using override value', overrideValue, 'from', incomingTrip.stop.id, 'to', outgoingTrip.stop.id)
        transferWalkTime = overrideValue
        transferUsesPathways = true
        transferOverride = true
        transferWalkDistance = 0.0
      }

      // Prepare output
      const outgoingRoute = routeIndex.get(outgoingTrip.trip.route.id)
      if (!outgoingRoute) {
        continue
      }

      const transferTime = (outgoingTrip.departure_time - incomingTrip.arrival_time)
      const bufferTime = transferTime - transferWalkTime

      // check if buffer is in bounds
      if (bufferTime < maxBefore || bufferTime > maxAfter) {
        continue
      }

      const t: Transfer = {
        id: i,
        trip_key: outgoingTrip.trip.id,
        trip_id: outgoingTrip.trip.trip_id,
        schedule_relationship: outgoingTrip.schedule_relationship,
        agency_key: outgoingRoute.agency.id,
        agency_id: outgoingRoute.agency.agency_id,
        agency_name: outgoingRoute.agency.agency_name,
        route_id: outgoingRoute.route_id,
        route_name: outgoingRoute.route_short_name,
        route: outgoingRoute,
        stop_key: outgoingTrip.stop.id,
        stop_id: outgoingTrip.stop.stop_id,
        stop_name: outgoingTrip.stop.stop_name,
        departure_time: outgoingTrip.departure_time,
        observed_departure_time: outgoingTrip.observed_departure_time,
        scheduled_departure_time: outgoingTrip.scheduled_departure_time,
        trip_headsign: outgoingTrip.trip.trip_headsign,
        transfer_time: transferTime,
        transfer_walking_time: transferWalkTime,
        transfer_walking_distance: transferWalkDistance,
        transfer_uses_pathways: transferUsesPathways,
        transfer_override: transferOverride,
        transfer_edges: transferEdges,
        buffer_time: bufferTime,
        scheduled_buffer_time: (outgoingTrip.scheduled_departure_time - incomingTrip.scheduled_arrival_time) - transferWalkTime,
        observed_buffer_time: null
      }

      if (outgoingTrip.observed_departure_time !== null && incomingTrip.observed_arrival_time !== null) {
        t.observed_buffer_time = (outgoingTrip.observed_departure_time - incomingTrip.observed_arrival_time) - transferWalkTime
      } else if (outgoingTrip.observed_departure_time !== null) {
        t.observed_buffer_time = (outgoingTrip.observed_departure_time - incomingTrip.scheduled_arrival_time) - transferWalkTime
      } else if (incomingTrip.observed_arrival_time !== null) {
        t.observed_buffer_time = (outgoingTrip.scheduled_departure_time - incomingTrip.observed_arrival_time) - transferWalkTime
      }

      tgTransfers.push(t)
    }

    // Sort by buffer time
    tgTransfers.sort((a, b) => a.buffer_time - b.buffer_time)

    // Filter out subsequent transfers AFTER sorting
    const tripGroupSeen = new Set<string>()
    tgTransfers.forEach((t) => {
      // If we've seen this transfer and it's beyond hideSubsequentTransfers values, skip
      const key = `${t.route_id}:${t.trip_headsign}`
      const tt = t.observed_buffer_time ?? t.buffer_time
      if (hideSubsequentTransfers > 0 && tripGroupSeen.has(key)) {
        console.log(
          'skipping transfer due to hideSubsequentTransfers:',
          hideSubsequentTransfers,
          'using time:', tt,
          'buffer_time:', t.buffer_time,
          'observed_buffer_time:', t.observed_buffer_time,
          'key:', key
        )
        tripGroup.hidden_transfers.push(t)
        return
      }
      if (tt > hideSubsequentTransfers) {
        tripGroupSeen.add(key)
      }
      tripGroup.transfers.push(t)
    })

    // Add transfers to result
    transfers.push(tripGroup)
  }

  return transfers.sort((a, b) => a.arrival_time - b.arrival_time)
}

// ============================================================================
// Scenario Parsing
// ============================================================================

export function parseScenarioFromUrl (
  query: Record<string, any>,
  feedVersions: FeedVersionData[],
  defaultSelectedFeedVersions: SelectedFeedVersion[]
): Scenario {
  const fvos: SelectedFeedVersion[] = []

  // Process query params
  const paramFvos = (turnStringOrArrayIntoArray(query.selectedFeedVersions) || [])
    .map((s: string) => {
      const a = (s || '').split(':')
      const id = Number.parseInt(a[0] || '0')
      let date = a.length > 1 ? a[1] : undefined

      if (!date) {
        const fv = feedVersions.find(f => f.id === id)
        if (fv) {
          date = feedVersionDefaultDate(fv) || undefined
        }
      }

      return new SelectedFeedVersion({
        id: id,
        serviceDate: date || ''
      })
    })

  if (paramFvos.length > 0) {
    fvos.push(...paramFvos)
  } else {
    fvos.push(...defaultSelectedFeedVersions)
  }

  // Set transfer scoring breakpoints
  let tsbp: number[] | undefined
  if (query.transferScoringBreakpoints) {
    tsbp = (query.transferScoringBreakpoints as string)
      .split(',')
      .map((s: string) => Number.parseInt(s))
      .filter(n => !Number.isNaN(n))
  }

  let useStopObservations = true
  if (query.useStopObservations) {
    useStopObservations = tryBool(query.useStopObservations)
  }

  return NewScenario({
    selectedFeedVersions: fvos,
    timeOfDay: (query.timeOfDay as string) || '05:00-07:00',
    profileName: query.profileName as string | undefined,
    transferScoringBreakpoints: tsbp,
    useStopObservations,
    excludeIncomingTrips: (turnStringOrArrayIntoArray(query.excludeIncomingTrips) || []) as string[],
    excludeOutgoingTrips: (turnStringOrArrayIntoArray(query.excludeOutgoingTrips) || []) as string[],
    hideSubsequentTransfers: tryNumber(query.hideSubsequentTransfers) ?? undefined,
    transferOverrides: new TransferOverrides(query.transferOverrides)
  })
}

function tryBool (value: string | boolean | undefined | null): boolean {
  if (value === 'false' || value === '') {
    return false
  }
  if (value === 'true' || value === true) {
    return true
  }
  return false
}

function tryNumber (value: string | number | undefined | null): number | null {
  const f = Number(value)
  if (Number.isNaN(f)) {
    return null
  }
  return f
}

function turnStringOrArrayIntoArray (value: string | string[] | null | undefined): string[] | null {
  if (value == null) {
    return null
  }
  if (value === '') {
    return []
  }
  const a = String(value).split(',')
  return a.length > 0 ? a : null
}
