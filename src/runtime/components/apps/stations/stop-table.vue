<template>
  <div>
    <tl-msg v-if="error" variant="error">
      {{ error }}
    </tl-msg>
    <div v-else>
      <tl-search-bar v-model="search" class="mb-4" placeholder="Filter stops by name..." />
      <t-loading :active="loading" :full-page="false" />
      <div class="table-container">
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Stop name</th>
              <th>GTFS ID</th>
              <th>Served by routes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stop of stops" :key="stop.id">
              <td>
                <slot name="stopName" :stop="stop">
                  {{ stop.stop_name }}
                </slot>
              </td>
              <td><tl-safelink :text="stop.stop_id" max-width="100px" /></td>
              <td>{{ servedByRoutes(stop) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'

// Types
interface FeedVersionResponse {
  stops: {
    id: number
    stop_id: string
    stop_name: string
    children?: {
      id: number
      route_stops: {
        route: {
          id: number
          route_short_name?: string
          route_long_name?: string
        }
      }[]
    }[]
    route_stops: {
      route: {
        id: number
        route_short_name?: string
        route_long_name?: string
      }
    }[]
  }[]
}

// Extract individual types from the response type
type FeedVersion = FeedVersionResponse
type Stop = FeedVersionResponse['stops'][0]
type RouteStop = Stop['route_stops'][0]
type Route = RouteStop['route']

interface QueryVariables {
  feed_version_sha1?: string | null
  feed_version_ids?: number[]
  servicedOnly?: boolean | null
  agency_ids?: number[]
  limit?: number
  search?: string | null
  location_type?: number | null
}

// Props
const props = withDefaults(defineProps<{
  feedVersionSha1?: string | null
  feedVersionIds?: number[]
  agencyIds?: number[]
  locationType?: number | null
  servicedOnly?: boolean
  limit?: number
  client?: string
}>(), {
  feedVersionSha1: null,
  feedVersionIds: () => [],
  agencyIds: () => [],
  locationType: null,
  servicedOnly: false,
  limit: 100,
  client: 'default',
})

// GraphQL Query
const STOPS_QUERY = gql`
  query ($feed_version_sha1: String, $feed_version_ids: [Int!], $servicedOnly: Boolean, $agency_ids: [Int!], $limit: Int=100, $search: String, $location_type:Int) {
    feed_versions(ids: $feed_version_ids, where: { sha1: $feed_version_sha1 }) {
      stops(limit: $limit, where: {serviced: $servicedOnly, agency_ids: $agency_ids, feed_version_sha1: $feed_version_sha1, search: $search, location_type:$location_type}) {
        id
        stop_id
        stop_name
        children {
          id
          route_stops {
            route {
              id
              route_short_name
              route_long_name
            }
          }
        }
        route_stops {
          route {
            id
            route_short_name
            route_long_name
          }
        }
      }
    }
  }
`

// Reactive data
const search = ref<string | null>(null)
const error = ref<Error | null>(null)

// Computed query variables
const queryVariables = computed<QueryVariables>(() => ({
  search: search.value,
  limit: props.limit,
  location_type: props.locationType,
  feed_version_sha1: props.feedVersionSha1,
  feed_version_ids: props.feedVersionIds?.length ? props.feedVersionIds : [],
  agency_ids: props.agencyIds,
  servicedOnly: props.servicedOnly ? true : null
}))

// Apollo Query
const { result, loading: queryLoading, onError } = useQuery<{ feed_versions: FeedVersionResponse[] }>(
  STOPS_QUERY,
  queryVariables,
  {
    clientId: props.client
  }
)

const loading = computed<boolean>(() => queryLoading.value ?? false)

// Handle errors
onError((err) => {
  error.value = err
})

// Utility functions
const routeName = (route: Route): string => {
  if (route.route_short_name && route.route_long_name) {
    return `${route.route_short_name} (${route.route_long_name})`
  } else if (route.route_short_name) {
    return route.route_short_name
  } else if (route.route_long_name) {
    return route.route_long_name
  }
  return ''
}

const servedByRoutes = (stop: Stop): string => {
  const routeNames = new Set<string>()

  for (const routeStop of stop.route_stops) {
    routeNames.add(routeName(routeStop.route))
  }

  for (const childStop of stop.children || []) {
    for (const routeStop of childStop.route_stops) {
      routeNames.add(routeName(routeStop.route))
    }
  }

  return Array.from(routeNames).join(', ')
}

// Computed properties
const feed_versions = computed<FeedVersion[]>(() => result.value?.feed_versions || [])

const stops = computed<Stop[]>(() => {
  const allStops: Stop[] = []
  for (const feedVersion of feed_versions.value) {
    for (const stop of feedVersion.stops) {
      allStops.push(stop)
    }
  }
  return allStops
})
</script>
