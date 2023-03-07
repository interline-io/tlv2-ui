<template>
  <div>
    <tl-msg-error v-if="error">{{ error }}</tl-msg-error>
    <div v-else>
      <tl-search-bar
        v-model="search"
        placeholder="Filter Routes"
      />
      <o-table
        :loading="$apollo.loading"
        :data="entityPage"
        :striped="true"
      >
        <o-table-column
          v-slot="props"
          field="route_id"
          label="Route ID"
          :width="140"
        >
          <nuxt-link
            :to="{ name: 'routes-onestop_id', params: { onestop_id: props.row.onestop_id || 'search' }, query: (linkVersion ? { feed_onestop_id: props.row.feed_onestop_id, feed_version_sha1: props.row.feed_version_sha1, entity_id: props.row.route_id } : {}) }"
          >
            {{ props.row.route_id }}
          </nuxt-link>
        </o-table-column>

        <o-table-column
          v-slot="props"
          field="route_short_name"
          label="Name"
          :width="140"
        >
          {{ props.row.route_short_name }}
        </o-table-column>
        <o-table-column
          v-slot="props"
          field="route_long_name"
          label=""
          :width="500"
        >
          {{ props.row.route_long_name }}
        </o-table-column>

        <o-table-column
          v-if="showAgency"
          v-slot="props"
          field="agency"
          label="Agency"
        >
          {{ props.row.agency.agency_name }}
        </o-table-column>
      </o-table>
      <tl-show-more
        v-if="entities.length === limit || hasMore"
        :limit="entities.length"
        @click="showAll"
      />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import TableViewerMixin from './table-viewer-mixin'

const q = gql`
query($after: Int, $limit: Int, $feed_version_sha1: String, $agency_ids: [Int!], $search: String) {
  entities: routes(after: $after, limit: $limit, where: { search: $search, feed_version_sha1: $feed_version_sha1, agency_ids: $agency_ids }) {
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
      variables() {
        return {
          limit: this.limit,
          search: this.search,
          feed_version_sha1: this.feedVersionSha1,
          agency_ids: this.agencyIds
        }
      },
      error(e) { this.error = e }
    }
  },
  methods: {
    headwayTooltip(hws) {
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
