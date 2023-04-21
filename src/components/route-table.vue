<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <tl-search-bar v-model="search" placeholder="Filter Routes" />
      <o-loading v-model:active="$apollo.loading" :full-page="false" />
      <div class="table-container">
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Route ID</th>
              <th>Name</th>
              <th />
              <th v-if="showAgency">
                Agency
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="route of entityPage" :key="route.id">
              <td>
                <nuxt-link
                  :to="{ name: 'routes-onestop_id', params: { onestop_id: route.onestop_id || 'search' }, query: (linkVersion ? { feed_onestop_id: route.feed_onestop_id, feed_version_sha1: route.feed_version_sha1, entity_id: route.route_id } : {}) }"
                >
                  {{ route.route_id }}
                </nuxt-link>
              </td>
              <td>
                {{ route.route_short_name }}
              </td>
              <td>{{ route.route_long_name }}</td>
              <td v-if="showAgency">
                {{ route.agency.agency_name }}
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
import gql from 'graphql-tag'
import TableViewerMixin from './table-viewer-mixin'

const q = gql`
query($after: Int, $limit: Int, $feed_version_sha1: String, $agency_ids: [Int!], $search: String) {
  entities: routes(after: $after, limit: $limit, where: { serviced: true, search: $search, feed_version_sha1: $feed_version_sha1, agency_ids: $agency_ids }) {
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
  apollo: {
    entities: {
      client: 'transitland',
      query: q,
      variables () {
        return {
          limit: this.limit,
          search: this.search,
          feed_version_sha1: this.feedVersionSha1,
          agency_ids: this.agencyIds
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
