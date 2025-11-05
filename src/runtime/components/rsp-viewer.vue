<template>
  <div>
    <o-field grouped>
      <o-field label="Trip pattern" class="pr-4">
        <o-select
          v-model="activePatternId"
          placeholder="Select a trip pattern"
          class="trip-select"
        >
          <optgroup label="Inbound">
            <option v-for="pattern of inboundPatterns" :key="pattern.stop_pattern_id" :value="pattern.stop_pattern_id">
              {{ pattern.desc }}
            </option>
          </optgroup>
          <optgroup label="Outbound">
            <option v-for="pattern of outboundPatterns" :key="pattern.stop_pattern_id" :value="pattern.stop_pattern_id">
              {{ pattern.desc }}
            </option>
          </optgroup>
        </o-select>
      </o-field>
      <o-field label="Transfers within (m)" expanded>
        <o-slider
          v-model="radius"
          class="radius-select"
          size="medium"
          :min="0"
          :max="500"
          :step="100"
          ticks
          lazy
        >
          <template v-for="val in [0, 100, 250, 500]" :key="val">
            <o-slider-tick :value="val">
              {{ val }}
            </o-slider-tick>
          </template>
        </o-slider>
      </o-field>
    </o-field>

    <tl-loading v-if="loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="processedPatterns.length === 0">
      No trip patterns were found for this route.
    </div>
    <ul v-else-if="activePattern" class="stop-list">
      <li v-for="(st) of activePattern.stop_times" :key="st.stop_sequence">
        <p class="route-stop-name">
          <nuxt-link
            :to="makeStopLink(st.stop.onestop_id, st.stop.feed_onestop_id, st.stop.feed_version_sha1, st.stop.stop_id, parseInt(st.stop.id), linkVersion)"
          >
            {{ st.stop.stop_name }}
          </nuxt-link>
        </p>
        <div v-if="includeNearbyStops">
          <div
            v-for="(rss, agency) of st.stop.routes"
            :key="agency"
            class="route-link"
          >
            <div v-if="multiAgency" class="agency-name">
              {{ agency }}
            </div>
            <div v-for="rs of rss" :key="rs.id">
              <nuxt-link
                :to="makeRouteLink(rs.onestop_id, rs.feed_onestop_id, rs.feed_version_sha1, rs.route_id, parseInt(rs.id), linkVersion)"
              >
                <tl-route-icon
                  :agency-name="rs.agency_name"
                  :route-short-name="rs.route_short_name"
                  :route-type="rs.route_type"
                  :route-long-name="rs.route_long_name"
                />
              </nuxt-link>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// @ts-expect-error - haversine doesn't have types
import haversine from 'haversine'
import { gql } from 'graphql-tag'
import { ref, computed } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { makeStopLink, makeRouteLink } from '../lib/filters'

// Types
interface RouteResponse {
  id: string
  route_id: string
  route_short_name: string
  route_long_name: string
  onestop_id: string
  feed_onestop_id: string
  feed_version_sha1: string
  patterns: {
    direction_id: number
    stop_pattern_id: string
    count: number
    trips: {
      id: string
      trip_id: string
      trip_headsign: string
      direction_id: number
      stop_times: {
        stop_sequence: number
        stop: {
          id: string
          onestop_id: string
          stop_id: string
          stop_name: string
          location_type: number
          geometry: {
            coordinates: [number, number]
          }
          feed_onestop_id: string
          feed_version_sha1: string
          nearby_stops?: {
            id: string
            onestop_id: string
            stop_id: string
            stop_name: string
            location_type: number
            geometry: {
              coordinates: [number, number]
            }
            feed_onestop_id: string
            feed_version_sha1: string
            route_stops: {
              route: {
                id: string
                route_id: string
                route_short_name: string
                route_long_name: string
                route_type: number
                onestop_id: string
                feed_onestop_id: string
                feed_version_sha1: string
                agency: {
                  id: string
                  agency_id: string
                  agency_name: string
                }
              }
            }[]
          }[]
        }
      }[]
    }[]
  }[]
}

// Extract individual types from the response type
type _Route = RouteResponse
type Pattern = RouteResponse['patterns'][0]
type Trip = Pattern['trips'][0]
type StopTime = Trip['stop_times'][0]
type Stop = StopTime['stop']
type Geometry = Stop['geometry']
type NearbyStop = NonNullable<Stop['nearby_stops']>[0]
type RouteStop = NearbyStop['route_stops'][0]
type _Agency = RouteStop['route']['agency']

