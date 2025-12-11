<template>
  <div class="navbar-item">
    <!-- Small Search Input in Navbar -->
    <div class="field">
      <div class="control has-icons-left">
        <o-input
          :model-value="search || ''"
          :placeholder="search ? 'Search results...' : 'Search... (⌘/)'"
          size="small"
          readonly
          class="navbar-search-input"
          @click="openCommandPalette"
          @focus="openCommandPalette"
        />
        <span class="icon is-left is-small">
          <o-icon icon="magnify" />        </span>
      </div>
    </div>

    <!-- Command Palette Modal -->
    <o-modal
      :active="isOpen"
      has-modal-card
      :can-cancel="true"
      @close="closeCommandPalette"
      @update:active="isOpen = $event"
    >
      <div class="modal-card command-palette-modal">
        <header class="modal-card-head">
          <div class="field has-addons">
            <div class="control">
              <span class="icon is-left">
                <o-icon icon="magnify" />
              </span>
            </div>
            <div class="control is-expanded">
              <o-input
                ref="searchInput"
                v-model="search"
                placeholder="Search..."
                expanded
                :loading="loading"
                @keydown.enter="handleEnter"
                @keydown.escape="closeCommandPalette"
                @keydown.up="navigateUp"
                @keydown.down="navigateDown"
              />
            </div>
          </div>
          <div class="level is-mobile">
            <div class="level-item">
              <span class="tag is-light">↑↓</span>
              <span class="ml-1">navigate</span>
            </div>
            <div class="level-item">
              <span class="tag is-light">↵</span>
              <span class="ml-1">open</span>
            </div>
            <div class="level-item">
              <span class="tag is-light">⌘↵</span>
              <span class="ml-1">map</span>
            </div>
            <div class="level-item">
              <span class="tag is-light">esc</span>
              <span class="ml-1">close</span>
            </div>
          </div>
        </header>

        <section class="modal-card-body">
          <div v-if="search.length < minLength" class="has-text-centered py-4">
            <o-icon icon="magnify" size="medium" class="has-text-grey" />
            <p class="has-text-grey mt-2 is-size-7">
              Type at least {{ minLength }} characters to search
            </p>
          </div>

          <div v-else-if="totalResults === 0 && !loading" class="has-text-centered py-4">
            <o-icon icon="magnify" size="medium" class="has-text-grey" />
            <p class="has-text-grey mt-2 is-size-7">
              No results found for "{{ search }}"
            </p>
          </div>

          <div v-else class="command-palette-results">
            <!-- Loading indicator when any queries are still running -->
            <div v-if="loading" class="has-text-centered py-2 mb-3">
              <o-icon icon="loading" size="small" class="is-spinning" />
              <span class="ml-2 is-size-7 has-text-grey">{{ loadingMessage }}</span>
            </div>

            <!-- Operators Group -->
            <div v-if="operatorLinks.length > 0 || loadingStates.operators" class="mb-4">
              <div class="level is-mobile px-3 py-1 has-background-grey-lighter">
                <div class="level-left">
                  <div class="level-item">
                    <strong class="is-size-7">Operators</strong>
                    <o-icon v-if="loadingStates.operators" icon="loading" size="small" class="ml-2 is-spinning" />
                  </div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <span v-if="loadingStates.operators" class="tag is-light is-small">Searching...</span>
                    <span v-else class="tag is-primary is-small">{{ operatorLinks.length }}</span>
                  </div>
                </div>
              </div>

              <div v-if="operatorLinks.length > 0" class="box is-shadowless p-0 mb-2">
                <div
                  v-for="(option, optionIndex) in operatorLinks.map(operator => ({
                    label: operator.name || operator.onestop_id,
                    value: operator,
                    route: { name: 'operators-operatorKey', params: { operatorKey: operator.onestop_id } },
                    type: 'operator',
                    group: 'Operators'
                  }))"
                  :key="`operators-${optionIndex}`"
                  :class="[
                    'command-palette-item',
                    { 'is-active': selectedIndex === getGlobalIndex(0, optionIndex) }
                  ]"
                  @click="selectOption(option)"
                  @mouseenter="selectedIndex = getGlobalIndex(0, optionIndex)"
                >
                  <div class="command-palette-item-content">
                    <div class="command-palette-item-label">
                      {{ option.label }}
                    </div>
                    <div class="command-palette-item-type">
                      {{ option.type }}
                    </div>
                  </div>
                  <div class="command-palette-item-actions">
                    <o-icon
                      icon="map"
                      size="small"
                      class="command-palette-item-map-icon"
                      title="View on map (⌘+Enter)"
                      @click.stop="goToMap(option)"
                    />
                    <o-icon icon="chevron-right" size="small" class="command-palette-item-arrow" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Feeds Group -->
            <div v-if="feedLinks.length > 0 || loadingStates.feeds" class="mb-4">
              <div class="level is-mobile px-3 py-1 has-background-grey-lighter">
                <div class="level-left">
                  <div class="level-item">
                    <strong class="is-size-7">Feeds</strong>
                    <o-icon v-if="loadingStates.feeds" icon="loading" size="small" class="ml-2 is-spinning" />
                  </div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <span v-if="loadingStates.feeds" class="tag is-light is-small">Searching...</span>
                    <span v-else class="tag is-primary is-small">{{ feedLinks.length }}</span>
                  </div>
                </div>
              </div>

              <div v-if="feedLinks.length > 0" class="box is-shadowless p-0 mb-2">
                <div
                  v-for="(option, optionIndex) in feedLinks.map(feed => ({
                    label: feed.name || feed.onestop_id,
                    value: feed,
                    route: { name: 'feeds-feedKey', params: { feedKey: feed.onestop_id } },
                    type: 'feed',
                    group: 'Feeds'
                  }))"
                  :key="`feeds-${optionIndex}`"
                  :class="[
                    'command-palette-item',
                    { 'is-active': selectedIndex === getGlobalIndex(1, optionIndex) }
                  ]"
                  @click="selectOption(option)"
                  @mouseenter="selectedIndex = getGlobalIndex(1, optionIndex)"
                >
                  <div class="command-palette-item-content">
                    <div class="command-palette-item-label">
                      {{ option.label }}
                    </div>
                    <div class="command-palette-item-type">
                      {{ option.type }}
                    </div>
                  </div>
                  <div class="command-palette-item-actions">
                    <o-icon
                      icon="map"
                      size="small"
                      class="command-palette-item-map-icon"
                      title="View on map (⌘+Enter)"
                      @click.stop="goToMap(option)"
                    />
                    <o-icon icon="chevron-right" size="small" class="command-palette-item-arrow" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Routes Group -->
            <div v-if="routeLinks.length > 0 || loadingStates.routes" class="mb-4">
              <div class="level is-mobile px-3 py-1 has-background-grey-lighter">
                <div class="level-left">
                  <div class="level-item">
                    <strong class="is-size-7">Routes</strong>
                    <o-icon v-if="loadingStates.routes" icon="loading" size="small" class="ml-2 is-spinning" />
                  </div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <span v-if="loadingStates.routes" class="tag is-light is-small">Searching...</span>
                    <span v-else class="tag is-primary is-small">{{ routeLinks.length }}</span>
                  </div>
                </div>
              </div>

              <div v-if="routeLinks.length > 0" class="box is-shadowless p-0 mb-2">
                <div
                  v-for="(option, optionIndex) in routeLinks.map(route => ({
                    label: [route.route_short_name, route.route_long_name].filter(Boolean).join(' '),
                    value: route,
                    route: { name: 'routes-routeKey', params: { routeKey: route.onestop_id } },
                    type: 'route',
                    group: 'Routes',
                    agency: route.agency?.agency_name
                  }))"
                  :key="`routes-${optionIndex}`"
                  :class="[
                    'command-palette-item',
                    { 'is-active': selectedIndex === getGlobalIndex(2, optionIndex) }
                  ]"
                  @click="selectOption(option)"
                  @mouseenter="selectedIndex = getGlobalIndex(2, optionIndex)"
                >
                  <div class="command-palette-item-content">
                    <div class="command-palette-item-label">
                      {{ option.label }}
                    </div>
                    <div class="command-palette-item-type">
                      {{ option.type }}
                      <span v-if="option.agency" class="ml-2 has-text-grey">• {{ option.agency }}</span>
                    </div>
                  </div>
                  <div class="command-palette-item-actions">
                    <o-icon
                      icon="map"
                      size="small"
                      class="command-palette-item-map-icon"
                      title="View on map (⌘+Enter)"
                      @click.stop="goToMap(option)"
                    />
                    <o-icon icon="chevron-right" size="small" class="command-palette-item-arrow" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Stops Group -->
            <div v-if="stopLinks.length > 0 || loadingStates.stops" class="mb-4">
              <div class="level is-mobile px-3 py-1 has-background-grey-lighter">
                <div class="level-left">
                  <div class="level-item">
                    <strong class="is-size-7">Stops</strong>
                    <o-icon v-if="loadingStates.stops" icon="loading" size="small" class="ml-2 is-spinning" />
                  </div>
                </div>
                <div class="level-right">
                  <div class="level-item">
                    <span v-if="loadingStates.stops" class="tag is-light is-small">Searching...</span>
                    <span v-else class="tag is-primary is-small">{{ stopLinks.length }}</span>
                  </div>
                </div>
              </div>

              <div v-if="stopLinks.length > 0" class="box is-shadowless p-0 mb-2">
                <div
                  v-for="(option, optionIndex) in stopLinks.map(stop => ({
                    label: stop.stop_name,
                    value: stop,
                    route: { name: 'stops-stopKey', params: { stopKey: stop.onestop_id } },
                    type: 'stop',
                    group: 'Stops',
                    agency: stop.route_stops?.[0]?.route?.agency?.agency_name
                  }))"
                  :key="`stops-${optionIndex}`"
                  :class="[
                    'command-palette-item',
                    { 'is-active': selectedIndex === getGlobalIndex(3, optionIndex) }
                  ]"
                  @click="selectOption(option)"
                  @mouseenter="selectedIndex = getGlobalIndex(3, optionIndex)"
                >
                  <div class="command-palette-item-content">
                    <div class="command-palette-item-label">
                      {{ option.label }}
                    </div>
                    <div class="command-palette-item-type">
                      {{ option.type }}
                      <span v-if="option.agency" class="ml-2 has-text-grey">• {{ option.agency }}</span>
                    </div>
                  </div>
                  <div class="command-palette-item-actions">
                    <o-icon
                      icon="map"
                      size="small"
                      class="command-palette-item-map-icon"
                      title="View on map (⌘+Enter)"
                      @click.stop="goToMap(option)"
                    />
                    <o-icon icon="chevron-right" size="small" class="command-palette-item-arrow" />
                  </div>
                </div>
              </div>
            </div>

            <!-- More Results Indicator -->
            <div v-if="totalResults >= 80" class="has-text-centered py-3 mt-4">
              <div class="box is-shadowless has-background-grey-lightest">
                <p class="is-size-7 has-text-grey mb-2">
                  Showing {{ totalResults }} results
                </p>
                <button
                  class="button is-small is-primary is-outlined"
                  @click="goToAdvancedSearch"
                >
                  <span class="icon is-small">
                    <o-icon icon="magnify" size="small" />
                  </span>
                  <span>View all results</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </o-modal>
  </div>
