<template>
  <div>
    <slot name="nav" />

    <slot name="title">
      <h1 class="title">
        Feeds
      </h1>
    </slot>

    <slot name="description" />

    <div>
      <b-message v-if="error" variant="danger">
        {{ error }}
      </b-message>

      <b-field grouped group-multiline>
        <b-field label="Search by feed name">
          <div>
            <tl-search-bar v-model="search" />
          </div>
        </b-field>

        <b-field label="Filter by fetch status">
          <b-select v-model="fetchError">
            <option value="">
              All
            </option>
            <option value="false">
              No fetch error
            </option>
            <option value="true">
              Has fetch error
            </option>
          </b-select>
        </b-field>

        <b-field label="Filter by import status">
          <b-select v-model="importStatus">
            <option value="">
              All
            </option>
            <option value="SUCCESS">
              Success
            </option>
            <option value="ERROR">
              Error
            </option>
            <option value="IN_PROGRESS">
              In progress
            </option>
          </b-select>
        </b-field>

        <b-field label="Filter by tag">
          <div class="pt-2">
            <b-checkbox v-model="tagUnstableUrl" native-value="true" size="medium">
              Unstable URL
            </b-checkbox>
          </div>
        </b-field>

        <b-field label="Filter by data format" class="pl-3">
          <div class="pt-2">
            <b-checkbox v-model="feedSpecs" native-value="GTFS" size="medium">
              <abbr title="General Transit Feed Specification">GTFS</abbr>
            </b-checkbox>
            <b-checkbox v-model="feedSpecs" native-value="GTFS_RT" size="medium">
              <abbr title="GTFS Realtime">GTFS-RT</abbr>
            </b-checkbox>
            <b-checkbox v-model="feedSpecs" native-value="GBFS" size="medium">
              <abbr title="General Bikeshare Feed Specification">GBFS</abbr>
            </b-checkbox>
            <b-checkbox v-model="feedSpecs" native-value="MDS" size="medium">
              <abbr title="Mobility Data Specification">MDS</abbr>
            </b-checkbox>
          </div>
        </b-field>
      </b-field>

      <o-table
        :loading="$apollo.loading"
        :data="feedPage"
        :striped="true"
      >
        <o-table-column v-slot="props" field="onestop_id" label="Feed Onestop ID">
          <nuxt-link :to="{name: 'feeds-feed', params: {feed: props.row.onestop_id}}">
            {{ props.row.onestop_id }}
          </nuxt-link>
        </o-table-column>

        <o-table-column v-slot="props" field="spec" label="Format">
          {{ props.row.spec.toUpperCase() }}
        </o-table-column>

        <o-table-column v-slot="props" field="last_successful_fetch" label="Last Fetched">
          <template v-if="props.row.last_successful_fetch && props.row.last_successful_fetch.fetched_at ">
            {{ $filters.fromNow(props.row.last_successful_fetch.fetched_at)  }}
          </template>
          <template v-else>
            Unknown
          </template>
        </o-table-column>

        <o-table-column v-slot="props" field="last_successful_import_at" label="Last Imported">
          <span v-if="props.row.spec === 'GTFS'">
            <template v-if="props.row.last_import">
              {{ $filters.fromNow(props.row.last_import.fetched_at) }}
            </template>
            <template v-else>
              Never
            </template>
          </span>
        </o-table-column>

        <o-table-column v-slot="props" field="last_fetch" label="Fetch Errors">
          <b-tooltip v-if="props.row.last_fetch && props.row.last_fetch.fetch_error" :label="props.row.last_fetch.fetch_error" multilined>
            <b-icon icon="alert" />
          </b-tooltip>
        </o-table-column>

        <o-table-column v-slot="props" :visible="tagUnstableUrl" field="tags" label="Tags">
          <pre class="tags">{{ props.row.tags }}</pre>
        </o-table-column>
      </o-table>
      <tl-show-more v-if="entities.length === limit || hasMore" :limit="entities.length" @click="showAll" />
    </div>

    <slot name="add-feed" />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import TableViewerMixin from '../table-viewer-mixin'

const q = gql`
query($specs: [FeedSpecTypes!], $after: Int, $limit:Int, $search: String, $fetch_error: Boolean, $import_status: ImportStatus, $tags: Tags) {
  entities: feeds(after: $after, limit:$limit, where: {search: $search, spec: $specs, fetch_error: $fetch_error, import_status: $import_status, tags: $tags}) {
    id
    onestop_id
    spec
    tags
    last_fetch: feed_fetches(limit:1) {
      fetch_error
      fetched_at
    }
    last_successful_fetch: feed_fetches(limit:1, where:{success:true}) {
      fetch_error
      fetched_at
    }
    last_successful_import: feed_versions(limit:1, where:{import_status:SUCCESS}) {
      id
      fetched_at
      feed_version_gtfs_import {
        id
        created_at
      }
    }
    feed_state {
      id
      feed_version {
        id
        fetched_at
        sha1
        feed_version_gtfs_import {
          id
          created_at
        }
      }
    }
  }
}
`

const nullBool = function (v) {
  if (v === 'true') {
    return true
  } else if (v === 'false') {
    return false
  }
  return null
}

const nullString = function (v) {
  if (!v || v.length === 0) {
    return null
  }
  return v
}

function first (v) {
  if (v && v.length > 0) {
    return v[0]
  }
  return null
}

export default {
  mixins: [TableViewerMixin],
  apollo: {
    entities: {
      client: 'transitland',
      query: q,
      variables () {
        return {
          search: this.search,
          limit: this.limit,
          specs: this.feedSpecs,
          fetch_error: nullBool(this.fetchError),
          import_status: nullString(this.importStatus),
          tags: this.tagVariable
        }
      },
      error (e) { this.error = e }
    }
  },
  data () {
    let spec = this.$route.query.feed_specs
    if (Array.isArray(spec)) {
      // ok
    } else if (spec) {
      spec = [spec]
    } else {
      spec = ['GTFS', 'GTFS_RT', 'GBFS', 'MDS']
    }
    return {
      feedSpecs: spec,
      fetchError: this.$route.query.fetch_error,
      importStatus: this.$route.query.import_status,
      tagUnstableUrl: this.$route.query.tag_unstable_url || false
    }
  },
  head () {
    return {
      title: 'Source Feeds: GTFS, GTFS Realtime, GBFS',
      meta: [
        { hid: 'description', name: 'description', content: 'GTFS, GTFS Realtime, and GBFS source feeds cataloged by the Transitland platform.' }
      ]
    }
  },
  computed: {
    feedPage () {
      return this.entityPage.map((feed) => {
        const lastImport = first(feed.last_successful_import)
        return {
          onestop_id: feed.onestop_id,
          spec: feed.spec,
          last_fetch: first(feed.last_fetch),
          last_successful_fetch:
            first(feed.last_successful_fetch),
          tags: feed.tags,
          last_import: lastImport || null
        }
      })
    },
    tagVariable () {
      if (this.tagUnstableUrl) {
        return {
          unstable_url: 'true'
        }
      } else {
        return {}
      }
    }
  },
  watch: {
    fetchError (v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, fetch_error: v } })
    },
    importStatus (v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, import_status: v } })
    },
    feedSpecs (v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, feed_specs: v } })
    },
    tagUnstableUrl (v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, tag_unstable_url: v ? true : null } })
    }
  }
}
</script>

<style scoped>
pre.tags {
  padding: 1px;
  font-size: 0.8em;
}
</style>
