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
        :stop-location-type-filter="showStopLocationTypes"
        :zoom="initialZoom"
        :center="initialCenter"
        :hash="useHash"
        :markers="markers"
        :features="activeFeatures"
        :auto-fit="false"
        :hide-tiles="activeTab === DIRECTIONS_TAB"
        map-class="tall"
        @set-zoom="mapSetZoom"
        @set-agency-features="routesSetAgencyFeatures"
        @set-stop-features="routesSetStopFeatures"
        @map-click="mapClick"
        @map-move="mapMove"
      />

      <div class="tl-map-panel tl-map-panel-tabs">
        <o-tabs v-model="activeTab" class="tl-tabs block" position="centered" type="boxed">
          <div class="tl-tab-nav">
            <o-field grouped>
              <tl-map-search
                class="mb-2"
                :bbox="currentBbox"
                :include-stops="true"
                @set-location="locationHandler"
              />
              <o-field>
                <tl-geolocation @set-location="locationHandler" />
              </o-field>
              <o-field><o-button variant="primary" icon-right="cog" @click="showUnifiedOptionsModal = true" /></o-field>
            </o-field>
          </div>

          <o-tab-item :value="ROUTES_TAB" label="Routes & Stops" tab-class="tl-map-header-tab" tab-panel-class="tl-tab-overflow">
            <slot name="routesHeader">
              <h6 class="title is-6">
                Routes & Stops
              </h6>
            </slot>

            <!-- Combined agency view in sidebar -->
            <div v-if="activeTab === ROUTES_TAB && Object.keys(combinedAgencyFeatures).length > 0">
              <div v-for="(agencyData, agencyName) in combinedAgencyFeatures" :key="agencyName">
                <h6 class="title is-6">
                  {{ agencyName }}
                </h6>

                <!-- Routes -->
                <div v-if="Object.keys(agencyData.routes).length > 0">
                  <div v-for="routeItem in agencyData.routes" :key="routeItem.id">
                    <nuxt-link
                      :to="makeRouteLink(routeItem.onestop_id, routeItem.feed_onestop_id, routeItem.feed_version_sha1, routeItem.route_id, routeItem.id, linkVersion)"
                    >
                      <tl-route-icon
                        :route-type="routeItem.route_type"
                        :route-short-name="routeItem.route_short_name"
                        :route-long-name="routeItem.route_long_name"
                      />
                    </nuxt-link>
                  </div>
                </div>

                <!-- Stops -->
                <div v-if="agencyData.stops.length > 0">
                  <div v-for="stop in agencyData.stops" :key="stop.id" class="stop-item">
                    <nuxt-link
                      :to="makeStopLink(stop.onestop_id, stop.feed_onestop_id, stop.feed_version_sha1, stop.stop_id, stop.id, linkVersion)"
                      class="stop-link"
                    >
                      <span class="stop-icon">
                        <o-icon :icon="getStopIcon(stop.location_type)" />
                      </span>
                      <span class="stop-name">
                        {{ stop.stop_name }}
                      </span>
                    </nuxt-link>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="Object.keys(combinedAgencyFeatures).length === 0" class="content">
              <template v-if="currentZoom < 8">
                <p>Zoom in to select routes and stops.</p>
              </template>
              <template v-else-if="currentZoom < 12">
                <p>Use your cursor to highlight routes and see their names here.</p>
                <p>Click on a route for more details.</p>
                <p>Zoom in further to see stops.</p>
              </template>
              <template v-else>
                <p>Use your cursor to highlight routes or stops.</p>
                <p>Click on a route line or stop point to view its details.</p>
              </template>
            </div>

            <!-- Combined modal for routes and stops -->
            <o-modal
              v-if="activeTab === ROUTES_TAB"
              :active="showSelectionModal"
              has-modal-card
              @close="showSelectionModal = false"
            >
              <template #default>
                <div v-if="showSelectionModal" class="modal-card">
                  <header class="modal-card-head">
                    <p class="modal-card-title">
                      Select Route or Stop
                    </p>
                    <button type="button" class="delete" @click="showSelectionModal = false" />
                  </header>
                  <section class="modal-card-body">
                    <div v-for="(agencyData, agencyName) in combinedAgencyFeatures" :key="agencyName">
                      <h6 class="title is-6 agency-section-header">
                        {{ agencyName }}
                      </h6>

                      <!-- Routes for this agency -->
                      <div v-if="Object.keys(agencyData.routes).length > 0">
                        <div v-for="routeItem in agencyData.routes" :key="routeItem.id">
                          <nuxt-link
                            :to="makeRouteLink(routeItem.onestop_id, routeItem.feed_onestop_id, routeItem.feed_version_sha1, routeItem.route_id, routeItem.id, linkVersion)"
                          >
                            <tl-route-icon
                              :key="routeItem.id"
                              :route-type="routeItem.route_type"
                              :route-short-name="routeItem.route_short_name"
                              :route-long-name="routeItem.route_long_name"
                            />
                          </nuxt-link>
                        </div>
                      </div>

                      <!-- Stops for this agency -->
                      <div v-if="agencyData.stops.length > 0" class="stops-section">
                        <div v-for="stop in agencyData.stops" :key="stop.id" class="stop-item-modal">
                          <nuxt-link
                            :to="makeStopLink(stop.onestop_id, stop.feed_onestop_id, stop.feed_version_sha1, stop.stop_id, stop.id, linkVersion)"
                            class="stop-link-modal"
                          >
                            <div class="stop-name-large">
                              <span class="stop-icon-modal">
                                <o-icon :icon="getStopIcon(stop.location_type)" />
                              </span>
                              {{ stop.stop_name }}
                            </div>
                          </nuxt-link>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              </template>
            </o-modal>
          </o-tab-item>

          <o-tab-item :value="DEPARTURE_TAB" label="Departures" tab-class="tl-map-header-tab" tab-panel-class="tl-tab-overflow">
            <slot name="departuresHeader">
              <h6 class="title is-6">
                Departures
              </h6>
            </slot>

            <tl-login-gate>
              <tl-stop-departures
                v-if="activeTab === DEPARTURE_TAB"
                :search-radius="departureSearchRadius"
                :search-coords="departureSearchCoords"
                :auto-refresh="departureAutoRefresh"
                :auto-refresh-interval="60"
                :use-service-window="departureUseServiceWindow"
                class="mb-3 mt-3"
              />
              <template #loginText>
                <p>
                  You must be logged in to use this feature.
                </p>
              </template>
            </tl-login-gate>
          </o-tab-item>

          <tl-login-gate role="tl_user_enterprise">
            <o-tab-item :value="DIRECTIONS_TAB" label="Directions" tab-class="tl-map-header-tab">
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
            </o-tab-item>
            <template #loginText>
              <div />
            </template>
            <template #roleText>
              <div />
            </template>
          </tl-login-gate>
        </o-tabs>
      </div>

      <!-- Unified Options Modal -->
      <tl-modal v-model="showUnifiedOptionsModal" title="Map Options" :full-screen="true">
        <o-tabs v-model="activeOptionsTab" class="tl-options-tabs" position="centered" type="boxed">
          <o-tab-item value="routes" label="Routes & Stops">
            <o-field horizontal label="Route lines">
              <o-checkbox v-model="showGeneratedGeometries">
                Show stop-to-stop geometries
              </o-checkbox>
            </o-field>

            <o-field horizontal>
              <o-checkbox v-model="showProblematicGeometries">
                Show problematic geometries
              </o-checkbox>
            </o-field>

            <o-field horizontal label="Stop types">
              Display the following types of stop points on the map
            </o-field>
            <o-field horizontal>
              <o-checkbox v-model="showStopLocationTypes[0]">
                Stops & Station Platforms
              </o-checkbox>
            </o-field>
            <o-field horizontal>
              <o-checkbox v-model="showStopLocationTypes[1]">
                Stations
              </o-checkbox>
            </o-field>
            <o-field horizontal>
              <o-checkbox v-model="showStopLocationTypes[2]">
                Station Entrances/Exits
              </o-checkbox>
            </o-field>
            <o-field horizontal>
              <o-checkbox v-model="showStopLocationTypes[3]">
                Generic Nodes in Station Pathways
              </o-checkbox>
            </o-field>
            <o-field horizontal>
              <o-checkbox v-model="showStopLocationTypes[4]">
                Boarding Areas in Station Pathways
              </o-checkbox>
            </o-field>
          </o-tab-item>

          <o-tab-item value="departures" label="Departures">
            <tl-stop-departure-settings
              v-model:search-radius="departureSearchRadius"
              v-model:auto-refresh="departureAutoRefresh"
              v-model:use-service-window="departureUseServiceWindow"
              style="min-height:600px"
              :allowed-radius="allowedRadius"
            />
          </o-tab-item>
        </o-tabs>
      </tl-modal>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { useRoute, navigateTo } from '#imports'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useApiEndpoint } from '../../composables/useApiEndpoint'