</template>

<script setup lang="ts">
import { gql } from 'graphql-tag'
import { useDebounceFn } from '@vueuse/core'
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'

const minLength = 3
const asyncDebounceTime = 200
const search = ref('')
const isOpen = ref(false)
const selectedIndex = ref(0)
const searchInput = ref(null)

// Separate queries for each search type
const feedsQuery = gql`
query FeedsSearch($search: String!, $limit: Int=20) {
    feeds(limit: $limit, where:{search:$search, import_status: SUCCESS}) {
        id
        name
        onestop_id
        search_rank
        feed_state {
            feed_version {
                geometry
            }
        }
    }
}
`

const operatorsQuery = gql`
query OperatorsSearch($search: String!, $limit: Int=20) {
    operators(limit: $limit, where:{search:$search, merged: true}) {
        onestop_id
        name
        short_name
        search_rank
        agencies {
            geometry
        }
    }
}
`

const routesQuery = gql`
query RoutesSearch($search: String!, $limit: Int=20) {
    routes(limit: $limit, where:{search:$search}) {
        id
        route_id
        route_short_name
        route_long_name
        onestop_id
        feed_onestop_id
        feed_version_sha1
        agency {
            id
            agency_name
        }
        search_rank
    }
}
`

const stopsQuery = gql`
query StopsSearch($search: String!, $limit: Int=20) {
    stops(limit: $limit, where:{search:$search}) {
        id
        onestop_id
        stop_name
        geometry
        search_rank
        route_stops(limit: 1) {
            route {
                agency {
                    agency_name
                }
            }
        }
    }
}
`

