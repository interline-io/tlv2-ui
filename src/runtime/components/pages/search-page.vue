<template>
  <div class="container is-max-widescreen">
    <div class="columns">
      <div class="column is-8">
        <!-- Search Header -->
        <div class="box">
          <h1 class="title is-4">
            Search Transit Land
          </h1>
          <div class="field has-addons">
            <div class="control is-expanded">
              <o-input
                v-model="searchQuery"
                expanded
                placeholder="Search feeds, operators, routes, and stops..."
                icon="magnify"
                @keydown.enter="performSearch"
              />
            </div>
            <div class="control">
              <o-button type="is-primary" @click="performSearch">
                Search
              </o-button>
            </div>
          </div>

          <!-- Search Filters -->
          <div class="field is-grouped is-grouped-multiline mt-4">
            <div class="control">
              <o-checkbox v-model="searchFilters.feeds" @change="performSearch">
                Feeds
              </o-checkbox>
            </div>
            <div class="control">
              <o-checkbox v-model="searchFilters.operators" @change="performSearch">
                Operators
              </o-checkbox>
            </div>
            <div class="control">
              <o-checkbox v-model="searchFilters.routes" @change="performSearch">
                Routes
              </o-checkbox>
            </div>
            <div class="control">
              <o-checkbox v-model="searchFilters.stops" @change="performSearch">
                Stops
              </o-checkbox>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isSearching" class="box has-text-centered">
          <o-icon icon="loading" spin size="is-large" />
          <p class="mt-2">
            Searching...
          </p>
        </div>

        <!-- Search Results -->
        <div v-else-if="hasSearched && !isSearching">
          <!-- No Results -->
          <div v-if="!hasAnyResults" class="box has-text-centered">
            <o-icon icon="magnify" size="is-large" />
            <p class="mt-2">
              No results found for "{{ searchQuery }}"
            </p>
            <p class="has-text-grey">
              Try adjusting your search terms or filters
            </p>
          </div>

          <!-- Results -->
          <div v-else>
            <!-- Feeds Results -->
            <div v-if="searchFilters.feeds && feedsResults.length > 0" class="box">
              <h2 class="title is-5">
                Feeds
                <span class="tag is-primary ml-2">{{ feedsResults.length }}</span>
              </h2>
              <div class="content">
                <div v-for="feed in feedsResults" :key="feed.onestop_id" class="search-result-item">
                  <h3 class="is-6">
                    <nuxt-link :to="{name:'feeds-feedKey', params:{feedKey:feed.onestop_id}}">
                      {{ feed.name || feed.onestop_id }}
                    </nuxt-link>
                  </h3>
                  <p class="has-text-grey">
                    {{ feed.onestop_id }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Operators Results -->
            <div v-if="searchFilters.operators && operatorsResults.length > 0" class="box">
              <h2 class="title is-5">
                Operators
                <span class="tag is-primary ml-2">{{ operatorsResults.length }}</span>
              </h2>
              <div class="content">
                <div v-for="operator in operatorsResults" :key="operator.onestop_id" class="search-result-item">
                  <h3 class="is-6">
                    <nuxt-link :to="{name:'operators-operatorKey', params:{operatorKey:operator.onestop_id}}">
                      {{ operator.name || operator.onestop_id }}
                    </nuxt-link>
                  </h3>
                  <p class="has-text-grey">
                    {{ operator.onestop_id }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Routes Results -->
            <div v-if="searchFilters.routes && routesResults.length > 0" class="box">
              <h2 class="title is-5">
                Routes
                <span class="tag is-primary ml-2">{{ routesResults.length }}</span>
              </h2>
              <div class="content">
                <div v-for="route in routesResults" :key="route.onestop_id" class="search-result-item">
                  <h3 class="is-6">
                    <nuxt-link :to="{name:'routes-routeKey', params:{routeKey:route.onestop_id}}">
                      {{ [route.route_short_name, route.route_long_name].filter(Boolean).join(' ') }}
                    </nuxt-link>
                  </h3>
                  <p class="has-text-grey">
                    {{ route.agency?.agency_name }} • {{ route.onestop_id }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Stops Results -->
            <div v-if="searchFilters.stops && stopsResults.length > 0" class="box">
              <h2 class="title is-5">
                Stops
                <span class="tag is-primary ml-2">{{ stopsResults.length }}</span>
              </h2>
              <div class="content">
                <div v-for="stop in stopsResults" :key="stop.onestop_id" class="search-result-item">
                  <h3 class="is-6">
                    <nuxt-link :to="{name:'stops-stopKey', params:{stopKey:stop.onestop_id}}">
                      {{ stop.stop_name }}
                    </nuxt-link>
                  </h3>
                  <p class="has-text-grey">
                    {{ stop.onestop_id }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Initial State -->
        <div v-else class="box has-text-centered">
          <o-icon icon="magnify" size="is-large" />
          <p class="mt-2">
            Enter a search term to find feeds, operators, routes, and stops
          </p>
        </div>
      </div>

      <div class="column is-4">
        <!-- Search Tips -->
        <div class="box">
          <h3 class="title is-6">
            Search Tips
          </h3>
          <div class="content">
            <ul>
              <li>Use specific terms like "BART" or "MTA"</li>
              <li>Search by city: "San Francisco" or "New York"</li>
              <li>Look for route numbers: "1", "Blue Line"</li>
              <li>Find stops by name: "Union Square"</li>
            </ul>
          </div>
        </div>

        <!-- Recent Searches -->
        <div v-if="recentSearches.length > 0" class="box">
          <h3 class="title is-6">
            Recent Searches
          </h3>
          <div class="content">
            <div v-for="(recent, index) in recentSearches" :key="index" class="recent-search-item">
              <a @click="searchQuery = recent; performSearch()">
                {{ recent }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gql } from 'graphql-tag'
import { ref, computed, onMounted, watch } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'

// Props
const props = defineProps<{
  initialQuery?: string
}>()

// Reactive data
const searchQuery = ref(props.initialQuery || '')
const isSearching = ref(false)
const hasSearched = ref(false)

// Search filters
const searchFilters = ref({
  feeds: true,
  operators: true,
  routes: true,
  stops: true
})

// Search results
const feedsResults = ref([])
const operatorsResults = ref([])
const routesResults = ref([])
const stopsResults = ref([])

// Recent searches (stored in localStorage)
const recentSearches = ref<string[]>([])

// Computed properties
const hasAnyResults = computed(() =>
  feedsResults.value.length > 0
  || operatorsResults.value.length > 0
  || routesResults.value.length > 0
  || stopsResults.value.length > 0
)

// GraphQL Queries
const feedsQuery = gql`
  query FeedsSearch($search: String!, $limit: Int=20) {
    feeds(limit: $limit, where:{search:$search}) {
      id
      name
      onestop_id
      search_rank
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
    }
  }
`

// Lazy queries
const { load: loadFeeds } = useLazyQuery(feedsQuery, {}, { clientId: 'transitland' })
const { load: loadOperators } = useLazyQuery(operatorsQuery, {}, { clientId: 'transitland' })
const { load: loadRoutes } = useLazyQuery(routesQuery, {}, { clientId: 'transitland' })
const { load: loadStops } = useLazyQuery(stopsQuery, {}, { clientId: 'transitland' })

// Search functions
async function searchFeeds () {
  if (!searchFilters.value.feeds) {
    feedsResults.value = []
    return
  }

  try {
    const result = await loadFeeds(feedsQuery, { search: searchQuery.value })
    feedsResults.value = result?.data?.feeds || []
  } catch (error) {
    console.error('Feeds search error:', error)
    feedsResults.value = []
  }
}

async function searchOperators () {
  if (!searchFilters.value.operators) {
    operatorsResults.value = []
    return
  }

  try {
    const result = await loadOperators(operatorsQuery, { search: searchQuery.value })
    operatorsResults.value = result?.data?.operators || []
  } catch (error) {
    console.error('Operators search error:', error)
    operatorsResults.value = []
  }
}

async function searchRoutes () {
  if (!searchFilters.value.routes) {
    routesResults.value = []
    return
  }

  try {
    const result = await loadRoutes(routesQuery, { search: searchQuery.value })
    routesResults.value = result?.data?.routes || []
  } catch (error) {
    console.error('Routes search error:', error)
    routesResults.value = []
  }
}

async function searchStops () {
  if (!searchFilters.value.stops) {
    stopsResults.value = []
    return
  }

  try {
    const result = await loadStops(stopsQuery, { search: searchQuery.value })
    stopsResults.value = result?.data?.stops || []
  } catch (error) {
    console.error('Stops search error:', error)
    stopsResults.value = []
  }
}

// Main search function
async function performSearch () {
  if (!searchQuery.value.trim()) {
    return
  }

  isSearching.value = true
  hasSearched.value = true

  // Add to recent searches
  addToRecentSearches(searchQuery.value)

  // Perform all searches in parallel
  const searchPromises = [
    searchFeeds(),
    searchOperators(),
    searchRoutes(),
    searchStops()
  ]

  await Promise.allSettled(searchPromises)
  isSearching.value = false
}

// Recent searches management
function addToRecentSearches (query: string) {
  if (!query.trim()) return

  const recent = recentSearches.value.filter(item => item !== query)
  recent.unshift(query)
  recentSearches.value = recent.slice(0, 5) // Keep only 5 recent searches

  // Save to localStorage
  if (process.client) {
    localStorage.setItem('transitland-recent-searches', JSON.stringify(recentSearches.value))
  }
}

function loadRecentSearches () {
  if (process.client) {
    const stored = localStorage.getItem('transitland-recent-searches')
    if (stored) {
      try {
        recentSearches.value = JSON.parse(stored)
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }
}

// Watch for search changes to add to recent searches
watch(searchQuery, (newQuery) => {
  if (newQuery.trim() && hasSearched.value) {
    addToRecentSearches(newQuery)
  }
})

// Initialize
onMounted(() => {
  loadRecentSearches()

  // If we have an initial query, perform search
  if (props.initialQuery) {
    performSearch()
  }
})
</script>

<style scoped lang="scss">
.search-result-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--bulma-border-light);

  &:last-child {
    border-bottom: none;
  }

  h3 {
    margin-bottom: 0.25rem;

    a {
      color: var(--bulma-link);

      &:hover {
        color: var(--bulma-link-hover);
      }
    }
  }
}

.recent-search-item {
  padding: 0.25rem 0;

  a {
    color: var(--bulma-link);
    cursor: pointer;

    &:hover {
      color: var(--bulma-link-hover);
      text-decoration: underline;
    }
  }
}

.box {
  margin-bottom: 1rem;
}
</style>
