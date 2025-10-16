<template>
  <div>
    <o-field grouped expanded>
      <o-field expanded>
        <div style="position: relative;">
          <o-autocomplete
            v-model:input="searchInput"
            class="tl-map-search-autocomplete"
            expanded
            placeholder="Search stops. Example: Penn Station"
            :options="searchFilteredOptions"
            :clearable="true"
            icon="magnify"
            @input="handleInput"
            @select="handleSelect"
          >
            <template #default="{ option }">
              {{ option.label }}
              <span v-if="option.agencyName" class="tag">{{ option.agencyName }}</span>
              <div v-for="rs of option.routeStops || []" :key="rs.route.id" class="clearfix tag">
                {{ rs.route.agency.agency_name }} :{{ rs.route.route_short_name }}
              </div>
            </template>
          </o-autocomplete>
          <div v-if="isLoading" class="loading-indicator" style="position: absolute; top: 12px; right: 40px;" />
        </div>
      </o-field>
      <o-field>
        <tl-geolocation @set-location="setLocation" />
      </o-field>
    </o-field>
  </div>
</template>

<script setup lang="ts">
import { gql } from 'graphql-tag'
import { useLazyQuery } from '@vue/apollo-composable'
import { ref, computed, watch, withDefaults } from 'vue'
import type { Geometry, Polygon, Point } from 'geojson'

// Type definitions

interface Route {
  id: number
  route_short_name?: string
  route_long_name?: string
  agency: {
    id: number
    agency_name: string
  }
  route_stops: {
    route: Route
    stop?: Stop
  }[]
}

interface Stop {
  id: number
  geometry: Point
  onestop_id: string
  stop_name: string
  route_stops: {
    route: {
      id: number
      route_short_name?: string
      route_long_name?: string
      agency: {
        id: number
        agency_name: string
      }
    }
  }[]
}

interface SearchItem {
  name: string
  routeStops?: Stop['route_stops']
  agencyName: string
  geometry: Geometry | null
}

interface SearchGroup {
  type: string
  items: SearchItem[]
}

interface BboxCoordinate {
  0: number
  1: number
}

interface QueryVariables extends Record<string, unknown> {
  includeStops: boolean
  includeRoutes: boolean
  routeFilter: {
    search: string
    within?: Polygon
  }
  stopFilter: {
    search: string
    within?: Polygon
  }
}

interface QueryResult {
  stops?: Stop[]
  routes?: Route[]
}

// Props and emits
const props = withDefaults(defineProps<{
  bbox?: [BboxCoordinate, BboxCoordinate] | null
  includeStops?: boolean
  includeRoutes?: boolean
}>(), {
  bbox: null,
  includeStops: false,
  includeRoutes: false
})

const emit = defineEmits<{
  setLocation: [coords: number[]]
}>()

// GraphQL query
const searchQuery = gql`
query($stopFilter: StopFilter, $routeFilter: RouteFilter, $includeStops: Boolean=false, $includeRoutes: Boolean=false) {
  routes(limit: 10, where:$routeFilter) @include(if: $includeRoutes) {
    id
    route_short_name
    route_long_name
    route_stops(limit:1) {
      stop {
        id
        geometry
      }
    }
    agency {
      id
      agency_name
    }
  }
  stops(limit: 10, where:$stopFilter) @include(if: $includeStops) {
    id
    geometry
    onestop_id
    stop_name
    route_stops {
      route {
        id
        route_short_name
        route_long_name
        agency {
          id
          agency_name
        }
      }
    }
  }
}
`

// Reactive data
const search = ref('')
const searchInput = ref('')
const error = ref<string | null>(null)
const minSearchLength = 4
const coords = ref<number[] | null>(null)
const boundedStops = ref<Stop[]>([])
const unboundedStops = ref<Stop[]>([])
const boundedRoutes = ref<Route[]>([])
const unboundedRoutes = ref<Route[]>([])

// Computed properties
const bboxPolygon = computed<Polygon | null>(() => {
  if (!props.bbox) { return null }
  const sw = props.bbox[0]
  const ne = props.bbox[1]
  const coords = [[
    [sw[0], sw[1]],
    [ne[0], sw[1]],
    [ne[0], ne[1]],
    [sw[0], ne[1]],
    [sw[0], sw[1]]
  ]]
  return { type: 'Polygon', coordinates: coords }
})

// Computed property to check if any query is loading
const isLoading = computed<boolean>(() => {
  return boundedLoading.value || unboundedLoading.value
})

// Bounded query (with bbox)
const {
  load: loadBoundedQuery,
  result: boundedResult,
  loading: boundedLoading,
  error: boundedError
} = useLazyQuery<QueryResult, QueryVariables>(searchQuery)

// Unbounded query (no bbox)
const {
  load: loadUnboundedQuery,
  result: unboundedResult,
  loading: unboundedLoading,
  error: unboundedError
} = useLazyQuery<QueryResult, QueryVariables>(searchQuery)

// Watch for query results and update local state
watch(boundedResult, (data) => {
  if (data) {
    boundedStops.value = data.stops || []
    boundedRoutes.value = data.routes || []
  }
}, { immediate: true })

watch(unboundedResult, (data) => {
  if (data) {
    unboundedStops.value = data.stops || []
    unboundedRoutes.value = data.routes || []
  }
}, { immediate: true })