// Separate lazy queries for each type
const {
  result: feedsResult,
  loading: feedsLoading,
  error: feedsError,
  load: loadFeeds,
  refetch: refetchFeeds,
  stop: stopFeeds
} = useLazyQuery(feedsQuery, {}, { clientId: 'transitland' })

const {
  result: operatorsResult,
  loading: operatorsLoading,
  error: operatorsError,
  load: loadOperators,
  refetch: refetchOperators,
  stop: stopOperators
} = useLazyQuery(operatorsQuery, {}, { clientId: 'transitland' })

const {
  result: routesResult,
  loading: routesLoading,
  error: routesError,
  load: loadRoutes,
  refetch: refetchRoutes,
  stop: stopRoutes
} = useLazyQuery(routesQuery, {}, { clientId: 'transitland' })

const {
  result: stopsResult,
  loading: stopsLoading,
  error: stopsError,
  load: loadStops,
  refetch: refetchStops,
  stop: stopStops
} = useLazyQuery(stopsQuery, {}, { clientId: 'transitland' })

// Track if this is the first query for each type
const isFirstFeedsQuery = ref(true)
const isFirstOperatorsQuery = ref(true)
const isFirstRoutesQuery = ref(true)
const isFirstStopsQuery = ref(true)

// Computed properties for results
const feedLinks = computed(() => feedsResult.value?.feeds || [])
const operatorLinks = computed(() => operatorsResult.value?.operators || [])
const routeLinks = computed(() => routesResult.value?.routes || [])
const stopLinks = computed(() => stopsResult.value?.stops || [])

