import { ref, computed } from 'vue'
import { gql } from 'graphql-tag'
import { useLazyQuery } from '@vue/apollo-composable'

// Search result types
export interface SearchResult {
  id: string
  onestop_id: string
  name?: string
  search_rank?: number
}

export interface FeedResult extends SearchResult {
  name: string
}

export interface OperatorResult extends SearchResult {
  name: string
  short_name?: string
}

export interface RouteResult extends SearchResult {
  route_short_name?: string
  route_long_name?: string
  feed_onestop_id: string
  agency?: {
    id: string
    agency_name: string
  }
}

export interface StopResult extends SearchResult {
  stop_name: string
  geometry?: any
}

export interface SearchFilters {
  feeds?: boolean
  operators?: boolean
  routes?: boolean
  stops?: boolean
}

export interface SearchState {
  query: string
  isSearching: boolean
  hasSearched: boolean
  filters: SearchFilters
  results: {
    feeds: FeedResult[]
    operators: OperatorResult[]
    routes: RouteResult[]
    stops: StopResult[]
  }
  errors: {
    feeds: any
    operators: any
    routes: any
    stops: any
  }
}

// GraphQL Queries
const FEEDS_QUERY = gql`
  query FeedsSearch($search: String!, $limit: Int=10) {
    feeds(limit: $limit, where:{search:$search}) {
      id
      name
      onestop_id
      search_rank
    }
  }
`

const OPERATORS_QUERY = gql`
  query OperatorsSearch($search: String!, $limit: Int=10) {
    operators(limit: $limit, where:{search:$search, merged: true}) {
      onestop_id
      name
      short_name
      search_rank
    }
  }
`

const ROUTES_QUERY = gql`
  query RoutesSearch($search: String!, $limit: Int=10) {
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

const STOPS_QUERY = gql`
  query StopsSearch($search: String!, $limit: Int=10) {
    stops(limit: $limit, where:{search:$search}) {
      id
      onestop_id
      stop_name
      geometry
      search_rank
    }
  }
`

export function useSearch (options: {
  minLength?: number
  debounceTime?: number
  defaultFilters?: Partial<SearchFilters>
} = {}) {
  const {
    minLength = 3,
    debounceTime = 200,
    defaultFilters = {
      feeds: true,
      operators: true,
      routes: true,
      stops: true
    }
  } = options

  // State
  const query = ref('')
  const isSearching = ref(false)
  const hasSearched = ref(false)
  const filters = ref<SearchFilters>({ ...defaultFilters })

  const results = ref({
    feeds: [] as FeedResult[],
    operators: [] as OperatorResult[],
    routes: [] as RouteResult[],
    stops: [] as StopResult[]
  })

  const errors = ref({
    feeds: null as any,
    operators: null as any,
    routes: null as any,
    stops: null as any
  })

  // Lazy queries
  const { load: loadFeeds } = useLazyQuery(FEEDS_QUERY, {}, { clientId: 'transitland' })
  const { load: loadOperators } = useLazyQuery(OPERATORS_QUERY, {}, { clientId: 'transitland' })
  const { load: loadRoutes } = useLazyQuery(ROUTES_QUERY, {}, { clientId: 'transitland' })
  const { load: loadStops } = useLazyQuery(STOPS_QUERY, {}, { clientId: 'transitland' })

  // Computed properties
  const hasAnyResults = computed(() =>
    results.value.feeds.length > 0
    || results.value.operators.length > 0
    || results.value.routes.length > 0
    || results.value.stops.length > 0
  )

  const isQueryValid = computed(() => query.value.length >= minLength)

  // Search functions
  async function searchFeeds () {
    if (!filters.value.feeds || !isQueryValid.value) {
      results.value.feeds = []
      return
    }

    try {
      const result = await loadFeeds(FEEDS_QUERY, { search: query.value })
      results.value.feeds = result?.data?.feeds || []
      errors.value.feeds = null
    } catch (error) {
      console.error('Feeds search error:', error)
      errors.value.feeds = error
      results.value.feeds = []
    }
  }

  async function searchOperators () {
    if (!filters.value.operators || !isQueryValid.value) {
      results.value.operators = []
      return
    }

    try {
      const result = await loadOperators(OPERATORS_QUERY, { search: query.value })
      results.value.operators = result?.data?.operators || []
      errors.value.operators = null
    } catch (error) {
      console.error('Operators search error:', error)
      errors.value.operators = error
      results.value.operators = []
    }
  }

  async function searchRoutes () {
    if (!filters.value.routes || !isQueryValid.value) {
      results.value.routes = []
      return
    }

    try {
      const result = await loadRoutes(ROUTES_QUERY, { search: query.value })
      results.value.routes = result?.data?.routes || []
      errors.value.routes = null
    } catch (error) {
      console.error('Routes search error:', error)
      errors.value.routes = error
      results.value.routes = []
    }
  }

  async function searchStops () {
    if (!filters.value.stops || !isQueryValid.value) {
      results.value.stops = []
      return
    }

    try {
      const result = await loadStops(STOPS_QUERY, { search: query.value })
      results.value.stops = result?.data?.stops || []
      errors.value.stops = null
    } catch (error) {
      console.error('Stops search error:', error)
      errors.value.stops = error
      results.value.stops = []
    }
  }

  // Main search function
  async function performSearch () {
    if (!isQueryValid.value) {
      clearResults()
      return
    }

    isSearching.value = true
    hasSearched.value = true

    // Perform all enabled searches in parallel
    const searchPromises = [
      searchFeeds(),
      searchOperators(),
      searchRoutes(),
      searchStops()
    ]

    await Promise.allSettled(searchPromises)
    isSearching.value = false
  }

  // Utility functions
  function clearResults () {
    results.value = {
      feeds: [],
      operators: [],
      routes: [],
      stops: []
    }
    errors.value = {
      feeds: null,
      operators: null,
      routes: null,
      stops: null
    }
    hasSearched.value = false
  }

  function clearSearch () {
    query.value = ''
    clearResults()
  }

  function setQuery (newQuery: string) {
    query.value = newQuery
  }

  function setFilters (newFilters: Partial<SearchFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  // Return composable interface
  return {
    // State
    query,
    isSearching,
    hasSearched,
    filters,
    results,
    errors,

    // Computed
    hasAnyResults,
    isQueryValid,

    // Methods
    performSearch,
    clearResults,
    clearSearch,
    setQuery,
    setFilters,

    // Individual search methods (for progressive loading)
    searchFeeds,
    searchOperators,
    searchRoutes,
    searchStops
  }
}
