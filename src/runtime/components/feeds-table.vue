<template>
  <div>
    <o-field grouped label="Filter">
      <tl-search-bar v-model="search" placeholder="Filter by feed Onestop ID or feed name..." />

      <o-dropdown position="bottom-left" append-to-body aria-role="menu" trap-focus menu-class="tl-feeds-table">
        <template #trigger="{ active }">
          <o-button label="Filter options" variant="primary" :icon-left="active ? 'menu-up' : 'menu-down'" />
        </template>

        <div aria-role="menu-item" class="p-4">
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

          <o-field label="API Import status">
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
                GTFS Realtime
              </o-checkbox>
              <o-checkbox v-model="feedSpecs" native-value="GBFS" size="medium">
                <abbr title="General Bikeshare Feed Specification">GBFS</abbr>
              </o-checkbox>
            </div>
          </o-field>
        </div>
      </o-dropdown>
    </o-field>

    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <table class="table is-striped is-fullwidth">
      <thead>
        <tr>
          <th v-if="showColumns.includes('onestop_id')">
            Onestop ID
          </th>
          <th v-if="showColumns.includes('spec')">
            Format
          </th>
          <th v-if="showColumns.includes('last_fetched')" class="has-text-right">
            Last Fetched
          </th>
          <th v-if="importStatus || showColumns.includes('last_imported')" class="has-text-right">
            Last Imported
          </th>
          <th v-if="fetchError === 'true' || showColumns.includes('fetch_errors')" class="has-text-right">
            Fetch Errors
          </th>
          <th v-if="tagUnstableUrl || showColumns.includes('tags')" class="has-text-right">
            Tags
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row of entities" :key="row.id">
          <td v-if="showColumns.includes('onestop_id')">
            <nuxt-link :to="{ name: 'feeds-feedKey', params: { feedKey: row.onestop_id } }">
              {{ row.onestop_id }}
            </nuxt-link>
          </td>
          <td>
            {{ displaySpec(row.spec) }}
          </td>
          <td v-if="showColumns.includes('last_fetched')" class="has-text-right">
            <template v-if="row.last_successful_fetch && row.last_successful_fetch.length > 0">
              {{ $filters.fromNow(row.last_successful_fetch[0].fetched_at) }}
            </template>
            <template v-else>
              Unknown
            </template>
          </td>
          <td v-if="importStatus || showColumns.includes('last_imported')" class="has-text-right">
            <span v-if="row.spec === 'GTFS'">
              <template v-if="row.last_successful_import && row.last_successful_import.length > 0">
                {{ $filters.fromNow(row.last_successful_import[0].fetched_at) }}
              </template>
              <template v-else>
                -
              </template>
            </span>
          </td>
          <td v-if="fetchError === 'true' || showColumns.includes('fetch_errors')" class="has-text-right">
            <span
              v-if="row.last_fetch && row.last_fetch.length > 0 && row.last_fetch[0].fetch_error"
              class="tag is-danger is-light"
              :title="row.last_fetch[0].fetch_error"
            >
              {{ row.last_fetch[0].fetch_error.split('\n')[0] }}
            </span>
          </td>
          <td v-if="tagUnstableUrl || showColumns.includes('tags')" class="has-text-right">
            <div class="tags is-right">
              <span v-for="(value, key) in row.tags" :key="key" class="tag is-info is-light">
                <strong class="mr-1">{{ key.replace(/_/g, ' ') }}:</strong>
                {{ value }}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div>
      <a class="button is-primary is-small is-fullwidth" @click="fetchMoreFn">
        Show more feeds
      </a>
    </div>
    <o-loading v-model:active="loading" :full-page="false" />
  </div>
</template>

<script setup>
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { computed } from 'vue'

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

const search = defineModel('search')
const fetchError = defineModel('fetchError')
const importStatus = defineModel('importStatus')
const tagUnstableUrl = defineModel('tagUnstableUrl')
const feedSpecs = defineModel('feedSpecs')

const props = defineProps({
  limit: { type: Number, default: 100 },
  showColumns: {
    type: Array,
    default: () => ['onestop_id', 'spec', 'last_fetched']
    // by default excludes fetch_errors, last_imported and tags
  }
})

const { result, loading, error, fetchMore } = useQuery(
  query,
  () => ({
    search: nullString(search.value),
    limit: props.limit,
    specs: feedSpecs.value.length === 4 ? null : feedSpecs.value,
    fetch_error: nullBool(fetchError.value),
    import_status: nullString(importStatus.value),
    tags: tagUnstableUrl.value ? { unstable_url: 'true' } : null
  }))

const entities = computed(() => result.value?.entities ?? [])

function fetchMoreFn () {
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

function displaySpec (spec) {
  spec = spec.toUpperCase()
  if (spec === 'GTFS') {
    return 'GTFS'
  } else if (spec === 'GTFS_RT') {
    return 'GTFS Realtime'
  } else if (spec === 'GBFS') {
    return 'GBFS'
  }
}

</script>

<style scoped>
  /* fetch errors are multiline */
  .tag {
    white-space: break-spaces !important;
    height: auto !important;
  }
</style>