// Overall loading state
const loading = computed(() => feedsLoading.value || operatorsLoading.value || routesLoading.value || stopsLoading.value)

// Individual loading states for UI
const loadingStates = computed(() => ({
  feeds: feedsLoading.value,
  operators: operatorsLoading.value,
  routes: routesLoading.value,
  stops: stopsLoading.value
}))

// Get list of groups still loading
const loadingGroups = computed(() => {
  const groups = []
  if (loadingStates.value.feeds) groups.push('feeds')
  if (loadingStates.value.operators) groups.push('operators')
  if (loadingStates.value.routes) groups.push('routes')
  if (loadingStates.value.stops) groups.push('stops')
  return groups
})

// Human-readable loading message
const loadingMessage = computed(() => {
  if (loadingGroups.value.length === 0) return ''
  if (loadingGroups.value.length === 1) {
    const group = loadingGroups.value[0]
    return `Searching ${group}...`
  }
  if (loadingGroups.value.length === 2) {
    return `Searching ${loadingGroups.value.join(' and ')}...`
  }
  if (loadingGroups.value.length === 3) {
    return `Searching ${loadingGroups.value.slice(0, 2).join(', ')} and ${loadingGroups.value[2]}...`
  }
  return `Searching ${loadingGroups.value.slice(0, 3).join(', ')} and ${loadingGroups.value.length - 3} more...`
})

