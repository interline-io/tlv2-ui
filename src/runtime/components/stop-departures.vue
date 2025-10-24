<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <tl-loading v-if="loading" />

      <div v-else-if="!coordsOrStops">
        <h6 class="title is-6">
          Click the map to set a departure location
        </h6>
      </div>

      <div v-else-if="filteredStopsGroupRoutes.length === 0">
        <h6 class="title is-6">
          No results
        </h6>
        <p>Unfortunately, no departures were found at this location for the selected location and time.</p>
        <p>Try increasing the search radius or selecting the "fallback service day" option.</p>
      </div>

      <div v-if="showLastFetched && lastFetched" :key="lastFetchedDisplayKey" class="tags has-addons">
        <span class="tag is-small">Last checked</span>
        <span class="tag is-success is-small">{{ fromNowDate(lastFetched) }}</span>
      </div>

      <div v-for="(ss, sskey) of filteredStopsGroupRoutes" :key="sskey" class="mb-3">
        <div class="agency-header title is-6">
          {{ ss.agency.agency_name }}
        </div>
        <div v-for="(sr,srkey) of ss.routes.slice(0,routesPerAgencyShadow)" :key="srkey" class="tl-departure-container">
          <div
            class="tl-departure-route"
          >
            <nuxt-link
              :to="makeRouteLink(sr.route.onestop_id, sr.route.feed_onestop_id, sr.route.feed_version_sha1, sr.route.route_id, sr.route.id, false)"
            >
              <tl-route-icon
                :key="'icon'+sr.route.id"
                :route-type="sr.route.route_type"
                :route-short-name="sr.route.route_short_name"
                :route-long-name="sr.trip_headsign || sr.route.route_long_name"
                :route-link="sr.route.route_url"
              />
            </nuxt-link>
          </div>
          <div class="tl-departure-times">
            <span v-for="st of sr.departures.slice(0,3)" :key="st.trip.id" class="tl-departure-time tag">
              <template v-if="st.departure.estimated">
                {{ reformatHMS(st.departure.estimated) }} &nbsp;<o-icon variant="success" size="small" icon="wifi" />
              </template><template v-else>
                {{ reformatHMS(st.departure.scheduled) }} &nbsp;<o-icon variant="success" size="small" icon="blank" />
              </template>
            </span>
          </div>
        </div>
        <div v-if="ss.routes.length > routesPerAgencyShadow" class="is-clearfix">
          <span class="button is-small ml-5" @click="expandRoutesPerAgency">Click to show {{ ss.routes.length - routesPerAgencyShadow }} additional rows</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gql } from 'graphql-tag'
import { ref, computed, watch, onMounted, toRef } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import type { Geometry, Feature, Point } from 'geojson'
import { fromNowDate, makeRouteLink, reformatHMS } from '../lib/filters'
import { haversineLonLat, type LonLat } from '../geom'

// Types
interface StopDeparturesResponse {
  stops: {
    id: number
    onestop_id: string
    stop_id: string
    stop_name: string
    stop_code?: string
    location_type: number
    geometry: Point
    route_stops: {
      route: {
        id: number
        route_id: string
        onestop_id?: string
        route_short_name?: string
        route_long_name?: string
        route_type: number
        route_color?: string
        route_text_color?: string
        route_url?: string
        feed_onestop_id: string
        feed_version_sha1?: string
        geometry?: Geometry
      }
    }[]
    departures: {
      departure_time: string
      departure: {
        delay?: number
        estimated?: string
        estimated_utc?: string
        scheduled: string
        stop_timezone?: string
        uncertainty?: number
      }
      trip: {
        id: number
        trip_id: string
        trip_headsign?: string
        direction_id: number
        route: {
          id: number
          route_id: string
          onestop_id?: string
          route_short_name?: string
          route_long_name?: string
          route_color?: string
          route_text_color?: string
          route_type: number
          route_url?: string
          feed_onestop_id: string
          agency: {
            id: number
            agency_id: string
            agency_name: string
          }
        }
      }
    }[]
  }[]
}

// Extract individual types from the response type
type Stop = StopDeparturesResponse['stops'][0]
type RouteStop = Stop['route_stops'][0]
type Route = RouteStop['route']
type DepartureTime = Stop['departures'][0]
type Trip = DepartureTime['trip']
type Agency = Trip['route']['agency']

