<template>
  <client-only>
    <div class="tl-map">
      <tl-map-viewer
        :key="rerenderKey"
        :show-generated-geometries="showGeneratedGeometries"
        :show-problematic-geometries="showProblematicGeometries"
        :enable-scroll-zoom="true"
        :route-tiles="routeTiles"
        :stop-tiles="stopTiles"
        :zoom="initialZoom"
        :center="initialCenter"
        :hash="useHash"
        :markers="markers"
        :features="activeFeatures"
        :auto-fit="false"
        :hide-tiles="activeTab === DIRECTIONS_TAB"
        map-class="tall"
        :show-stop-types="showStopTypes"
        @set-zoom="mapSetZoom"
        @set-agency-features="routesSetAgencyFeatures"
        @map-click="mapClick"
        @map-move="mapMove"
      />

      <div class="tl-map-panel tl-map-panel-tabs">
        <o-tabs v-model="activeTab" class="tl-tabs block" position="centered" type="boxed">
          <o-tab-item :value="ROUTES_TAB" label="Routes & Stops">
            <o-field addons class="mt-2">
              <o-field expanded class="is-fullwidth">
                  <template v-if="currentZoom < 8">
                    <p class="content">Zoom in to select routes and to see stop points.</p>
                  </template>
                  <template v-else-if="currentZoom >= 8 && currentZoom < 14 && Object.keys(agencyFeatures).length == 0">
                    <p class="content">Use your cursor to highlight routes.</p>
                    <p class="content">Click or tap for more information.</p>
                    <p class="content">Zoom in to see stop points.</p>
                  </template>
                  <template v-else-if="currentZoom >= 14 && Object.keys(agencyFeatures).length == 0">
                    <p class="content">Use your cursor to highlight routes and stops.</p>
                    <p class="content">Click or tap for more information.</p>
                  </template>
                  <p class="content block is-small">
                    <a href="https://www.transit.land/documentation/vector-tiles" target="_blank">Learn more about Transitland v2 Vector Tiles</a>
                  </p>
              </o-field>
              <o-field>
                <o-button variant="outlined" @click="showMapOptionsModal = true" role="button">
                  Map Options
                </o-button>
              </o-field>
            </o-field>

            <tl-map-route-stop-list
              v-if="activeTab === ROUTES_TAB"
              :agency-features="agencyFeatures"
              :is-component-modal-active="showRouteModal"
              @close="showRouteModal = false"
            />
          </o-tab-item>

          <o-tab-item :value="DEPARTURE_TAB" label="Departures">
            <tl-login-gate>
              <tl-map-search
                :bbox="currentBbox"
                :include-stops="true"
                @set-location="departuresSetLocation"
              />
              <tl-stop-departures
                v-if="activeTab === DEPARTURE_TAB"
                :show-auto-refresh="true"
                :show-fallback-selector="true"
                :show-radius-selector="true"
                :search-coords="departureCoords"
              />
              <p class="content block is-small pt-2">
                <a href="https://www.transit.land/documentation/rest-api/departures" target="_blank">Learn more about Transitland v2 REST API stop departures endpoint</a>
              </p>
              <template #loginText>
                <p>
                  You must be logged in to use this feature.
                </p>
              </template>
            </tl-login-gate>
          </o-tab-item>

          <o-tab-item :value="DIRECTIONS_TAB" label="Directions">
            <tl-login-gate role="tl_user_enterprise">
              <tl-msg-info>
                This feature is in a limited beta. <br>
                Please see the <a href="https://www.transit.land/documentation/routing-api/" target="_blank">Routing API docs</a><br>
                for current information and limitations.
              </tl-msg-info>
              <tl-directions
                :from-place="fromPlaceCoords"
                :to-place="toPlaceCoords"
                :mode="props.modeParam || 'TRANSIT'"
                :depart-at="departAt"
                @set-places="directionsSetPlaces"
                @set-mode="directionsSetMode"
                @set-features="directionsFeatures = $event"
                @reset="directionsReset"
                @set-depart-at="directionsSetDepartAt"
              />
              <template #loginText>
                <div />
              </template>
              <template #roleText>
                <div />
              </template>
            </tl-login-gate>
          </o-tab-item>
        </o-tabs>
      </div>
      <tl-map-options-modal
        v-model="showMapOptionsModal"
        v-model:show-stop-types="showStopTypes"
        v-model:show-generated-geometries="showGeneratedGeometries"
        v-model:show-problematic-geometries="showProblematicGeometries"
        title="Map Options"
      />
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { ref, computed, watch, useRoute, useRuntimeConfig, navigateTo } from '#imports'

// Interfaces
interface MapMarker {
  lng: number
  lat: number
  color: string
  label: string
  draggable: boolean
  onDragEnd?: (event: any) => void
}

interface MapMoveEvent {
  zoom: number
  bbox: number[]
}

interface MapClickEvent {
  lngLat: {
    lng: number
    lat: number
  }
}

interface Agency {
  agency_id: string
  agency_name: string
  operator: {
    onestop_id: string
    name: string
  }
}