import { makeStopLink, makeRouteLink } from '../../lib/filters'
import type { Bbox, LonLat, lonLatStr } from '../../lib/geom'

// Types
interface Stop {
  id: number
  onestop_id: string
  feed_onestop_id: string
  feed_version_sha1: string
  stop_id: string
  stop_name: string
  location_type: number
  agencies?: string
  parent_station?: string
}

interface StopFeatures {
  [key: string]: Stop[]
}

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
const linkVersion = false

// Dynamic location handler
const locationHandler = computed(() => {
  switch (activeTab.value) {
    case ROUTES_TAB: return routesSetLocation
    case DEPARTURE_TAB: return departuresSetLocation
    case DIRECTIONS_TAB: return directionsSetLocation
    default: return routesSetLocation
  }
})

// Helper functions
function getStopIcon (locationType: number): string {
  // GTFS location_type values:
  // 0 = Stop/platform, 1 = Station, 2 = Entrance/Exit, 3 = Generic Node, 4 = Boarding Area
  const icons: Record<number, string> = {
    0: 'map-marker', // Stop/platform
    1: 'home-map-marker', // Station
    2: 'location-enter', // Entrance/Exit
    3: 'circle', // Generic node
    4: 'map-marker-circle' // Boarding area
  }
  return icons[locationType] || 'map-marker'
}