// Processing types
interface ProcessedStopTime {
  stop_sequence: number
  stop: {
    id: string
    stop_id: string
    stop_name: string
    onestop_id: string
    feed_version_sha1: string
    feed_onestop_id: string
    routes: Record<string, ProcessedRoute[]>
  }
}

interface ProcessedRoute {
  distance: number
  id: string
  route_id: string
  onestop_id: string
  feed_onestop_id: string
  feed_version_sha1: string
  route_short_name: string
  route_long_name: string
  route_type: number
  agency_id: string
  agency_name: string
}

interface ProcessedPattern {
  stop_pattern_id: string
  count: number
  desc: string
  direction_id: number
  trip: {
    trip_headsign: string
  }
  stop_times: ProcessedStopTime[]
}

// GraphQL query
const q = gql`
query ($route_ids: [Int!]!, $radius:Float!, $include_nearby_stops:Boolean!) {
  routes(ids: $route_ids) {
    id
    route_id
    route_short_name
    route_long_name
    onestop_id
    feed_onestop_id
    feed_version_sha1
    patterns {
      direction_id
      stop_pattern_id
      count
      trips(limit: 1) {
        id
        trip_id
        trip_headsign
        direction_id
        stop_times  {
          stop_sequence
          stop {
            id
            onestop_id
            stop_id
            stop_name
            location_type
            geometry
            feed_onestop_id
            feed_version_sha1
            nearby_stops(radius: $radius, limit: 1000) @include(if: $include_nearby_stops) {
              id
              onestop_id
              stop_id
              stop_name
              location_type
              geometry              
              feed_onestop_id
              feed_version_sha1
              route_stops {
                route {
                  id
                  route_id
                  route_short_name
                  route_long_name
                  route_type
                  onestop_id
                  feed_onestop_id
                  feed_version_sha1
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
      }
    }
  }
}
`

// Props
const props = withDefaults(defineProps<{
  routeIds: number[]
  transferRadius?: number
  linkVersion?: boolean
}>(), {
  transferRadius: 0,
  linkVersion: false
})

// Reactive state
const selectedPatternId = ref<string | null>(null)
const radius = ref<number>(props.transferRadius)
const error = ref<string | null>(null)

// Computed properties
const includeNearbyStops = computed(() => radius.value > 0)

// Apollo query
const { result: routesResult, loading, onError } = useQuery<{ routes: RouteResponse[] }>(q, () => ({
  route_ids: props.routeIds,
  radius: radius.value,
  include_nearby_stops: includeNearbyStops.value
}), {
  clientId: 'transitland',
  errorPolicy: 'all'
})

// Handle Apollo errors
onError((err) => {
  error.value = err.message
})

const routes = computed(() => routesResult.value?.routes || [])
const patterns = computed<Pattern[]>(() => {
  const pats: Pattern[] = []
  for (const route of routes.value) {
    for (const pat of route.patterns) {
      if (pat.trips && pat.trips.length > 0) {
        pats.push(pat)
      }
    }
  }
  return pats
})

const processedPatterns = computed<ProcessedPattern[]>(() => {
  let totalTrips = 0
  for (const pat of patterns.value) {
    totalTrips += pat.count
  }
  const ret: ProcessedPattern[] = []
  for (const pat of patterns.value) {
    // Exclude patterns with less than 10% of trips
    if (pat.count / totalTrips <= 0.1) {
      continue
    }
    if (!pat.trips || pat.trips.length === 0 || !pat.trips[0]?.stop_times) {
      continue
    }
    const pt = pat.trips[0]
    if (!pt || !pt.stop_times) {
      continue
    }
    const p: ProcessedPattern = {
      stop_pattern_id: pat.stop_pattern_id,
      count: pat.count,
      desc: pt.trip_headsign,
      direction_id: pt.direction_id,
      trip: {
        trip_headsign: pt.trip_headsign
      },
      stop_times: []
    }
    for (const st of pt.stop_times) {
      const nearbyRoutes = nearbyRouteStops(st.stop)
      const routesByAgency: Record<string, ProcessedRoute[]> = {}
      for (const rs of nearbyRoutes) {
        const a = routesByAgency[rs.agency_name] || []
        a.push(rs)
        routesByAgency[rs.agency_name] = a
      }
      p.stop_times.push({
        stop_sequence: st.stop_sequence,
        stop: {
          id: st.stop.id,
          stop_id: st.stop.stop_id,
          stop_name: st.stop.stop_name,
          onestop_id: st.stop.onestop_id,
          feed_version_sha1: st.stop.feed_version_sha1,
          feed_onestop_id: st.stop.feed_onestop_id,
          routes: routesByAgency
        }
      })
    }
    ret.push(p)
  }
  ret.sort((a, b) => b.count - a.count)
  return ret
})

