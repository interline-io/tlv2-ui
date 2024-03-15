<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <tl-search-bar v-model="search" placeholder="Filter Agencies" />
      <o-loading v-model:active="$apollo.loading" :full-page="false" />
      <div class="table-container">
        <table class="table is-striped is-fullwidth">
          <thead>
            <tr>
              <th>Agency ID</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="agency of entities" :key="agency.id">
              <td>
                {{ agency.agency_id }}
              </td>
              <td>
                {{ agency.agency_name }}
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
query ($feed_version_sha1: String, $limit: Int=100, $after: Int, $search: String) {
  entities: agencies(after: $after, limit: $limit, where: {feed_version_sha1: $feed_version_sha1, search: $search}) {
    id
    agency_id
    agency_name
    agency_url
    feed_onestop_id
    feed_version_sha1
  }
}
`

export default {
  mixins: [TableViewerMixin],
  props: {
    fvid: { type: String, default () { return '' } }
  },
  data () {
    return {
      sortField: 'agency_id',
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
          feed_version_sha1: this.fvid,
          limit: this.limit
        }
      },
      error (e) { this.error = e }
    }
  }
}
</script>