function getStopAgencyName (stop: Stop): string {
  // Try to get agency from agencies field
  if (stop.agencies) {
    try {
      const agencies = JSON.parse(stop.agencies)
      if (agencies && agencies.length > 0 && agencies[0].agency_name) {
        return agencies[0].agency_name
      }
    } catch (e) {
      // If parsing fails, fall through to next option
    }
  }

  // Fall back to parent station name if available
  if (stop.parent_station) {
    try {
      const parentStation = JSON.parse(stop.parent_station)
      if (parentStation && parentStation.stop_name) {
        return parentStation.stop_name
      }
    } catch (e) {
      // If parsing fails, fall through to next option
    }
  }

  // Fall back to feed_onestop_id
  return stop.feed_onestop_id || 'Unknown'
}

const activeTab = ref(ROUTES_TAB)
const useHash = true
const initialZoom = ref(1.5)
const initialCenter = ref<LonLat>({ lon: -119.49, lat: 12.66 })
const currentZoom = ref(1.5)
const showSelectionModal = ref(false)
const showUnifiedOptionsModal = ref(false)
const activeOptionsTab = ref('routes')
const agencyFeatures = ref({})
const stopFeatures = ref<StopFeatures>({})
const showGeneratedGeometries = ref(true)
const showProblematicGeometries = ref(false)
const currentBbox = ref<Bbox | null>(null)

// Stop location type filters
const showStopLocationTypes = ref({
  0: true, // Stop/platform
  1: true, // Station
  2: false, // Entrance/Exit
  3: false, // Generic Node
  4: false // Boarding Area
})

// Departure settings
const departureSearchRadius = ref<number>(200)
const departureAutoRefresh = ref<boolean>(true)
const departureUseServiceWindow = ref<boolean>(true)
const allowedRadius = ref<number[]>([0, 50, 100, 150, 200, 500, 1000])

// Generic map event handlers

function mapMove (e: any) {
  currentZoom.value = e.zoom
  currentBbox.value = e.bbox
}

function mapSetZoom (v: number) {
  currentZoom.value = v
}

