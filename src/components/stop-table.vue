<template>
  <div>
    <tl-msg-error v-if="error">{{ error }}</tl-msg-error>
    <div v-else>
      <tl-search-bar v-model="search" placeholder="Filter Stops" />
      <o-loading v-model:active="$apollo.loading" :full-page="false" />
      <table class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>Stop ID</th>
            <th>Name</th>
            <th v-if="showAgencies">Agencies</th>
            <th v-if="showRoutes">Routes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stop of entityPage" :key="stop.id">
            <td>
              <nuxt-link
                :to="{ name: 'stops-onestop_id', params: { onestop_id: stop.onestop_id }, query: (linkVersion ? { feed_onestop_id: stop.feed_onestop_id, feed_version_sha1: stop.feed_version_sha1, entity_id: stop.stop_id } : {}) }">
                {{ stop.stop_id }}
              </nuxt-link>
            </td>
            <td>{{ stop.stop_name }}</td>
            <td v-if="showAgencies">
              {{ $filters.joinUnique(props.row.route_stops.map((s) => { return s.agency.agency_name })) }}
            </td>
            <td v-if="showRoutes">
              {{ $filters.joinUnique(stop.route_stops.map((s) => { return s.route.route_short_name })) }}
            </td>
          </tr>
        </tbody>
      </table>
      <tl-show-more v-if="entities.length === limit || hasMore" :limit="entities.length" @click="showAll" />
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import TableViewerMixin from './table-viewer-mixin'

const q = gql`
query ($feed_version_sha1: String, $agency_ids: [Int!], $limit: Int, $after: Int, $search: String) {
  entities: stops(after: $after, limit: $limit, where: {serviced: true, agency_ids: $agency_ids, feed_version_sha1: $feed_version_sha1, search: $search}) {
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
`

export default {
  mixins: [TableViewerMixin],
  props: {
    showRoutes: { type: Boolean, default: true },
    showAgencies: { type: Boolean, default: false },
    feedVersionSha1: { type: String, default: null },
    agencyIds: { type: Array, default () { return [] } },
    linkVersion: { type: Boolean, default: false }
  },
  data () {
    return {
      sortField: 'stop_id',
      sortOrder: 'asc'
    }
  },
  apollo: {
    entities: {
      client: 'transitland',
      query: q,
      variables () {
        return {
          search: this.search,
          limit: this.limit,
          feed_version_sha1: this.feedVersionSha1,
          agency_ids: this.agencyIds
        }
      },
      error (e) { this.error = e }
    }
  }
}
</script>