interface Stop {
  stop_id: string
  stop_name: string
  location_type: number
  onestop_id: string
  feed_onestop_id: string
  feed_version_sha1: string
  agencies: string
}

interface Route {
  route_id: string
  route_short_name: string
  route_long_name: string
  route_color: string
  route_type: number
  agency_id: string
  agency_name: string
  onestop_id: string
  generated: boolean
  headway_secs: number
  geometry_length: number
  geometry_max_segment_length: number
}

interface AgencyFeatures {
  routes?: Record<string, Route>
  stops?: Record<string, Stop>
}

interface AgencyFeaturesMap {
  [key: string]: AgencyFeatures
}

const config = useRuntimeConfig()

const route = useRoute()

const props = defineProps({
  lonParam: {
    type: String, default () { return null }
  },
  latParam: {
    type: String, default () { return null }
  },
  fromPlaceParam: {
    type: String,
    default: ''
  },
  toPlaceParam: {
    type: String,
    default: ''
  },
  modeParam: {
    type: String,
    default: () => 'WALK'
  },
  departAtParam: {
    type: String,
    default: () => new Date().toISOString()
  }
})

const rerenderKey = ref(0)

const ROUTES_TAB = 'routes'
const DEPARTURE_TAB = 'departures'
const DIRECTIONS_TAB = 'directions'

const activeTab = ref(ROUTES_TAB)
const useHash = true
const initialZoom = ref(1.5)
const initialCenter = ref([-119.49, 12.66])
const currentZoom = ref(1.5)
const showRouteModal = ref(false)
const showMapOptionsModal = ref(false)
const currentBbox = ref<number[] | null>(null)
const showGeneratedGeometries = ref(true)
const showProblematicGeometries = ref(false)

const agencyFeatures = ref<AgencyFeaturesMap>({})

const showStopTypes = ref({
  0: true,  // Stop/Platform
  1: true,  // Station
  2: true,  // Entrance
  3: false, // Node
  4: false  // Boarding Area
})

function mapMove (e: MapMoveEvent) {
  currentZoom.value = e.zoom
  currentBbox.value = e.bbox
}

function mapSetZoom (v: number) {
  currentZoom.value = v
}

function mapClick(e: MapClickEvent) {
  // Convert to coordinates
  const coords = [e.lngLat.lng, e.lngLat.lat]

  // Handle routes tab
  if (activeTab.value === ROUTES_TAB) {
    if (Object.keys(agencyFeatures.value).length > 0) {
      showRouteModal.value = true
    }
  }

  // Handle departures tab
  if (activeTab.value === DEPARTURE_TAB) {
    departuresSetLocation(coords)
  }

  // Handle directions tab
  if (activeTab.value === DIRECTIONS_TAB) {
    if (fromPlaceCoords.value.length === 0 || toPlaceCoords.value.length === 2) {
      directionsSetPlaces(coords, [])
    } else {
      directionsSetPlaces(fromPlaceCoords.value, coords)
    }
  }
}

/// ////////////////////
// Routes
/// ////////////////////

function routesSetAgencyFeatures (e: AgencyFeaturesMap) {
  console.log('Input features:', JSON.stringify(e, null, 2))
  const reorganizedFeatures: AgencyFeaturesMap = {}
  
  // First process routes
  Object.entries(e).forEach(([agencyName, features]) => {
    if (features.routes && Object.keys(features.routes).length > 0) {
      // Initialize agency with empty routes and stops
      reorganizedFeatures[agencyName] = { 
        routes: features.routes,
        stops: {}  // Initialize empty stops object
      }
    }
  })

  // Then process stops
  Object.entries(e).forEach(([_, features]) => {
    if (!features.stops) return

    Object.entries(features.stops).forEach(([stopId, stop]) => {
      let agencyName = 'Other (No Defined Agency)'
      
      try {
        const agencies = JSON.parse(stop.agencies || '[]')
        if (agencies && agencies.length > 0) {
          agencyName = agencies[0].agency_name
        }
      } catch (err) {
        console.warn('Failed to parse agencies for stop:', stopId, err)
        return // Skip this stop if we can't determine the agency
      }

      // Initialize agency if it doesn't exist yet
      if (!reorganizedFeatures[agencyName]) {
        reorganizedFeatures[agencyName] = { routes: {}, stops: {} }
      }

      // Now TypeScript knows stops exists and is initialized
      reorganizedFeatures[agencyName].stops[stopId] = stop
    })
  })

  console.log('Reorganized features:', JSON.stringify(reorganizedFeatures, null, 2))
  agencyFeatures.value = reorganizedFeatures
}

/// ////////////////////
// Departures
/// ////////////////////

async function departuresSetLocation (coords: number[]) {
  await navigateTo({
    query: { lon: coords[0].toFixed(5), lat: coords[1].toFixed(5) },
    hash: window.location.hash
  })
}

const departureCoords = computed((): number[] => {
  if (activeTab.value !== DEPARTURE_TAB) {
    return []
  }
  if (props.lonParam && props.lonParam) {
    return splitCoords(props.lonParam + ',' + props.latParam)
  }
  return []
})

