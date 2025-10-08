<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <o-field expanded grouped>
        <tl-search-bar v-model="search" expanded placeholder="Filter stops by name..." />
        <tl-route-type-select v-model="selectedRouteType" />
      </o-field>
      <o-loading v-model:active="loading" :full-page="false" />
      <div class="table-container">
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Stop name</th>
              <th v-if="showOnestopId">
                Onestop ID
              </th>
              <th>ID in source feed</th>
              <th v-if="showAgencies">
                Agencies
              </th>
              <th v-if="showRoutes">
                Served by routes
              </th>
              <th v-if="showLinks" class="has-text-right">
                Links to view
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stop of stops" :key="stop.id">
              <td>
                <slot name="stopName" :stop="stop">
                  {{ stop.stop_name }}
                </slot>
              </td>
              <td v-if="showOnestopId">
                <tl-safelink :text="stop.onestop_id" max-width="100px" />
              </td>
              <td><tl-safelink :text="stop.stop_id" max-width="100px" /></td>
              <td v-if="showAgencies">
                {{ $filters.joinUnique(stop.route_stops.map((s) => { return s.agency.agency_name })) }}
              </td>
              <td v-if="showRoutes">
                {{ servedByRoutes(stop) }}
              </td>
              <td v-if="showLinks" class="has-text-right">
                <nuxt-link
                  :to="$filters.makeStopLink(stop.onestop_id, stop.feed_onestop_id, stop.feed_version_sha1, stop.stop_id, stop.id, linkVersion)"
                  class="button is-primary is-small"
                >
                  Stop
                </nuxt-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <tl-show-more v-if="stops.length === limit || hasMore" :limit="stops.length" @click="showAll" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { joinUnique } from '../lib/filters'

// TypeScript interfaces
interface Route {
  id: number
  route_id: string
  route_short_name?: string
  route_long_name?: string
}

interface RouteStop {
  route: Route
  agency: Agency
}

interface Agency {
  agency_name: string
}

interface Stop {
  id: number
  feed_onestop_id?: string
  feed_version_sha1?: string
  onestop_id?: string
  stop_id: string
  stop_name: string
  stop_code?: string
  stop_desc?: string
  stop_url?: string
  location_type?: number
  wheelchair_boarding?: number
  children?: Stop[]
  route_stops: RouteStop[]
}

interface FeedVersion {
  stops: Stop[]
}

interface QueryData {
  feed_versions: FeedVersion[]
}

interface QueryVariables {
  feed_version_sha1?: string | null
  feed_version_ids?: number[]
  servicedOnly?: boolean | null
  agency_ids?: number[]
  limit?: number
  search?: string
  location_type?: number | null
  route_type?: number | null
}

// Props
interface Props {
  showRoutes?: boolean
  showAgencies?: boolean
  feedVersionSha1?: string | null
  feedVersionIds?: number[]
  agencyIds?: number[]
  locationType?: number | null
  linkVersion?: boolean
  servicedOnly?: boolean
  showOnestopId?: boolean
  showLinks?: boolean
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  showRoutes: true,
  showAgencies: false,
  feedVersionSha1: null,
  feedVersionIds: () => [],
  agencyIds: () => [],
  locationType: null,
  linkVersion: false,
  servicedOnly: false,
  showOnestopId: false,
  showLinks: true,
  limit: 100
})

// GraphQL Query
const STOPS_QUERY = gql`
  query ($feed_version_sha1: String, $feed_version_ids: [Int!], $servicedOnly: Boolean, $agency_ids: [Int!], $limit: Int=100, $search: String, $location_type:Int, $route_type:Int) {
    feed_versions(ids: $feed_version_ids, where: { sha1: $feed_version_sha1 }) {
        stops(limit: $limit, where: {serviced: $servicedOnly, agency_ids: $agency_ids, feed_version_sha1: $feed_version_sha1, search: $search, location_type:$location_type, served_by_route_type:$route_type}) {
        id
        feed_onestop_id
        feed_version_sha1
        onestop_id
        stop_id
        stop_name
        stop_code
        stop_desc
        stop_url
        location_type
        wheelchair_boarding
        children {
          id
          stop_id
          route_stops {
          route {
            id
            route_id
            route_short_name
            route_long_name
          }
        }
        }
        route_stops {
          route {
            id
            route_id
            route_short_name
            route_long_name
          }
        }
      }
    }
  }
`

// Reactive data
const search = ref<string>('')
const selectedRouteType = ref<number | null>(null)
const error = ref<Error | null>(null)
const hasMore = ref<boolean>(false)

// Computed query variables
const queryVariables = computed<QueryVariables>(() => ({
  search: search.value,
  limit: 1000,
  location_type: props.locationType,
  feed_version_sha1: props.feedVersionSha1,
  feed_version_ids: props.feedVersionIds?.length ? props.feedVersionIds : [],
  agency_ids: props.agencyIds,
  route_type: selectedRouteType.value,
  servicedOnly: props.servicedOnly ? true : null
}))

// Apollo Query
const { result, loading, onError } = useQuery<QueryData>(
  STOPS_QUERY,
  queryVariables,
  {
    clientId: 'transitland'
  }
)

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

const showAll = () => {
  // TODO: Implement pagination logic when needed
  // This was part of the TableViewerMixin functionality
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

// Filter functions for template
const makeStopLink = (onestopId?: string, feedOnestopId?: string, feedVersionSha1?: string, stopId?: string, id?: number, linkVersion?: boolean): string => {
  // Simple implementation - in a real app this would construct the proper route
  if (onestopId) {
    return `/stops/${onestopId}`
  } else if (feedVersionSha1 && stopId) {
    return `/stops/${feedVersionSha1}/${stopId}`
  } else if (id) {
    return `/stops/${id}`
  }
  return '/stops'
}

const $filters = {
  joinUnique: (items: string[]) => joinUnique(items),
  makeStopLink
}
</script>