// Total results count for empty state
const totalResults = computed(() =>
  feedLinks.value.length + operatorLinks.value.length + routeLinks.value.length + stopLinks.value.length
)

// Get global index for keyboard navigation
function getGlobalIndex (groupIndex, optionIndex) {
  let globalIndex = 0
  const groups = [operatorLinks.value, feedLinks.value, routeLinks.value, stopLinks.value]
  for (let i = 0; i < groupIndex; i++) {
    globalIndex += groups[i].length
  }
  return globalIndex + optionIndex
}

// Get option by global index
function getOptionByIndex (index) {
  let currentIndex = 0
  const allOptions = [
    ...operatorLinks.value.map(operator => ({
      label: operator.name || operator.onestop_id,
      value: operator,
      route: { name: 'operators-operatorKey', params: { operatorKey: operator.onestop_id } },
      type: 'operator',
      group: 'Operators'
    })),
    ...feedLinks.value.map(feed => ({
      label: feed.name || feed.onestop_id,
      value: feed,
      route: { name: 'feeds-feedKey', params: { feedKey: feed.onestop_id } },
      type: 'feed',
      group: 'Feeds'
    })),
    ...routeLinks.value.map(route => ({
      label: [route.route_short_name, route.route_long_name].filter(Boolean).join(' '),
      value: route,
      route: { name: 'routes-routeKey', params: { routeKey: route.onestop_id } },
      type: 'route',
      group: 'Routes',
      agency: route.agency?.agency_name
    })),
    ...stopLinks.value.map(stop => ({
      label: stop.stop_name,
      value: stop,
      route: { name: 'stops-stopKey', params: { stopKey: stop.onestop_id } },
      type: 'stop',
      group: 'Stops',
      agency: stop.route_stops?.[0]?.route?.agency?.agency_name
    }))
  ]

  return allOptions[index] || null
}

// Search function - run all queries in parallel
function executeSearch () {
  if (search.value.length < minLength) {
    // Clear all results
    feedsResult.value = null
    operatorsResult.value = null
    routesResult.value = null
    stopsResult.value = null
    // Reset first query flags
    isFirstFeedsQuery.value = true
    isFirstOperatorsQuery.value = true
    isFirstRoutesQuery.value = true
    isFirstStopsQuery.value = true
    return
  }

  if (process.server) {
    return
  }

  // Clear results immediately when starting new search
  feedsResult.value = null
  operatorsResult.value = null
  routesResult.value = null
  stopsResult.value = null

  const variables = { search: search.value }

  // Run all queries in parallel
  if (isFirstFeedsQuery.value) {
    loadFeeds(feedsQuery, variables) || refetchFeeds(variables)
    isFirstFeedsQuery.value = false
  } else {
    refetchFeeds(variables)
  }

  if (isFirstOperatorsQuery.value) {
    loadOperators(operatorsQuery, variables) || refetchOperators(variables)
    isFirstOperatorsQuery.value = false
  } else {
    refetchOperators(variables)
  }

  if (isFirstRoutesQuery.value) {
    loadRoutes(routesQuery, variables) || refetchRoutes(variables)
    isFirstRoutesQuery.value = false
  } else {
    refetchRoutes(variables)
  }

  if (isFirstStopsQuery.value) {
    loadStops(stopsQuery, variables) || refetchStops(variables)
    isFirstStopsQuery.value = false
  } else {
    refetchStops(variables)
  }
}

// Debounced search
const debouncedSearch = useDebounceFn(executeSearch, asyncDebounceTime)