const activePattern = computed<ProcessedPattern | null>(() => {
  for (const pat of processedPatterns.value) {
    if (pat.stop_pattern_id === selectedPatternId.value) {
      return pat
    }
  }
  if (processedPatterns.value.length > 0 && processedPatterns.value[0]) {
    return processedPatterns.value[0]
  }
  return null
})

const activePatternId = computed({
  get (): string | null {
    if (selectedPatternId.value) {
      return selectedPatternId.value
    }
    if (processedPatterns.value.length > 0 && processedPatterns.value[0]) {
      return processedPatterns.value[0].stop_pattern_id
    }
    return null
  },
  set (v: string | null) {
    selectedPatternId.value = v
  }
})

const multiAgency = computed<boolean>(() => {
  const a = new Set<string>()
  for (const pat of patterns.value) {
    if (!pat.trips[0]?.stop_times) continue
    for (const st of pat.trips[0].stop_times) {
      for (const ns of st.stop.nearby_stops || []) {
        for (const rs of ns.route_stops || []) {
          a.add(rs.route.agency.agency_name)
        }
      }
    }
  }
  return a.size > 1
})

const inboundPatterns = computed<ProcessedPattern[]>(() => {
  return processedPatterns.value.filter(s => s.direction_id === 0)
})

const outboundPatterns = computed<ProcessedPattern[]>(() => {
  return processedPatterns.value.filter(s => s.direction_id !== 0)
})
// Functions
function nearbyRouteStops (stop: Stop): ProcessedRoute[] {
  const rids = new Set<string>()
  for (const route of routes.value) {
    rids.add(route.onestop_id)
  }
  const ret: ProcessedRoute[] = []
  for (const ns of (stop.nearby_stops || [])) {
    const stopDist = hsin(stop.geometry, ns.geometry)
    if (ns.location_type !== 0) {
      continue
    }
    for (const rs of ns.route_stops || []) {
      const routeKey = rs.route.onestop_id
      if (routeKey && rids.has(routeKey)) {
        continue
      }
      rids.add(routeKey)
      ret.push({
        distance: stopDist,
        id: rs.route.id,
        route_id: rs.route.route_id,
        onestop_id: rs.route.onestop_id,
        feed_onestop_id: rs.route.feed_onestop_id,
        feed_version_sha1: rs.route.feed_version_sha1,
        route_short_name: rs.route.route_short_name,
        route_long_name: rs.route.route_long_name,
        route_type: rs.route.route_type,
        agency_id: rs.route.agency.agency_id,
        agency_name: rs.route.agency.agency_name
      })
    }
  }
  return ret.sort((a, b) => a.distance - b.distance)
}

function hsin (fromPoint: Geometry, toPoint: Geometry): number {
  const d = haversine({
    latitude: fromPoint.coordinates[1],
    longitude: fromPoint.coordinates[0]
  }, {
    latitude: toPoint.coordinates[1],
    longitude: toPoint.coordinates[0]
  }, { unit: 'meter' })
  return d
}
</script>

<style scoped>
.connecting-routes {
    padding-left:20px;
}
.stop-list p {
  padding-left:40px;
}
.stop-list li .route-link {
  margin-top:5px;
  margin-left:40px;
}
.stop-list li {
  margin:0px;
  padding:10px;
}
.stop-list li {
  background-image: url( '/svg/route-middle-1.svg' ) ;
  background-repeat: no-repeat;
  background-size:20px 4000px;
  background-position:0px -18px;
}
.stop-list li:first-child {
  background-image: url( '/svg/route-start.svg' ) ;
  background-repeat: no-repeat;
  background-size:20px 4000px;
  background-position:0px 10px;
}
.stop-list li:last-child {
  background-image: url( '/svg/route-end.svg' ) ;
  background-repeat: no-repeat;
  background-size:20px 100px;
  background-position:0px -18px;
}
.route-stop-name {
  font-weight:bold;
  margin-bottom:10px;
}
.agency-name {
  margin:0px;
  margin-top:10px;
  margin-bottom:10px;
}

.trip-select {
  min-width:400px;
  width:400px;
}
</style>