// Feature property interfaces
interface StopProperties {
  stop_id: string
  stop_name: string
}

interface RouteProperties {
  id: number
  route_short_name: string
  route_long_name: string
  route_type: number
  route_color: string
  headway_secs: number
}

// Typed GeoJSON Features
interface RouteGroup {
  route: Route
  trip_headsign?: string
  direction_id: number
  id: string
  departures: DepartureTime[]
}

interface AgencyGroup {
  agency: Agency
  routes: RouteGroup[]
}

interface AgencyGroupRecord {
  agency: Agency
  routes: Record<string, RouteGroup>
}

interface QueryVariables {
  stopIds?: number[]
  where?: {
    near?: {
      lon: number
      lat: number
      radius: number
    }
  }
  stwhere: {
    use_service_window?: boolean
    next?: number
  }
}

const props = withDefaults(defineProps<{
  searchCoords?: LonLat
  searchRadius?: number
  nextSeconds?: number
  routesPerAgency?: number
  showLastFetched?: boolean
  autoRefreshInterval?: number
  autoRefresh?: boolean
  useServiceWindow?: boolean
  stopIds?: number[]
}>(), {
  searchCoords: null,
  showLastFetched: true,
  searchRadius: 200,
  nextSeconds: 7200,
  routesPerAgency: 5,
  useServiceWindow: true,
  autoRefreshInterval: 60,
  autoRefresh: true,
  stopIds: () => []
})

const query = gql`
query( $stopIds: [Int!], $where: StopFilter, $stwhere: StopTimeFilter, $includeGeometry: Boolean! = false) {
  stops(where: $where, ids: $stopIds) {
    id
    onestop_id
    stop_id
    stop_name
    stop_code
    location_type
    geometry
    route_stops {
      route {
        id
        route_id
        route_short_name
        route_long_name
        route_type
        route_color
        route_text_color
        feed_onestop_id
        geometry @include(if:$includeGeometry)
      }
    }
    departures(where: $stwhere) {
      departure_time
      departure {
        delay
        estimated
        estimated_utc
        scheduled
        stop_timezone
        uncertainty
      }
      trip {
        id
        trip_id
        trip_headsign
        direction_id
        route {
            id
            route_id
            onestop_id
            route_short_name
            route_long_name
            route_color
            route_text_color
            route_type
            route_url
            feed_onestop_id
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
`

// Reactive data
const timer = ref<NodeJS.Timeout | null>(null)
const error = ref<string | null>(null)
const lastFetched = ref<Date | null>(null)
const lastFetchedDisplayKey = ref<number>(0) // force redraw
const routesPerAgencyShadow = ref<number>(props.routesPerAgency)
const stops = ref<Stop[]>([])

// Computed properties for Apollo query
const coordsOrStops = computed<boolean>(() => {
  return (!!props.searchCoords || props.stopIds.length > 0)
})

const queryVariables = computed<QueryVariables>(() => {
  const q: QueryVariables = {
    stwhere: {
      use_service_window: props.useServiceWindow,
      next: props.nextSeconds
    }
  }
  if (props.stopIds.length > 0) {
    q.stopIds = props.stopIds
  } else if (props.searchCoords && props.searchRadius && props.searchRadius > 0) {
    q.where = {
      near: {
        lon: props.searchCoords.lon,
        lat: props.searchCoords.lat,
        radius: props.searchRadius
      }
    }
  }
  return q
})

// Apollo query
const { result, loading, refetch, onResult, onError } = useQuery<StopDeparturesResponse>(
  query,
  queryVariables,
  {
    enabled: coordsOrStops
  }
)

// Handle Apollo results
onResult((queryResult) => {
  if (queryResult.data?.stops) {
    resetTimer()
    stops.value = queryResult.data.stops
    lastFetched.value = new Date()
  }
})

onError((e) => {
  error.value = e.message
})

const filteredStops = computed<Stop[]>(() => {
  return stops.value.filter((s) => {
    return s.departures.length > 0 && s.location_type === 0 && s.geometry.coordinates
  }).sort((a, b) => {
    const ad = haversineLonLat(props.searchCoords, { lon: a.geometry.coordinates[0], lat: a.geometry.coordinates[1] })
    const bd = haversineLonLat(props.searchCoords, { lon: b.geometry.coordinates[0], lat: b.geometry.coordinates[1] })
    return ad - bd
  })
})

