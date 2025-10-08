<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <o-field expanded grouped>
        <tl-search-bar v-model="search" placeholder="Filter routes by name..." />
        <tl-route-type-select v-model="selectedRouteType" />
      </o-field>
      <o-loading v-model:active="loading" :full-page="false" />
      <div class="table-container">
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th colspan="2">
                Route name
              </th>
              <th>Onestop ID</th>
              <th>ID in source feed</th>
              <th>Vehicle type</th>
              <th v-if="showAgency">
                Agency
              </th>
              <th>Links to view</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="route of entities" :key="route.id">
              <td>
                {{ route.route_short_name }}
              </td>
              <td>{{ route.route_long_name }}</td>
              <td>
                <tl-safelink :text="route.onestop_id" />
              </td>
              <td>
                <tl-safelink :text="route.route_id" />
              </td>
              <td>
                <tl-route-icon
                  :key="'icon'+route.onestop_id"
                  :route-type="route.route_type"
                />
              </td>
              <td v-if="showAgency">
                {{ route.agency.agency_name }}
              </td>
              <td class="has-text-right">
                <nuxt-link
                  class="button is-small is-primary"
                  :to="$filters.makeRouteLink(route.onestop_id, route.feed_onestop_id, route.feed_version_sha1, route.route_id, route.id, linkVersion)"
                >
                  Route
                </nuxt-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <tl-show-more v-if="entities.length === limit || hasMore" :limit="entities.length" @click="showAll" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'

// TypeScript interfaces
interface Agency {
  id: number
  agency_id: string
  agency_name: string
}

interface Route {
  id: number
  onestop_id?: string
  feed_version_sha1?: string
  feed_onestop_id?: string
  route_id: string
  route_short_name?: string
  route_long_name?: string
  route_type: number
  route_url?: string
  agency: Agency
}

interface QueryData {
  entities: Route[]
}

interface QueryVariables {
  after?: number
  limit?: number
  feed_version_sha1?: string | null
  agency_ids?: number[] | null
  search?: string
  route_type?: number | null
}

interface HeadwayData {
  dow_category: number
  [key: string]: any
}

// Props
interface Props {
  feedVersionSha1?: string | null
  fvids?: number[] | null
  routeIds?: number[] | null
  agencyIds?: number[] | null
  showAgency?: boolean
  showGeometry?: boolean
  linkVersion?: boolean
  limit?: number
}

const props = withDefaults(defineProps<Props>(), {
  feedVersionSha1: null,
  fvids: null,
  routeIds: null,
  agencyIds: null,
  showAgency: true,
  showGeometry: true,
  linkVersion: false,
  limit: 100
})

// GraphQL Query
const ROUTES_QUERY = gql`
  query($after: Int, $limit: Int=100, $feed_version_sha1: String, $agency_ids: [Int!], $search: String, $route_type: Int) {
    entities: routes(after: $after, limit: $limit, where: { serviced: true, search: $search, feed_version_sha1: $feed_version_sha1, agency_ids: $agency_ids, route_type:$route_type }) {
      id
      onestop_id
      feed_version_sha1
      feed_onestop_id
      route_id
      route_short_name
      route_long_name
      route_type
      route_url
      agency {
        id
        agency_id
        agency_name
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
  limit: props.limit,
  search: search.value,
  feed_version_sha1: props.feedVersionSha1,
  agency_ids: props.agencyIds,
  route_type: selectedRouteType.value
}))

// Apollo Query
const { result, loading, onError } = useQuery<QueryData>(
  ROUTES_QUERY,
  queryVariables,
  {
    clientId: 'transitland'
  }
)

// Handle errors
onError((err) => {
  error.value = err
})

// Computed properties
const entities = computed<Route[]>(() => result.value?.entities || [])

// Utility functions
const makeRouteLink = (onestopId?: string, feedOnestopId?: string, feedVersionSha1?: string, routeId?: string, id?: number, linkVersion?: boolean): string => {
  // Simple implementation - in a real app this would construct the proper route
  if (onestopId) {
    return `/routes/${onestopId}`
  } else if (feedVersionSha1 && routeId) {
    return `/routes/${feedVersionSha1}/${routeId}`
  } else if (id) {
    return `/routes/${id}`
  }
  return '/routes'
}

const headwayTooltip = (hws: HeadwayData[]): string => {
  // Buefy 0.9 will have a tooltip slot and we can use HeadwaysViewer
  const hwlookup: Record<number, string> = {
    1: 'weekday',
    6: 'saturday',
    7: 'sunday'
  }
  const ret = { weekday: {}, saturday: {}, sunday: {} }
  for (const hw of (hws || [])) {
    ret[hwlookup[hw.dow_category] as keyof typeof ret] = hw
  }
  return 'ok'
}

const showAll = () => {
  // TODO: Implement pagination logic when needed
  // This was part of the TableViewerMixin functionality
}

// Filter functions for template
const $filters = {
  makeRouteLink
}
</script>