// Watch for search changes
watch(search, () => {
  selectedIndex.value = 0
  debouncedSearch()
})

// Event handlers
function openCommandPalette () {
  isOpen.value = true
  search.value = ''
  selectedIndex.value = 0
  nextTick(() => {
    // Use a small delay to ensure the modal is fully rendered
    setTimeout(() => {
      // Try multiple approaches to focus the input
      const modalInput = document.querySelector('.command-palette-modal .command-palette-input input') as HTMLInputElement
      if (modalInput) {
        modalInput.focus()
      } else {
        // Fallback: try to focus using the ref
        if (searchInput.value?.$el) {
          const input = searchInput.value.$el.querySelector('input') as HTMLInputElement
          if (input) {
            input.focus()
          }
        }
      }
    }, 100)
  })
}

function closeCommandPalette () {
  isOpen.value = false
  search.value = ''
  selectedIndex.value = 0
}

function handleEnter (event) {
  if (totalResults.value > 0) {
    const option = getOptionByIndex(selectedIndex.value)
    if (option) {
      // Check for modifier key + enter for map navigation
      if (event.metaKey || event.ctrlKey) {
        goToMap(option)
      } else {
        selectOption(option)
      }
    }
  } else if (search.value.length >= minLength) {
    goToAdvancedSearch()
  }
}

function selectOption (option) {
  if (option && option.route) {
    // Generate proper URL based on route type
    let url = ''
    if (option.type === 'feed') {
      url = `/feeds/${option.route.params.feedKey}`
    } else if (option.type === 'operator') {
      url = `/operators/${option.route.params.operatorKey}`
    } else if (option.type === 'route') {
      url = `/routes/${option.route.params.routeKey}`
    } else if (option.type === 'stop') {
      url = `/stops/${option.route.params.stopKey}`
    }

    if (url) {
      window.location.href = url
    }
  }
  closeCommandPalette()
}

function goToAdvancedSearch () {
  if (search.value.length >= minLength) {
    const url = `/search?q=${encodeURIComponent(search.value)}`
    window.location.href = url
  }
  closeCommandPalette()
}

function calculatePolygonCentroid (ring) {
  // Calculate the centroid of a polygon ring (array of [lon, lat] coordinates)
  if (!ring || ring.length === 0) {
    return null
  }

  let sumLon = 0
  let sumLat = 0
  let count = 0

  for (const coord of ring) {
    if (coord && coord.length >= 2) {
      sumLon += coord[0]
      sumLat += coord[1]
      count++
    }
  }

  if (count === 0) {
    return null
  }

  return [sumLon / count, sumLat / count]
}

function calculateZoomFromBbox (bbox) {
  // Calculate appropriate zoom level from bounding box
  // bbox should be [[minLon, minLat], [maxLon, maxLat]]
  if (!bbox || bbox.length !== 2 || !bbox[0] || !bbox[1]) {
    return 10 // Default zoom
  }

  const [[minLon, minLat], [maxLon, maxLat]] = bbox

  // Calculate the span of the bounding box
  const lonSpan = maxLon - minLon
  const latSpan = maxLat - minLat

  // Use the larger span to determine zoom level
  const maxSpan = Math.max(lonSpan, latSpan)

  // More accurate zoom calculation based on MapLibre's approach
  // This approximates the zoom level needed to fit the bbox in a viewport
  let viewportWidth = 800 // Default fallback
  let viewportHeight = 600 // Default fallback

  if (process.client) {
    // Use actual window dimensions, but assume map takes up most of the viewport
    // Account for typical UI elements (navbar, etc.)
    viewportWidth = Math.max(400, window.innerWidth - 100) // Leave some margin
    viewportHeight = Math.max(300, window.innerHeight - 150) // Leave room for navbar/footer
  }

  const padding = 40 // Padding around the bounds

  // Calculate the zoom level needed to fit the bbox
  // This is a simplified version of MapLibre's cameraForBounds logic
  const latRad = (maxLat + minLat) / 2 * Math.PI / 180
  const latAdjustment = Math.cos(latRad)
  const adjustedLonSpan = lonSpan * latAdjustment

  const zoomX = Math.log2(viewportWidth / (adjustedLonSpan * 256 / 360))
  const zoomY = Math.log2(viewportHeight / (latSpan * 256 / 360))

  // Use the smaller zoom to ensure the entire bbox fits
  let zoom = Math.min(zoomX, zoomY)

  // Apply padding by reducing zoom slightly
  zoom -= Math.log2(1 + padding / Math.min(viewportWidth, viewportHeight))

  // Clamp zoom level to reasonable bounds
  zoom = Math.max(1, Math.min(18, Math.round(zoom)))

  return zoom
}

