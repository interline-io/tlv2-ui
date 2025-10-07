<template>
  <div>
    <o-field grouped expanded>
      <o-field expanded>
        <o-autocomplete
          class="tl-map-search-autocomplete"
          expanded
          placeholder="Search stops. Example: Penn Station"
          group-field="type"
          group-options="items"
          :data="searchFiltered"
          :clearable="true"
          icon="magnify"
          @typing="typing"
          @select="option => setLocation(option.geometry.coordinates)"
        >
          <template #default="slotProps">
            {{ slotProps.option.name }}
            <span v-if="slotProps.option.agencyName" class="tag">{{ slotProps.option.agencyName }}</span>
            <div v-for="rs of slotProps.option.routeStops || []" :key="rs.route.id" class="clearfix tag">
              {{ rs.route.agency.agency_name }} :{{ rs.route.route_short_name }}
            </div>
          </template>
        </o-autocomplete>
      </o-field>
      <o-field>
        <tl-geolocation @set-location="setLocation" />
      </o-field>
    </o-field>
  </div>
</template>

<script setup lang="ts">
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { ref, computed, watch, withDefaults } from 'vue'

// Type definitions
interface Geometry {
  type: string
  coordinates: number[]
}

interface Agency {
  id: number
  agency_name: string
}

interface Route {
  id: number
  route_short_name?: string
  route_long_name?: string
  agency: Agency
  route_stops: RouteStop[]
}

interface RouteStop {
  route: Route
  stop?: Stop
}

interface Stop {
  id: number
  geometry: Geometry
  onestop_id: string
  stop_name: string
  route_stops: RouteStop[]
}

interface SearchItem {
  name: string
  routeStops?: RouteStop[]
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

interface Polygon {
  type: 'Polygon'
  coordinates: number[][][]
}

interface QueryVariables {
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

interface Props {
  bbox?: [BboxCoordinate, BboxCoordinate] | null
  includeStops?: boolean
  includeRoutes?: boolean
}

interface Emits {
  setLocation: [coords: number[]]
}

// Props and emits
const props = withDefaults(defineProps<Props>(), {
  bbox: null,
  includeStops: false,
  includeRoutes: false
})

const emit = defineEmits<Emits>()

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

// Bounded query (with bbox)
const {
  result: boundedResult,
  loading: boundedLoading,
  error: boundedError
} = useQuery<QueryResult, QueryVariables>(
  searchQuery,
  () => ({
    includeStops: props.includeStops,
    includeRoutes: props.includeRoutes,
    routeFilter: {
      search: search.value,
      within: bboxPolygon.value || undefined
    },
    stopFilter: {
      search: search.value,
      within: bboxPolygon.value || undefined
    }
  }),
  () => ({
    enabled: search.value.length >= minSearchLength && !!bboxPolygon.value
  })
)

// Unbounded query (no bbox)
const {
  result: unboundedResult,
  loading: unboundedLoading,
  error: unboundedError
} = useQuery<QueryResult, QueryVariables>(
  searchQuery,
  () => ({
    includeStops: props.includeStops,
    includeRoutes: props.includeRoutes,
    routeFilter: {
      search: search.value
    },
    stopFilter: {
      search: search.value
    }
  }),
  () => ({
    enabled: search.value.length >= minSearchLength
  })
)

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

const searchFiltered = computed<SearchGroup[]>(() => {
  const stops: SearchItem[] = []
  const boundedStopIds: Record<number, boolean> = {}

  for (const stop of boundedStops.value) {
    boundedStopIds[stop.id] = true
    const agencyName = (stop.route_stops.length > 0) ? stop.route_stops[0].route.agency.agency_name : ''
    stops.push({ name: stop.stop_name, routeStops: stop.route_stops, agencyName, geometry: stop.geometry })
  }

  for (const stop of unboundedStops.value) {
    if (!boundedStopIds[stop.id]) {
      const agencyName = (stop.route_stops.length > 0) ? stop.route_stops[0].route.agency.agency_name : ''
      stops.push({ name: stop.stop_name, routeStops: stop.route_stops, agencyName, geometry: stop.geometry })
    }
  }

  const routes: SearchItem[] = []
  const boundedRouteIds: Record<number, boolean> = {}

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

  console.log('routes:', routes)

  const ret: SearchGroup[] = []
  if (props.includeRoutes) {
    ret.push({ type: 'Routes', items: routes })
  }
  if (props.includeStops) {
    ret.push({ type: 'Stops', items: stops })
  }
  return ret
})

// Methods
function setLocation (coords: number[]): void {
  emit('setLocation', coords)
}

function typing (val: string): void {
  if (val.length >= minSearchLength) {
    search.value = val
  }
}
</script>