function mapClick (e: any) {
  // Convert to coordinates
  const coords = { lon: e.lngLat.lng, lat: e.lngLat.lat }

  // Handle routes tab
  if (activeTab.value === ROUTES_TAB) {
    // Show modal if any routes or stops are selected
    if (Object.keys(combinedAgencyFeatures.value).length > 0) {
      showSelectionModal.value = true
    }
    // Note: No location setting on click for routes tab - only through search
  }

  // Handle departures tab
  if (activeTab.value === DEPARTURE_TAB) {
    departuresSetLocationFromClick(coords)
  }

  // Handle directions tab
  if (activeTab.value === DIRECTIONS_TAB) {
    if (!fromPlaceCoords.value || toPlaceCoords.value) {
      directionsSetPlaces(coords, null)
    } else {
      directionsSetPlaces(fromPlaceCoords.value, coords)
    }
  }
}

/// ////////////////////
// Routes
/// ////////////////////

function routesSetAgencyFeatures (e: any) {
  agencyFeatures.value = e
}

/// ////////////////////
// Stops
/// ////////////////////

function routesSetStopFeatures (e: any) {
  stopFeatures.value = e
}

// Filter stops by location type
const filteredStopFeatures = computed(() => {
  const filtered: StopFeatures = {}
  for (const [key, stops] of Object.entries(stopFeatures.value)) {
    const filteredStops = stops.filter(stop => showStopLocationTypes.value[stop.location_type] === true)
    if (filteredStops.length > 0) {
      filtered[key] = filteredStops
    }
  }
  return filtered
})

// Combined agency features (routes + stops grouped by agency)
const combinedAgencyFeatures = computed(() => {
  const combined: any = {}

  // Add routes grouped by agency
  for (const [agencyName, routes] of Object.entries(agencyFeatures.value)) {
    if (!combined[agencyName]) {
      combined[agencyName] = { routes: {}, stops: [] }
    }
    combined[agencyName].routes = routes
  }

  // Add stops grouped by agency
  for (const stops of Object.values(filteredStopFeatures.value)) {
    for (const stop of stops) {
      const agencyName = getStopAgencyName(stop)
      if (agencyName) {
        if (!combined[agencyName]) {
          combined[agencyName] = { routes: {}, stops: [] }
        }
        combined[agencyName].stops.push(stop)
      }
    }
  }

  return combined
})

/// ////////////////////
// Departures
/// ////////////////////

async function departuresSetLocation (coords: LonLat) {
  // Update map center and zoom for geolocation/search
  initialCenter.value = coords
  initialZoom.value = 16
  rerenderKey.value += 1
  await navigateTo({
    query: { lon: coords.lon.toFixed(5), lat: coords.lat.toFixed(5) },
  })
}

async function departuresSetLocationFromClick (coords: LonLat) {
  // Only update coordinates, not zoom/center for map clicks
  await navigateTo({
    query: { lon: coords.lon.toFixed(5), lat: coords.lat.toFixed(5) },
  })
}

async function routesSetLocation (coords: LonLat) {
  // Update map center and zoom for geolocation/search in Routes & Stops tab
  initialCenter.value = coords
  initialZoom.value = 16
  rerenderKey.value += 1
  await navigateTo({
    query: { lon: coords.lon.toFixed(5), lat: coords.lat.toFixed(5) },
  })
}

async function directionsSetLocation (coords: LonLat) {
  // Update map center and zoom for geolocation/search in Directions tab
  initialCenter.value = coords
  initialZoom.value = 16
  rerenderKey.value += 1
  await navigateTo({
    query: { lon: coords.lon.toFixed(5), lat: coords.lat.toFixed(5) },
  })
}

const departureSearchCoords = computed((): LonLat | null => {
  if (activeTab.value !== DEPARTURE_TAB) {
    return null
  }
  if (props.lonParam && props.latParam) {
    return { lon: parseFloat(props.lonParam), lat: parseFloat(props.latParam) }
  }
  return null
})

const routesCoords = computed((): LonLat | null => {
  if (activeTab.value !== ROUTES_TAB) {
    return null
  }
  if (props.lonParam && props.latParam) {
    return { lon: parseFloat(props.lonParam), lat: parseFloat(props.latParam) }
  }
  return null
})