function calculateBboxFromGeometry (geometry) {
  // Calculate bounding box from various geometry types
  if (!geometry || !geometry.coordinates) {
    return null
  }

  let minLon = Infinity
  let maxLon = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  function processCoordinates (coords) {
    if (Array.isArray(coords)) {
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        // This is a coordinate [lon, lat]
        minLon = Math.min(minLon, coords[0])
        maxLon = Math.max(maxLon, coords[0])
        minLat = Math.min(minLat, coords[1])
        maxLat = Math.max(maxLat, coords[1])
      } else {
        // This is an array of coordinates
        coords.forEach(processCoordinates)
      }
    }
  }

  if (geometry.type === 'Point') {
    processCoordinates(geometry.coordinates)
  } else if (geometry.type === 'LineString') {
    processCoordinates(geometry.coordinates)
  } else if (geometry.type === 'Polygon') {
    // For polygons, process the first ring (exterior ring)
    if (geometry.coordinates[0]) {
      processCoordinates(geometry.coordinates[0])
    }
  } else if (geometry.type === 'MultiLineString') {
    geometry.coordinates.forEach(processCoordinates)
  }

  if (minLon === Infinity) {
    return null
  }

  return [[minLon, minLat], [maxLon, maxLat]]
}

function goToMap (option) {
  if (!option || !option.value) {
    return
  }

  let mapUrl = '/map'

  // Routes, stops, operators, and feeds can be shown on the map
  if (option.type === 'route' || option.type === 'stop' || option.type === 'operator' || option.type === 'feed') {
    let geometry = null

    if (option.type === 'operator') {
      // For operators, get geometry from the first agency
      const agencies = option.value.agencies
      if (agencies && agencies.length > 0 && agencies[0].geometry) {
        geometry = agencies[0].geometry
      }
    } else if (option.type === 'feed') {
      // For feeds, get geometry from the active feed version
      const feedState = option.value.feed_state
      if (feedState && feedState.feed_version && feedState.feed_version.geometry) {
        geometry = feedState.feed_version.geometry
      }
    } else {
      // For routes and stops, use direct geometry
      geometry = option.value.geometry
    }

    if (geometry && geometry.coordinates) {
      let coords
      let zoom = 12 // Default zoom

      if (geometry.type === 'Point') {
        coords = geometry.coordinates // [lon, lat]
        // For points (stops), use a close zoom
        zoom = 16
      } else if (geometry.type === 'LineString' && geometry.coordinates.length > 0) {
        // For routes, calculate bbox and use centroid
        const bbox = calculateBboxFromGeometry(geometry)
        if (bbox) {
          coords = calculatePolygonCentroid([bbox[0], bbox[1]])
          zoom = calculateZoomFromBbox(bbox)
        } else {
          coords = geometry.coordinates[0]
        }
      } else if (geometry.type === 'MultiLineString' && geometry.coordinates.length > 0 && geometry.coordinates[0].length > 0) {
        // For multi-line routes, calculate bbox and use centroid
        const bbox = calculateBboxFromGeometry(geometry)
        if (bbox) {
          coords = calculatePolygonCentroid([bbox[0], bbox[1]])
          zoom = calculateZoomFromBbox(bbox)
        } else {
          coords = geometry.coordinates[0][0]
        }
      } else if (geometry.type === 'Polygon' && geometry.coordinates.length > 0 && geometry.coordinates[0].length > 0) {
        // For polygons (operators, feeds), calculate bbox and use centroid
        const bbox = calculateBboxFromGeometry(geometry)
        if (bbox) {
          coords = calculatePolygonCentroid([bbox[0], bbox[1]])
          zoom = calculateZoomFromBbox(bbox)
        } else {
          coords = calculatePolygonCentroid(geometry.coordinates[0])
        }
      }

      if (coords && coords.length >= 2) {
        const [lon, lat] = coords
        mapUrl = `/map#${zoom}/${lat.toFixed(4)}/${lon.toFixed(4)}`
      }
    }
  }

  window.location.href = mapUrl
  closeCommandPalette()
}

