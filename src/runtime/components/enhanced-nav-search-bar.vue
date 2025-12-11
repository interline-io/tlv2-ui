<template>
  <div class="navbar-item search-container">
    <ClientOnly>
      <o-autocomplete
        v-model="selectedValue"
        :input="search"
        :options="searchOptions"
        expanded
        placeholder="Search feeds, operators, routes, and stops..."
        icon="magnify"
        :clearable="true"
        :open-on-focus="true"
        :keep-open="false"
        :select-on-close="false"
        :clear-on-select="false"
        :teleport="false"
        root-class="navbar-search-input"
        dropdown-class="is-right"
        @select="handleSelect"
        @keydown.enter="handleEnter"
        @update:input="handleInput"
      >
        <template #header>
          <div class="navbar-item search-header">
            <strong>Search Results</strong>
          </div>
        </template>

        <template #group="props">
          <div class="navbar-item search-group-header">
            <strong>{{ props.group.label }}</strong>
          </div>
        </template>

        <template #default="props">
          <div class="navbar-item search-result-item">
            <nuxt-link :to="props.option.route">
              {{ props.option.label }}
            </nuxt-link>
          </div>
        </template>

        <template #empty>
          <div class="navbar-item">
            <span v-if="search.length < minLength">
              Type at least {{ minLength }} characters to search
            </span>
            <span v-else-if="loading">
              <o-icon icon="loading" spin />
              Searching...
            </span>
            <span v-else>No results found</span>
          </div>
        </template>
      </o-autocomplete>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { gql } from 'graphql-tag'
import { useDebounceFn } from '@vueuse/core'
import { ref, computed, watch } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'

const minLength = 3
const asyncDebounceTime = 200
const search = ref('')
const selectedValue = ref(null)

// Single query that includes all search types
const query = gql`
query ($search: String!, $limit: Int=5) {
    feeds(limit: $limit, where:{search:$search}) {
        id
        name
        onestop_id
        search_rank
    }
    operators(limit: $limit, where:{search:$search, merged: true}) {
        onestop_id
        name
        short_name
        search_rank
    }
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
    stops(limit: $limit, where:{search:$search}) {
        id
        onestop_id
        stop_name
        geometry
        search_rank
    }
}
`

const { result, loading, error, load, refetch, stop } = useLazyQuery(query, {}, {
  clientId: 'transitland',
  onCompleted: (data) => {
    console.log('✅ Query completed successfully:', data)
  },
  onError: (error) => {
    console.error('❌ Query failed:', error)
  }
})

// Track if this is the first query
const isFirstQuery = ref(true)

// Debug loading and error states
watch(loading, (newValue) => {
  console.log('⏳ Loading state changed:', newValue)
})

watch(error, (newValue) => {
  console.log('❌ Error state changed:', newValue)
  if (newValue) {
    console.error('🚨 GraphQL Error:', newValue)
  }
})

watch(result, (newValue) => {
  console.log('📊 Result state changed:', newValue)
})

// Computed properties for results
const feedLinks = computed(() => {
  const feeds = result.value?.feeds || []
  console.log('📰 Feed links computed:', feeds)
  return feeds
})
const operatorLinks = computed(() => {
  const operators = result.value?.operators || []
  console.log('🏢 Operator links computed:', operators)
  return operators
})
const routeLinks = computed(() => {
  const routes = result.value?.routes || []
  console.log('🚌 Route links computed:', routes)
  return routes
})
const stopLinks = computed(() => {
  const stops = result.value?.stops || []
  console.log('🚏 Stop links computed:', stops)
  return stops
})

// Transform results into Oruga autocomplete format
const searchOptions = computed(() => {
  console.log('🔄 Computing search options...')
  console.log('📊 Raw result value:', result.value)
  console.log('📊 Feed links:', feedLinks.value)
  console.log('📊 Operator links:', operatorLinks.value)
  console.log('📊 Route links:', routeLinks.value)
  console.log('📊 Stop links:', stopLinks.value)

  const options = []

  // Add feeds
  if (feedLinks.value.length > 0) {
    const feedOptions = feedLinks.value.map(feed => ({
      label: feed.name || feed.onestop_id,
      value: feed,
      route: { name: 'feeds-feedKey', params: { feedKey: feed.onestop_id } },
      type: 'feed',
      group: 'Feeds'
    }))
    console.log('📰 Adding feed options:', feedOptions)
    options.push(...feedOptions)
  }

  // Add operators
  if (operatorLinks.value.length > 0) {
    const operatorOptions = operatorLinks.value.map(operator => ({
      label: operator.name || operator.onestop_id,
      value: operator,
      route: { name: 'operators-operatorKey', params: { operatorKey: operator.onestop_id } },
      type: 'operator',
      group: 'Operators'
    }))
    console.log('🏢 Adding operator options:', operatorOptions)
    options.push(...operatorOptions)
  }

  // Add routes
  if (routeLinks.value.length > 0) {
    const routeOptions = routeLinks.value.map(route => ({
      label: [route.route_short_name, route.route_long_name].filter(Boolean).join(' '),
      value: route,
      route: { name: 'routes-routeKey', params: { routeKey: route.onestop_id } },
      type: 'route',
      group: 'Routes'
    }))
    console.log('🚌 Adding route options:', routeOptions)
    options.push(...routeOptions)
  }

  // Add stops
  if (stopLinks.value.length > 0) {
    const stopOptions = stopLinks.value.map(stop => ({
      label: stop.stop_name,
      value: stop,
      route: { name: 'stops-stopKey', params: { stopKey: stop.onestop_id } },
      type: 'stop',
      group: 'Stops'
    }))
    console.log('🚏 Adding stop options:', stopOptions)
    options.push(...stopOptions)
  }

  console.log('✅ Final search options:', options)
  return options
})

