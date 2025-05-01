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
      <o-loading v-model:active="$apollo.loading" :full-page="false" />
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
                {{ $filters.joinUnique(props.row.route_stops.map((s) => { return s.agency.agency_name })) }}
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

<script>
import { gql } from 'graphql-tag'
import TableViewerMixin from './table-viewer-mixin'

const q = gql`
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

function routeName (route) {
  if (route.route_short_name && route.route_long_name) {
    return `${route.route_short_name} (${route.route_long_name})`
  } else if (route.route_short_name) {
    return route.route_short_name
  } else if (route.route_long_name) {
    return route.route_long_name
  }
}

export default {
  mixins: [TableViewerMixin],
  props: {
    showRoutes: { type: Boolean, default: true },
    showAgencies: { type: Boolean, default: false },
    feedVersionSha1: { type: String, default: null },
    feedVersionIds: { type: Array, default () { return [] } },
    agencyIds: { type: Array, default () { return [] } },
    locationType: { type: Number, default: null },
    linkVersion: { type: Boolean, default: false },
    servicedOnly: { type: Boolean, default: false },
    showOnestopId: { type: Boolean, default: false },
    showLinks: { type: Boolean, default: true },
  },
  data () {
    return {
      sortField: 'stop_id',
      sortOrder: 'asc',
      selectedRouteType: null,
      feed_versions: []
    }
  },
  computed: {
    stops () {
      const ret = []
      for (const feedVersion of this.feed_versions) {
        for (const stop of feedVersion.stops) {
          ret.push(stop)
        }
      }
      return ret
    }
  },
  methods: {
    servedByRoutes (stop) {
      const routeNames = new Set()
      console.log('stop:', stop)
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
  },
  apollo: {
    feed_versions: {
      client: 'transitland',
      query: q,
      variables () {
        return {
          search: this.search,
          limit: this.limit,
          location_type: this.locationType,
          feed_version_sha1: this.feedVersionSha1,
          feed_version_ids: this.feedVersionIds ? this.feedVersionIds : [],
          agency_ids: this.agencyIds,
          route_type: this.selectedRouteType,
          servicedOnly: this.servicedOnly ? true : null
        }
      },
      error (e) { this.error = e }
    }
  }
}
</script>