function navigateUp () {
  if (totalResults.value > 0) {
    selectedIndex.value = Math.max(0, selectedIndex.value - 1)
    scrollToSelected()
  }
}

function navigateDown () {
  if (totalResults.value > 0) {
    selectedIndex.value = Math.min(totalResults.value - 1, selectedIndex.value + 1)
    scrollToSelected()
  }
}

function scrollToSelected () {
  nextTick(() => {
    const selectedElement = document.querySelector('.command-palette-item.is-active')
    if (selectedElement) {
      selectedElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  })
}

// Keyboard shortcuts
function handleKeydown (event) {
  if ((event.metaKey || event.ctrlKey) && event.key === '/') {
    event.preventDefault()
    openCommandPalette()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped lang="scss">
.navbar-item {
  .field {
    margin-bottom: 0;
  }

  .control {
    position: relative;
  }

  .icon.is-left {
    position: absolute;
    left: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 2;
  }
}

.navbar-search-input {
  width: 200px;
  cursor: pointer;
  padding-left: 2rem;

  :deep(.input) {
    cursor: pointer;
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    font-size: 0.875rem;
    height: 2.25rem;
    padding-left: 2rem;
    background-color: #fff;

    &:hover {
      border-color: var(--oruga-primary);
    }

    &:focus {
      border-color: var(--oruga-primary);
      box-shadow: 0 0 0 0.125em rgba(140, 103, 239, 0.25);
    }
  }

  :deep(.input[readonly]) {
    cursor: pointer;
    background-color: #fafafa;
  }
}

.command-palette-modal {
  .modal-card {
    width: 60vw;
    max-width: 500px;
    max-height: 70vh;
    margin: 2rem auto;
  }
}

.command-palette-results {
  max-height: 60vh;
  overflow-y: auto;
}

.command-palette-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover,
  &.is-active {
    background: rgba(140, 103, 239, 0.08);
  }

  &:last-child {
    border-bottom: none;
  }
}

.command-palette-item-content {
  flex: 1;
  min-width: 0;
}

.command-palette-item-label {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}

.command-palette-item-type {
  font-size: 0.65rem;
  color: #7a7a7a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.125rem;
}

.command-palette-item-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.command-palette-item-map-icon {
  color: #7a7a7a;
  cursor: pointer;
  transition: color 0.15s ease;

  &:hover {
    color: var(--oruga-primary);
  }
}

.command-palette-item-arrow {
  color: #dbdbdb;
  flex-shrink: 0;
}

// Loading spinner animation
.is-spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// Responsive design
@media (max-width: 768px) {
  .navbar-search-input {
    width: 150px;

    :deep(.input) {
      font-size: 0.8rem;
      height: 2rem;
    }
  }

  .command-palette-modal .modal-card {
    width: 95vw;
    max-width: 400px;
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .navbar-search-input {
    width: 120px;

    :deep(.input) {
      font-size: 0.75rem;
      height: 1.75rem;
      padding-left: 1.5rem;
    }
  }

  .icon.is-left {
    left: 0.375rem;
  }
}
</style>