// Search function
function loadReload () {
  console.log('🔍 loadReload called', { search: search.value, length: search.value.length, minLength })

  // Cancel any running query first
  if (loading.value) {
    console.log('⏹️ Cancelling previous query')
    stop()
    // Add a small delay to let the query reset
    setTimeout(() => {
      executeSearch()
    }, 50)
    return
  }

  executeSearch()
}

function executeSearch () {
  if (search.value.length < minLength) {
    console.log('❌ Search too short, clearing results')
    result.value = null
    // Reset the first query flag when clearing results
    isFirstQuery.value = true
    return
  }

  // Only run on client side
  if (process.server) {
    console.log('🚫 Skipping search on server side')
    return
  }

  // Debug Apollo client availability
  console.log('🔍 Checking Apollo client availability...')
  console.log('📊 Process client:', process.client)
  console.log('📊 Process server:', process.server)

  // Check if we can access the Apollo client
  try {
    const { $apollo } = useNuxtApp()
    console.log('📊 Apollo client available:', !!$apollo)
  } catch (e) {
    console.log('❌ Apollo client not available:', e.message)
  }

  const variables = {
    search: search.value
  }

  console.log('🚀 Starting search for:', search.value)
  console.log('📊 Variables:', variables)
  console.log('📊 Current loading state:', loading.value)
  console.log('📊 Current result state:', result.value)
  console.log('📊 Current error state:', error.value)
  console.log('📊 Is first query:', isFirstQuery.value)

  let queryResult

  if (isFirstQuery.value) {
    console.log('🔄 Using load() for first query')
    queryResult = load(query, variables) || refetch(variables)
    isFirstQuery.value = false
  } else {
    console.log('🔄 Using refetch() for subsequent query')
    queryResult = refetch(variables)
  }

  console.log('🔄 Query result:', queryResult)

  // Add a timeout to detect hanging queries
  setTimeout(() => {
    if (loading.value) {
      console.warn('⚠️ Query is still loading after 10 seconds - possible network issue')
    }
  }, 10000)
}

// Debounced search
const debouncedSearch = useDebounceFn(loadReload, asyncDebounceTime)

// Watch for search changes (only on client side)
if (process.client) {
  watch(search, (newValue, oldValue) => {
    console.log('👀 Search value changed:', { newValue, oldValue, length: newValue.length })
    debouncedSearch()
  })
}

// Event handlers
function handleInput (value) {
  console.log('⌨️ Input event triggered:', value)
  search.value = value
  console.log('📊 Updated search value:', search.value)
  console.log('📊 Search length:', search.value.length)
  console.log('📊 Min length:', minLength)
}

function handleSelect (option) {
  console.log('🎯 Option selected:', option)
  if (option && option.route) {
    // Navigate to the selected item
    const url = `/${option.route.name.replace(/-/g, '/')}/${option.route.params[Object.keys(option.route.params)[0]]}`
    console.log('🔗 Navigating to:', url)
    window.location.href = url
    // Clear the search and selected value
    search.value = ''
    selectedValue.value = null
  }
}

function handleEnter () {
  console.log('⏎ Enter pressed, search value:', search.value)
  if (search.value.length >= minLength) {
    goToAdvancedSearch()
  }
}

function goToAdvancedSearch () {
  console.log('🔍 Going to advanced search for:', search.value)
  if (search.value.length >= minLength) {
    // Navigate to advanced search page with query parameter
    const url = `/search?q=${encodeURIComponent(search.value)}`
    console.log('🔗 Advanced search URL:', url)
    window.location.href = url
  }
}
</script>

<style scoped lang="scss">
.search-container {
  position: relative;
}

.navbar-search-input {
  width: 160px;

  // Ensure dropdown is positioned to the right edge of the input
  :deep(.dropdown-content) {
    right: 0;
    left: auto;
    transform: translateX(0);
    min-width: 400px;
    width: max-content;
    position: absolute;
    top: 100%;
  }

  :deep(.dropdown-menu) {
    right: 0;
    left: auto;
    transform: translateX(0);
    min-width: 400px;
    width: max-content;
    position: absolute;
    top: 100%;
  }

  // Position the dropdown to align with the right edge
  :deep(.dropdown) {
    position: relative;

    &.is-right .dropdown-menu {
      right: 0;
      left: auto;
    }
  }
}

.search-header {
  background-color: var(--bulma-background-ter);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--bulma-border);
}

.search-group-header {
  background-color: var(--bulma-background-ter);
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--bulma-border);
}

.search-result-item {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--bulma-border-light);

  &:hover {
    background-color: var(--bulma-background-ter);
  }

  a {
    color: var(--bulma-link);
    text-decoration: none;

    &:hover {
      color: var(--bulma-link-hover);
    }
  }
}

// Loading spinner styles
.o-icon {
  &.is-spin {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