/// ////////////////////
// Directions
/// ////////////////////

const directionsFeatures = ref([])

const departAt = computed((): string => {
  const loadTime = (new Date()).toISOString()
  return props.departAtParam?.toString() || loadTime
})

const fromPlaceCoords = computed((): LonLat | null => {
  return splitCoords(props.fromPlaceParam)
})

const toPlaceCoords = computed((): LonLat | null => {
  return splitCoords(props.toPlaceParam)
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

async function directionsSetPlaces (fromPlace: LonLat | null, toPlace: LonLat | null) {
  const pathNoHash = route.path.split('#')[0]
  const fromPlaceStr = lonLatStr(fromPlace)
  const toPlaceStr = lonLatStr(toPlace)
  await navigateTo({
    path: pathNoHash,
    query: { ...route.query, lon: '', lat: '', fromPlace: fromPlaceStr, toPlace: toPlaceStr },
    hash: window.location.hash
  })
}

function splitCoords (v: any): LonLat | null {
  const vs = (v || '').split(',').map(parseFloat).filter((v: number) => !isNaN(v))
  if (vs.length === 2) {
    return { lon: vs[0], lat: vs[1] }
  }
  return null
}

/// ////////////////////////
// General computed values
/// ////////////////////////

// Only show base routes for route and departures tabs
// NOTE: These always go through the proxy, for now
const routeTiles = computed(() => {
  return {
    id: 'routes',
    url: `${useApiEndpoint()}/tiles/routes/tiles/{z}/{x}/{y}.pbf`,
    minzoom: 0,
    maxzoom: 14
  }
})

const stopTiles = computed(() => {
  return {
    id: 'stops',
    url: `${useApiEndpoint()}/tiles/stops/tiles/{z}/{x}/{y}.pbf`,
    minzoom: 12,
    maxzoom: 12
  }
})

const activeFeatures = computed(() => {
  if (activeTab.value === DIRECTIONS_TAB) {
    return directionsFeatures.value
  }
  return []
})

// Initialize map coordinates from URL params and hash
const initializeMapFromUrl = () => {
  console.log('Initializing map from URL')
  const hasHash = window.location.hash && window.location.hash.length > 1
  if (hasHash) {
    console.log('hash:', window.location.hash)
    // ok
  } else {
  // Fallback to lon/lat params if no valid hash
    console.log('No hash, checking lon/lat params')
    if (props.lonParam && props.latParam) {
      const pt = { lon: parseFloat(props.lonParam), lat: parseFloat(props.latParam) }
      if (!isNaN(pt.lon) && !isNaN(pt.lat)) {
        console.log('Setting map center to lon/lat params:', pt.lon, pt.lat)
        initialCenter.value = pt
        initialZoom.value = 16
        rerenderKey.value += 1
      }
    }
  }
}

// Watchers

watch(activeTab, () => {
  // Always set modal back to empty when switching tabs
  showSelectionModal.value = false
  showUnifiedOptionsModal.value = false

  // Sync options tab with main tab
  activeOptionsTab.value = activeTab.value
  // rerenderKey.value += 1
})

// Initialize on mount and handle hash changes
onMounted(() => {
  initializeMapFromUrl()

  // Listen for hash changes (popstate events)
  const handlePopState = () => {
    console.log('Popstate event detected, re-initializing map from URL', window.location.hash)
    initializeMapFromUrl()
  }

  window.addEventListener('popstate', handlePopState)

  // Cleanup listener on unmount
  onUnmounted(() => {
    window.removeEventListener('popstate', handlePopState)
  })
})

// TODO: Does not reset map when goes empty
const markers = computed(() => {
  const ret = []
  if (activeTab.value === ROUTES_TAB) {
    if (routesCoords.value) {
      ret.push({
        lng: routesCoords.value.lon,
        lat: routesCoords.value.lat,
        color: '#ff9500',
        label: 'Search',
        draggable: false
      })
    }
  }
  if (activeTab.value === DEPARTURE_TAB) {
    if (departureSearchCoords.value) {
      ret.push({
        lng: departureSearchCoords.value.lon,
        lat: departureSearchCoords.value.lat,
        color: '#75a1ff',
        label: 'Search',
        draggable: false
      })
    }
  }

  if (activeTab.value === DIRECTIONS_TAB) {
    if (fromPlaceCoords.value) {
      ret.push({
        lng: fromPlaceCoords.value.lon,
        lat: fromPlaceCoords.value.lat,
        color: 'green',
        label: 'A',
        draggable: true,
        onDragEnd: (c: any) => {
          directionsSetPlaces({ lon: c.target.getLngLat().lng, lat: c.target.getLngLat().lat }, toPlaceCoords.value)
        }
      })
    }
    if (toPlaceCoords.value) {
      ret.push({
        lng: toPlaceCoords.value.lon,
        lat: toPlaceCoords.value.lat,
        color: 'red',
        label: 'B',
        draggable: true,
        onDragEnd: (c: any) => {
          directionsSetPlaces(fromPlaceCoords.value, { lon: c.target.getLngLat().lng, lat: c.target.getLngLat().lat })
        }
      })
    }
  }

  return ret
})

</script>

<style>
/* These must be global styles, for... reasons */
.tl-map {
  position: relative;
}
.tl-map-panel {
    user-select: none;
    position: absolute !important;
    top: 10px;
    left: 10px;
    max-width: 90vw;
    min-width: 320px;
}
.tl-map-header-tab {
  background:#eee;
  margin-left:5px;
  margin-right:5px;
}

.tl-map-panel-tabs .tabs-content {
    background-color: var(--bulma-scheme-main) !important;
}

/* Tablet: 769px and up */
@media screen and (min-width: 769px) {
  .tl-map-panel {
    max-width: 600px;
    min-width: 565px;
  }
}

/* Desktop: 1024px and up */
@media screen and (min-width: 1024px) {
  .tl-map-panel {
    max-width: 650px;
  }
}

/* Widescreen: 1216px and up */
@media screen and (min-width: 1216px) {
  .tl-map-panel {
    max-width: 700px;
  }
}

/* Tablet: 769px and up */
@media screen and (min-width: 769px) {
  .tl-map-panel-tabs .tabs-content {
    min-width: 330px;
    max-width: 580px;
  }
}

/* Desktop: 1024px and up */
@media screen and (min-width: 1024px) {
  .tl-map-panel-tabs .tabs-content {
    max-width: 630px;
  }
}

/* Widescreen: 1216px and up */
@media screen and (min-width: 1216px) {
  .tl-map-panel-tabs .tabs-content {
    max-width: 680px;
  }
}

</style>

<style scoped>
.tl-tab-overflow {
  padding-left:10px;
  padding-right:0px;
  max-height: 60vh;
  overflow-y: auto;
}

.tl-tab-nav {
  padding-left:10px;
  padding-right:10px;
}

.short-bottom {
  margin-bottom:0px;
  padding-bottom:0px;
}
.is-fullwidth {
  width:100%
}

/* Modal stop styling */
.stop-section-header {
  margin-top: 20px;
  margin-bottom: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--bulma-border);
}

.stop-item-modal {
  margin-bottom: 10px;
}

.stop-link-modal {
  display: block;
  padding: 4px 0;
  text-decoration: none;
  color: var(--bulma-link);
  transition: color 0.2s;
}

.stop-link-modal:hover {
  color: var(--bulma-link-hover);
  text-decoration: underline;
}

.stop-icon-modal {
  display: inline-block;
  width: 26px;
  text-align: center;
  position: relative;
  top: 3px;
  margin-right: 4px;
}

.stop-name-large {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
}

.agency-section-header {
  margin-top: 20px;
  margin-bottom: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--bulma-border);
}

.agency-section-header:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.stops-section {
  margin-top: 10px;
}

.stop-item {
  overflow: hidden;
  padding: 0px;
  margin: 0px;
  margin-bottom: 10px;
}

.stop-link {
  display: block;
  text-decoration: none;
  color: var(--bulma-link);
}

.stop-link:hover {
  color: var(--bulma-link-hover);
  text-decoration: underline;
}

.stop-icon {
  display: inline-block;
  width: 26px;
  text-align: center;
  position: relative;
  top: 3px;
}

.stop-name {
  display: inline;
  font-size: 14px;
}
</style>