// Watch for bbox changes and re-execute search if we have a search term
watch(() => props.bbox, () => {
  if (search.value.length >= minSearchLength) {
    executeSearchQueries()
  }
})

// Sync searchInput with search for consistency
watch(searchInput, (newValue) => {
  if (newValue !== search.value) {
    handleInput(newValue)
  }
})

// For Oruga autocomplete, we need a flat array of options with grouped structure
const searchFilteredOptions = computed(() => {
  const options: any[] = []
  const boundedStopIds: Record<number, boolean> = {}
  const boundedRouteIds: Record<number, boolean> = {}

  // Process stops
  const stops: SearchItem[] = []
  for (const stop of boundedStops.value) {
    boundedStopIds[stop.id] = true
    const agencyName = (stop.route_stops.length > 0) ? stop.route_stops[0].route.agency.agency_name : ''
    console.log('Processing bounded stop:', stop.stop_name, 'geometry:', stop.geometry)
    stops.push({ name: stop.stop_name, routeStops: stop.route_stops, agencyName, geometry: stop.geometry })
  }

  for (const stop of unboundedStops.value) {
    if (!boundedStopIds[stop.id]) {
      const agencyName = (stop.route_stops.length > 0) ? stop.route_stops[0].route.agency.agency_name : ''
      console.log('Processing unbounded stop:', stop.stop_name, 'geometry:', stop.geometry)
      stops.push({ name: stop.stop_name, routeStops: stop.route_stops, agencyName, geometry: stop.geometry })
    }
  }

  // Process routes
  const routes: SearchItem[] = []
  for (const route of boundedRoutes.value) {
    boundedRouteIds[route.id] = true
    const geometry = (route.route_stops.length > 0) ? route.route_stops[0].stop?.geometry || null : null
    const routeName = route.route_short_name || route.route_long_name || 'Unnamed Route'
    routes.push({ name: routeName, agencyName: route.agency.agency_name, geometry })
  }

  for (const route of unboundedRoutes.value) {
    if (!boundedRouteIds[route.id]) {
      const geometry = (route.route_stops.length > 0) ? route.route_stops[0].stop?.geometry || null : null
      const routeName = route.route_short_name || route.route_long_name || 'Unnamed Route'
      routes.push({ name: routeName, agencyName: route.agency.agency_name, geometry })
    }
  }

  // Create grouped options for Oruga
  if (props.includeRoutes && routes.length > 0) {
    options.push({
      label: 'Routes',
      options: routes.map(route => ({
        label: route.name,
        value: route,
        agencyName: route.agencyName,
        geometry: route.geometry
      }))
    })
  }

  if (props.includeStops && stops.length > 0) {
    options.push({
      label: 'Stops',
      options: stops.map(stop => ({
        label: stop.name,
        value: stop,
        agencyName: stop.agencyName,
        geometry: stop.geometry,
        routeStops: stop.routeStops
      }))
    })
  }

  console.log('options:', options)
  return options
})

// Execute search queries
function executeSearchQueries (): void {
  if (search.value.length < minSearchLength) {
    // Clear results if search is too short
    boundedStops.value = []
    unboundedStops.value = []
    boundedRoutes.value = []
    unboundedRoutes.value = []
    return
  }

  // Execute unbounded query (always runs when search is long enough)
  loadUnboundedQuery(undefined, {
    includeStops: props.includeStops,
    includeRoutes: props.includeRoutes,
    routeFilter: {
      search: search.value
    },
    stopFilter: {
      search: search.value
    }
  })

  // Execute bounded query only if bbox is available
  if (bboxPolygon.value) {
    loadBoundedQuery(undefined, {
      includeStops: props.includeStops,
      includeRoutes: props.includeRoutes,
      routeFilter: {
        search: search.value,
        within: bboxPolygon.value
      },
      stopFilter: {
        search: search.value,
        within: bboxPolygon.value
      }
    })
  } else {
    // Clear bounded results if no bbox
    boundedStops.value = []
    boundedRoutes.value = []
  }
}

// Methods
function setLocation (coords: number[]): void {
  emit('setLocation', coords)
}

function handleInput (val: string): void {
  search.value = val
  console.log('handleInput:', val)
  executeSearchQueries()
}

function handleSelect (option: any): void {
  console.log('selected option:', JSON.stringify(option, null, 2))

  // Try to get coordinates from multiple possible locations
  let coordinates: number[] | null = null

  if (option?.geometry?.coordinates) {
    console.log('Found coordinates at option.geometry.coordinates:', option.geometry.coordinates)
    coordinates = option.geometry.coordinates
  } else if (option?.value?.geometry?.coordinates) {
    console.log('Found coordinates at option.value.geometry.coordinates:', option.value.geometry.coordinates)
    coordinates = option.value.geometry.coordinates
  }

  if (coordinates && Array.isArray(coordinates) && coordinates.length >= 2) {
    console.log('Setting location to:', coordinates)
    setLocation(coordinates)
  } else {
    console.log('No valid coordinates found in option. Geometry structures found:')
    console.log('option.geometry:', option?.geometry)
    console.log('option.value?.geometry:', option?.value?.geometry)
  }
}
</script>

<style scoped>
/* Simple loading indicator */
.loading-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