const filteredStopsGroupRoutes = computed<AgencyGroup[]>(() => {
  const makeRouteKey = function (d: DepartureTime): string {
    return `${d.trip.direction_id}:${d.trip.route.route_short_name}:${d.trip.route.route_long_name}:${d.trip.trip_headsign}`
  }
  // group routes by agency
  const agencyGroups: Record<string, AgencyGroupRecord> = {}
  const seenRoutes: Record<string, boolean> = {}
  for (const stop of filteredStops.value) {
    for (const d of stop.departures) {
      const agencyKey = d.trip.route.agency.agency_name
      const routeKey = makeRouteKey(d)
      if (seenRoutes[routeKey]) {
        continue
      }
      const a = agencyGroups[agencyKey] || {
        agency: d.trip.route.agency,
        routes: {}
      }
      const r = a.routes[routeKey] || {
        route: d.trip.route,
        trip_headsign: d.trip.trip_headsign,
        direction_id: d.trip.direction_id,
        id: routeKey,
        departures: []
      }
      r.departures.push(d)
      a.routes[routeKey] = r
      agencyGroups[agencyKey] = a
    }
    for (const d of stop.departures) {
      seenRoutes[makeRouteKey(d)] = true
    }
  }
  const ret: AgencyGroup[] = []
  for (const agencyGroup of Object.values(agencyGroups)) {
    const routes = Object.values(agencyGroup.routes).sort((a, b) => {
      const aa = a.departures[0].departure.estimated || a.departures[0].departure.scheduled
      const bb = b.departures[0].departure.estimated || b.departures[0].departure.scheduled
      if (aa > bb) {
        return 1
      }
      if (aa < bb) {
        return -1
      }
      return 0
    })
    ret.push({
      agency: agencyGroup.agency,
      routes
    })
  }
  // order by number of departures
  ret.sort((a, b) => {
    let aa = 0
    for (const r of a.routes) {
      aa += r.departures.length
    }
    let bb = 0
    for (const r of b.routes) {
      bb += r.departures.length
    }
    if (aa < bb) {
      return 1
    }
    if (aa > bb) {
      return -1
    }
    return 0
  })
  return ret
})

const startTimer = (): void => {
  timer.value = setInterval(() => {
    if (props.autoRefresh) {
      refetchDepartures()
    }
  }, props.autoRefreshInterval * 1000)
}

const resetTimer = (): void => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  startTimer()
}

const refetchDepartures = (): void => {
  refetch()
}

const expandRoutesPerAgency = (): void => {
  routesPerAgencyShadow.value = 1000
}

// Watchers
watch(() => props.autoRefresh, (v) => {
  // Helper to restart interval
  if (v) {
    refetchDepartures()
  }
})

watch(() => props.searchCoords, () => {
  stops.value = []
})

// Lifecycle
onMounted(() => {
  // Force redraw
  setInterval(() => {
    lastFetchedDisplayKey.value += 1
  }, 1000)
})
</script>

<style scoped>
.tl-departure-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.tl-departure-route {
  flex-grow:1;
  white-space: nowrap;
  min-width:240px;
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 90%, rgba(0,0,0,0));
  mask-image: linear-gradient(to right, rgba(0,0,0,1) 90%, rgba(0,0,0,0));
}
.tl-departure-times {
  display: flex;
  flex-direction: row;
}
.tl-departure-time {
  display: flex;
  padding:6px;
  width:80px;
  margin-right:5px;
}

.tl-route-icon-departures {
  text-align:left;
  display:inline-block;
  margin:0px;
  padding:0px;
  padding-top:5px;
  white-space: nowrap;
}

.tl-route-icon-departures .message {
  margin-right:5px;
  width:80px;
}

.tl-route-icon-departures .message .icon {
  display:inline-block;
  width:20px;
}

/* .tl-route-icon-fade-out {
} */

.agency-header {
  font-weight: 600;
  color: var(--bulma-text-strong, #363636);
  margin-bottom: 0.5rem;
}
</style>