/// ////////////////////
// Directions
/// ////////////////////

const directionsFeatures = ref([])

const departAt = computed((): string => {
  const loadTime = (new Date()).toISOString()
  return props.departAtParam?.toString() || loadTime
})

const fromPlaceCoords = computed((): number[] => {
  const coords = splitCoords(props.fromPlaceParam)
  return coords.length === 2 ? coords : []
})

const toPlaceCoords = computed((): number[] => {
  const coords = splitCoords(props.toPlaceParam)
  return coords.length === 2 ? coords : []
})

async function directionsSetDepartAt (v: string) {
  await navigateTo({
    query: { ...route.query, departAt: v },
    hash: window.location.hash
  })
}

async function directionsSetMode (v: string) {
  await navigateTo({
    query: { ...route.query, mode: v },
    hash: window.location.hash
  })
}

async function directionsReset () {
  directionsFeatures.value = []
  await navigateTo({
    query: { },
    hash: window.location.hash
  })
}

async function directionsSetPlaces (fromPlace: number[] | null, toPlace: number[] | null) {
  const pathNoHash = route.path.split('#')[0]
  const fromPlaceStr = (fromPlace || []).map(v => v.toFixed(6)).join(',')
  const toPlaceStr = (toPlace || []).map(v => v.toFixed(6)).join(',')
  await navigateTo({
    path: pathNoHash,
    query: { ...route.query, lon: '', lat: '', fromPlace: fromPlaceStr, toPlace: toPlaceStr },
    hash: window.location.hash
  })
}

function splitCoords (v: any): number[] {
  const vs = (v || '').split(',').map(parseFloat).filter((v: number) => !isNaN(v))
  if (vs.length === 2) {
    return vs
  }
  return []
}

/// ////////////////////////
// General computed values
/// ////////////////////////

// Only show base routes for route and departures tabs

const routeTiles = computed(() => {
  return {
    id: 'routes',
    url: `${config.public.apiBase}/tiles/routes/tiles/{z}/{x}/{y}.pbf`,
    minzoom: 0,
    maxzoom: 14
  }
})

const stopTiles = computed(() => {
  return {
    id: 'stops',
    url: `${config.public.apiBase}/tiles/stops/tiles/{z}/{x}/{y}.pbf`,
    minzoom: 14,
    maxzoom: 14
  }
})

const activeFeatures = computed(() => {
  if (activeTab.value === DIRECTIONS_TAB) {
    return directionsFeatures.value
  }
  return []
})

// Watchers

watch(activeTab, () => {
  // Hacky; always set modal back to empty when switching tabs
  showRouteModal.value = false
  showMapOptionsModal.value = false
  // rerenderKey.value += 1
})

// TODO: Does not reset map when goes empty
const markers = computed((): MapMarker[] => {
  const ret: MapMarker[] = []

  if (activeTab.value === DEPARTURE_TAB) {
    if (departureCoords.value.length === 2) {
      ret.push({
        lng: departureCoords.value[0],
        lat: departureCoords.value[1],
        color: '#75a1ff',
        label: 'Search',
        draggable: false
      })
    }
  }

  if (activeTab.value === DIRECTIONS_TAB) {
    if (fromPlaceCoords.value.length === 2) {
      ret.push({
        lng: fromPlaceCoords.value[0],
        lat: fromPlaceCoords.value[1],
        color: 'green',
        label: 'A',
        draggable: true,
        onDragEnd: (c: any) => {
          directionsSetPlaces([c.target.getLngLat().lng, c.target.getLngLat().lat], toPlaceCoords.value)
        }
      })
    }
    if (toPlaceCoords.value.length === 2) {
      ret.push({
        lng: toPlaceCoords.value[0],
        lat: toPlaceCoords.value[1],
        color: 'red',
        label: 'B',
        draggable: true,
        onDragEnd: (c: any) => {
          directionsSetPlaces(fromPlaceCoords.value, [c.target.getLngLat().lng, c.target.getLngLat().lat])
        }
      })
    }
  }

  return ret
})

</script>

<style>
.tl-map {
  position: relative;
}

.tl-map-panel {
    user-select: none;
    position: absolute !important;
    margin: 0px;
    padding: 10px;
    top: 10px;
    left: 10px;
    max-width:90vw;
    min-width: 565px;
}

.tl-map-panel-tabs div[role=tab] button {
    margin-right: 5px;
}

.tl-map-panel-tabs div[role=tab][aria-selected=false] button {
    background-color: var(--bulma-background);
}
.tl-map-panel-tabs div[role=tab][aria-selected=true] button {
    background-color: var(--bulma-scheme-main)
}

.tl-map-panel-tabs .tabs-content {
    background-color: var(--bulma-scheme-main) !important;
    padding:10px !important;
    max-height:80vh;
    min-width:330px;
    max-width:80vw;
    overflow-y:auto;
}
.tl-map-search-autocomplete{
  width:450px;
}
</style>

<style scoped>
.short-bottom {
  margin-bottom:0px;
  padding-bottom:0px;
}
.is-fullwidth {
  width:100%
}
</style>
