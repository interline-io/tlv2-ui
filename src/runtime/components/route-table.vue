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
      <o-loading v-model:active="$apollo.loading" :full-page="false" />
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

<script>
import { gql } from 'graphql-tag'
import TableViewerMixin from './table-viewer-mixin'

const q = gql`
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

export default {
  mixins: [TableViewerMixin],
  props: {
    feedVersionSha1: { type: String, default: null },
    fvids: { type: Array, default: null },
    routeIds: { type: Array, default: null },
    agencyIds: { type: Array, default: null },
    showAgency: { type: Boolean, default: true },
    showGeometry: { type: Boolean, default: true },
    linkVersion: { type: Boolean, default: false }
  },
  data () {
    return {
      selectedRouteType: null
    }
  },
  apollo: {
    entities: {
      client: 'transitland',
      query: q,
      variables () {
        return {
          limit: this.limit,
          search: this.search,
          feed_version_sha1: this.feedVersionSha1,
          agency_ids: this.agencyIds,
          route_type: this.selectedRouteType
        }
      },
      error (e) { this.error = e }
    }
  },
  methods: {
    headwayTooltip (hws) {
      // Buefy 0.9 will have a tooltip slot and we can use HeadwaysViewer
      const hwlookup = {
        1: 'weekday',
        6: 'saturday',
        7: 'sunday'
      }
      const ret = { weekday: {}, saturday: {}, sunday: {} }
      for (const hw of (hws || [])) {
        ret[hwlookup[hw.dow_category]] = hw
      }
      return 'ok'
    }
  }
}
</script>
