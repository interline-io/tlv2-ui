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
        @set-zoom="mapSetZoom"
        @set-agency-features="routesSetAgencyFeatures"
        @map-click="mapClick"
        @map-move="mapMove"
      />

      <div class="tl-map-panel tl-map-panel-tabs">
        <o-tabs v-model="activeTab" class="tl-tabs block" position="centered" type="boxed">
          <o-tab-item id="routes" label="Routes">
            <o-field addons>
              <o-field expanded style="width:100%">
                <h6 class="title is-6 short-margin">
                  <template v-if="currentZoom < 8">
                    Zoom in to select routes and to see stop points.
                  </template>
                  <template v-else>
                    Select routes
                  </template>
                </h6>
              </o-field>
              <o-field>
                <o-button variant="primary" @click="showRouteOptionsModal = true">
                  Options
                </o-button>
              </o-field>
            </o-field>

            <tl-map-route-list
              v-if="activeTab === ROUTES_TAB"
              :agency-features="agencyFeatures"
              :is-component-modal-active="showRouteModal"
              @close="showRouteModal = false"
            />

            <div v-if="Object.keys(agencyFeatures).length == 0">
              <p v-if="currentZoom >= 8">
                Use your cursor to highlight routes and see their names here.<br>
                Click on a route for more details.
              </p>
              <p class="content block is-small pt-2">
                <a href="https://www.transit.land/documentation/vector-tiles" target="_blank">Learn more about Transitland v2 Vector Tiles</a>
              </p>
            </div>
          </o-tab-item>
          <o-tab-item id="departures" label="Departures">
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
          <tl-login-gate role="tl_user_enterprise">
            <o-tab-item label="Directions">
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
      <!-- Modal Options -->
      <tl-modal v-model="showRouteOptionsModal" title="Route Options">
        <div class="field">
          <o-checkbox
            v-model="showGeneratedGeometries"
          >
            Show stop-to-stop geometries
          </o-checkbox>
        </div>
        <div class="field">
          <o-checkbox
            v-model="showProblematicGeometries"
          >
            Show problematic geometries
          </o-checkbox>
        </div>
      </tl-modal>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRuntimeConfig, navigateTo } from '#imports'

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

const ROUTES_TAB = 1
const DEPARTURE_TAB = 2
const DIRECTIONS_TAB = 3

const activeTab = ref(ROUTES_TAB)
const useHash = true
const initialZoom = ref(1.5)
const initialCenter = ref([-119.49, 12.66])
const currentZoom = ref(1.5)
const showRouteModal = ref(false)
const showRouteOptionsModal = ref(false)
const agencyFeatures = ref({})
const showGeneratedGeometries = ref(true)
const showProblematicGeometries = ref(false)
const currentBbox = ref(null)

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

function routesSetAgencyFeatures (e: any) {
  agencyFeatures.value = e
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

async function directionsSetDepartAt(v: string) {
  await navigateTo({
    query: { ...route.query, departAt: v },
    hash: window.location.hash
  })
}

async function directionsSetMode(v: string) {
  await navigateTo({
    query: { ...route.query, mode: v },
    hash: window.location.hash
  })
}

async function directionsReset() {
  directionsFeatures.value = []
  await navigateTo({
    query: { },
    hash: window.location.hash
  })
}

async function directionsSetPlaces(fromPlace: number[] | null, toPlace: number[] | null) {
  const pathNoHash = route.path.split('#')[0]
  const fromPlaceStr = (fromPlace || []).map(v => v.toFixed(6)).join(',')
  const toPlaceStr = (toPlace || []).map(v => v.toFixed(6)).join(',')
  await navigateTo({
    path: pathNoHash,
    query: { ...route.query, lon: '', lat: '', fromPlace: fromPlaceStr, toPlace: toPlaceStr },
    hash: window.location.hash
  })
}

function splitCoords(v: any): number[] {
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
  showRouteOptionsModal.value = false
  // rerenderKey.value += 1
})

// TODO: Does not reset map when goes empty
const markers = computed(() => {
  const ret = []
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

.tl-map-panel-tabs {
    background: rgba(255, 255, 255, 0.0) !important;
}

.tl-map-panel-tabs div[role=tab] a {
    margin-right: 5px;
}

.tl-map-panel-tabs div[role=tab] a {
    background-color: rgba(235, 235, 235, 0.9) !important;
}

.tl-map-panel-tabs div[role=tab][aria-selected=true] a {
    background-color: rgba(255, 255, 255, 0.9) !important;
}

.tl-map-panel-tabs .tab-content {
    background-color: rgba(255, 255, 255, 0.9);
    margin: 0px;
    padding-left: 10px;
    padding-right: 10px;
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
</style>
