<template>
  <div>
    <o-field grouped label="Search by feed name">
      <tl-search-bar v-model="search" placeholder="Search" />

      <o-dropdown position="bottom-left" append-to-body aria-role="menu" trap-focus menu-class="tl-feeds-table">
        <template #trigger="{ active }">
          <o-button label="Options" variant="primary" :icon-left="active ? 'menu-up' : 'menu-down'" />
        </template>

        <div aria-role="menu-item" style="padding:20px">
          <o-field label="Fetch status">
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

          <o-field label="Import status">
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

          <o-field label="Tags">
            <div class="pt-2">
              <o-checkbox v-model="tagUnstableUrl" native-value="true" size="medium">
                Unstable URL
              </o-checkbox>
            </div>
          </o-field>

          <o-field label="Data format">
            <div class="pt-2">
              <o-checkbox v-model="feedSpecs" native-value="GTFS" size="medium">
                <abbr title="General Transit Feed Specification">GTFS</abbr>
              </o-checkbox>
              <o-checkbox v-model="feedSpecs" native-value="GTFS_RT" size="medium">
                <abbr title="GTFS Realtime">RT</abbr>
              </o-checkbox>
              <o-checkbox v-model="feedSpecs" native-value="GBFS" size="medium">
                <abbr title="General Bikeshare Feed Specification">GBFS</abbr>
              </o-checkbox>
              <o-checkbox v-model="feedSpecs" native-value="MDS" size="medium">
                <abbr title="Mobility Data Specification">MDS</abbr>
              </o-checkbox>
            </div>
          </o-field>
        </div>
      </o-dropdown>
    </o-field>

    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div class="table-container">
      <table class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>Onestop ID</th>
            <th>Format</th>
            <th>Last Fetched</th>
            <th>Last Imported</th>
            <th>Fetch Errors</th>
            <th v-if="tagUnstableUrl">
              Tags
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row of entities" :key="row.id">
            <td>
              <nuxt-link :to="{ name: 'feeds-feedKey', params: { feedKey: row.onestop_id } }">
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
              <o-tooltip
                v-if="row.last_fetch && row.last_fetch.length > 0 && row.last_fetch[0].fetch_error"
                :label="row.last_fetch[0].fetch_error"
                multilined
              >
                <o-icon icon="alert" />
              </o-tooltip>
            </td>
            <td v-if="tagUnstableUrl">
              <pre class="tags">{{ row.tags }}</pre>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="text-align:center">
      <a class="button is-primary is-small is-fullwidth" @click="fetchMoreFn">
        Show more feeds
      </a>
    </div>
    <o-loading v-model:active="loading" :full-page="false" />
  </div>
</template>

<script setup>
import gql from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { ref, watch, computed } from 'vue'

const query = gql`
query($specs: [FeedSpecTypes!], $after: Int, $limit:Int=100, $search: String, $fetch_error: Boolean, $import_status: ImportStatus, $tags: Tags) {
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

const props = defineProps({
  search: String,
  limit: { type: Number, default: 100 },
  fetchError: String,
  importStatus: String,
  tagUnstableUrl: String,
  feedSpecs: { type: Array, default() { return ['GTFS', 'GTFS_RT', 'GBFS', 'MDS'] } }
})

// shadow props
const search = ref(props.search)
const limit = ref(props.limit)
const fetchError = ref(props.fetchError)
const feedSpecs = ref(props.feedSpecs)
const importStatus = ref(props.importStatus)
const tagUnstableUrl = ref(nullBool(props.tagUnstableUrl))

const emit = defineEmits([
  'update:search',
  'update:fetchError',
  'update:feedSpecs',
  'update:importStatus',
  'update:tagUnstableUrl'
])

watch(search, (v) => { emit('update:search', v) })
watch(fetchError, (v) => { emit('update:fetchError', v) })
watch(feedSpecs, (v) => { emit('update:feedSpecs', v) })
watch(importStatus, (v) => { emit('update:importStatus', v) })
watch(tagUnstableUrl, (v) => { emit('update:tagUnstableUrl', v) })

const { result, loading, error, fetchMore } = useQuery(
  query,
  () => ({
    search: nullString(search.value),
    limit: limit.value,
    specs: feedSpecs.value.length === 4 ? null : feedSpecs.value,
    fetch_error: nullBool(fetchError.value),
    import_status: nullString(importStatus.value),
    tags: tagUnstableUrl.value ? { unstable_url: 'true' } : null
  }))

const entities = computed(() => result.value?.entities ?? [])

function fetchMoreFn() {
  const lastId = entities.value.length > 0 ? entities.value[entities.value.length - 1].id : 0
  fetchMore({
    variables: {
      after: lastId,
      limit: 100
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      if (!fetchMoreResult) { return previousResult }
      return {
        ...previousResult,
        entities: [
          ...previousResult.entities,
          ...fetchMoreResult.entities
        ]
      }
    }
  })
}

</script>

<style>
.tl-feeds-table {
  min-width:300px !important;
}
</style>
