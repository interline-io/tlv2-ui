<template>
  <div>
    <Title>{{ staticTitle }}</Title>
    <Meta name="description" :content="staticDescription" />
    <Meta name="twitter:title" :content="staticTitle" />
    <Meta name="twitter:description" :content="staticDescription" />
    <Meta name="og:title" :content="staticTitle" />
    <Meta name="og:description" :content="staticDescription" />

    <slot name="nav" />
    <slot name="title">
      <h1 class="title">
        Feeds
      </h1>
    </slot>

    <slot name="description" />

    <div>
      <o-field grouped group-multiline>
        <o-field label="Search by feed name">
          <div> 
            <tl-search-bar v-model="search" />
          </div>
        </o-field>

        <o-field label="Filter by fetch status">
          <o-select v-model="fetchError">
            <option value="">
              All
            </option>
            <option value="false">
              No fetch error
            </option>
            <option value="true">
              Has fetch error
            </option>
          </o-select>
        </o-field>

        <o-field label="Filter by import status">
          <o-select v-model="importStatus">
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
          </o-select>
        </o-field>

        <o-field label="Filter by tag">
          <div class="pt-2">
            <o-checkbox v-model="tagUnstableUrl" native-value="true" size="medium">
              Unstable URL
            </o-checkbox>
          </div>
        </o-field>

        <o-field label="Filter by data format" class="pl-3">
          <div class="pt-2">
            <o-checkbox v-model="feedSpecs" native-value="GTFS" size="medium">
              <abbr title="General Transit Feed Specification">GTFS</abbr>
            </o-checkbox>
            <o-checkbox v-model="feedSpecs" native-value="GTFS_RT" size="medium">
              <abbr title="GTFS Realtime">GTFS-RT</abbr>
            </o-checkbox>
            <o-checkbox v-model="feedSpecs" native-value="GBFS" size="medium">
              <abbr title="General Bikeshare Feed Specification">GBFS</abbr>
            </o-checkbox>
            <o-checkbox v-model="feedSpecs" native-value="MDS" size="medium">
              <abbr title="Mobility Data Specification">MDS</abbr>
            </o-checkbox>
          </div>
        </o-field>
      </o-field>

      <tl-msg-error v-if="error">{{ error }}</tl-msg-error>

      <table class="table is-striped" style="width:100%">
        <thead>
          <tr>
            <th>Feed Onestop ID</th>
            <th>Format</th>
            <th>Last Fetched</th>
            <th>Last Imported</th>
            <th>Fetch Errors</th>
            <th v-if="tagUnstableUrl">Tags</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row of entities">
            <td>
              <nuxt-link :to="{ name: 'feeds-feed', params: { feed: row.onestop_id } }">
                {{ row.onestop_id }}
              </nuxt-link>
            </td>
            <td>
              {{ row.spec.toUpperCase() }}
            </td>
            <td>
              <template v-if="row.last_successful_fetch && row.last_successful_fetch.length > 0">
                {{ $filters.fromNow(row.last_successful_fetch[0].fetched_at) }}
              </template>
              <template v-else>
                Unknown
              </template>
            </td>
            <td>
              <span v-if="row.spec === 'GTFS'">
                <template v-if="row.last_successful_import && row.last_successful_import.length > 0">
                  {{ $filters.fromNow(row.last_successful_import[0].fetched_at) }}
                </template>
                <template v-else>
                  Never
                </template>
              </span>
            </td>
            <td>
              <o-tooltip v-if="row.last_fetch && row.last_fetch.length > 0 && row.last_fetch[0].fetch_error"
                :label="row.last_fetch[0].fetch_error" multilined>
                <o-icon icon="alert" />
              </o-tooltip>
            </td>
            <td v-if="tagUnstableUrl">
              <pre class="tags">{{ row.tags }}</pre>
            </td>
          </tr>
        </tbody>
      </table>
      <tl-show-more v-if="entities.length === limit || hasMore" :limit="entities.length" @click="showAll" />
      <o-loading :full-page="false" v-model:active="$apollo.loading"></o-loading>
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

function first(v) {
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
      variables() {
        return {
          search: this.search,
          limit: this.limit,
          specs: this.feedSpecs,
          fetch_error: nullBool(this.fetchError),
          import_status: nullString(this.importStatus),
          tags: this.tagVariable
        }
      },
      error(e) { this.error = e }
    }
  },
  data() {
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
  computed: {
    feedPage() {
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
    tagVariable() {
      if (this.tagUnstableUrl) {
        return {
          unstable_url: 'true'
        }
      } else {
        return {}
      }
    },
    staticTitle() {
      return 'Feeds index'
    },
    staticDescription() {
      return 'An index of data sources indexed in Transitland'
    }
  },
  watch: {
    search(v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, search: v } })
    },
    fetchError(v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, fetch_error: v } })
    },
    importStatus(v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, import_status: v } })
    },
    feedSpecs(v) {
      this.$router.replace({ name: 'feeds', query: { ...this.$route.query, feed_specs: v } })
    },
    tagUnstableUrl(v) {
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
