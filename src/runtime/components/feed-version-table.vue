<template>
  <div>
    <!-- Feed Version Timeline Chart -->
    <div v-if="showTimelineChart" class="mb-5">
      <tl-feed-version-timeline-chart-plot
        :feed="feed"
        :feed-versions="entities"
      />
    </div>

    <div class="table-container">
      <table class="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th v-if="showDescriptionColumn">
              Name
            </th>
            <th v-if="showDescriptionColumn">
              Description
            </th>
            <th>Added</th>
            <th>SHA1</th>
            <th v-if="showDateColumns">
              Earliest date
            </th>
            <th v-if="showDateColumns">
              Latest date
            </th>
            <th>Imported</th>
            <th v-if="showActiveColumn">
              Active
            </th>
            <th v-if="showDownloadColumn">
              Download
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fv of entities" :key="fv.id">
            <td v-if="showDescriptionColumn">
              {{ fv.name }}
            </td>
            <td v-if="showDescriptionColumn">
              {{ fv.description }}
            </td>
            <td>{{ $filters.formatDate(fv.fetched_at) }} ({{ $filters.fromNow(fv.fetched_at) }})</td>
            <td>
              <nuxt-link
                :to="{ name: 'feeds-feedKey-versions-feedVersionKey', params: { feedKey: feed.onestop_id, feedVersionKey: fv.sha1 } }"
              >
                {{ fv.sha1.substr(0, 6) }}…
              </nuxt-link>
            </td>
            <td v-if="showDateColumns">
              <template v-if="fv.service_window?.feed_start_date && fv.service_window?.feed_end_date">
                {{ $filters.formatDate(fv.service_window?.feed_start_date) }}
              </template>
              <template v-else>
                {{ $filters.formatDate(fv.earliest_calendar_date) }}
              </template>
            </td>
            <td v-if="showDateColumns">
              <template v-if="fv.service_window?.feed_start_date && fv.service_window?.feed_end_date">
                {{ $filters.formatDate(fv.service_window?.feed_end_date) }}
              </template>
              <template v-else>
                {{ $filters.formatDate(fv.latest_calendar_date) }}
              </template>
            </td>
            <td>
              <tl-feed-version-import-status
                :feed-version-gtfs-import="fv.feed_version_gtfs_import"
              />
            </td>
            <td v-if="showActiveColumn">
              <tl-feed-version-active-status
                :feed="feed"
                :feed-version-id="fv.id"
                :show-description="false"
              />
            </td>
            <td v-if="showDownloadColumn">
              <template v-if="feed.license.redistribution_allowed !== 'no'">
                <a @click="triggerDownload(fv.sha1)">
                  <o-icon
                    v-if="fv.sha1 === latestFeedVersionSha1"
                    icon="download"
                    title="Download feed version"
                    variant="success"
                  />
                  <o-icon v-else icon="download" title="Download feed version" />
                </a>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="hasMore" @click="fetchMoreFn">
      <a class="button is-primary is-small is-fullwidth">Show more feed versions</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { computed, withDefaults } from 'vue'
import { useApiEndpoint } from '../composables/useApiEndpoint'

// Type definitions
interface FeedVersionGtfsImport {
  id: number
  success?: boolean
  in_progress?: boolean
  exception_log?: string
  schedule_removed?: boolean
}

interface ServiceWindow {
  feed_start_date?: string
  feed_end_date?: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  fallback_week?: boolean
}

interface FeedInfo {
  feed_publisher_name?: string
  feed_publisher_url?: string
  feed_lang?: string
  default_lang?: string
  feed_version?: string
  feed_start_date?: string
  feed_end_date?: string
  feed_contact_email?: string
  feed_contact_url?: string
}

interface License {
  redistribution_allowed?: string
}

interface Feed {
  onestop_id: string
  license: License
}

interface FeedVersion {
  id: number
  sha1: string
  name?: string
  description?: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  fetched_at: string
  url?: string
  feed_version_gtfs_import?: FeedVersionGtfsImport
  service_window?: ServiceWindow
  feed_infos?: FeedInfo[]
}

interface QueryVariables {
  limit?: number
  onestop_id?: string
  after?: number
}

interface QueryResult {
  entities: FeedVersion[]
}

interface Props {
  feed: Feed
  showDownloadColumn?: boolean
  showDescriptionColumn?: boolean
  showDateColumns?: boolean
  showActiveColumn?: boolean
  showTimelineChart?: boolean
  issueDownloadRequest?: boolean
  limit?: number
}

interface Emits {
  downloadTriggered: [sha1: string, isLatest: boolean]
}

const props = withDefaults(defineProps<Props>(), {
  showDownloadColumn: true,
  showDescriptionColumn: true,
  showDateColumns: true,
  showActiveColumn: true,
  showTimelineChart: false,
  issueDownloadRequest: true,
  limit: 20
})

const emit = defineEmits<Emits>()

const fvQuery = gql`
query ($limit:Int=100, $onestop_id: String, $after:Int) {
  entities: feed_versions(limit:$limit, after:$after, where: {feed_onestop_id: $onestop_id}) {
    id
    sha1
    name
    description
    earliest_calendar_date
    latest_calendar_date
    fetched_at
    url
    feed_version_gtfs_import {
      id
      success
      in_progress
      exception_log
      schedule_removed
    }
    service_window {
      feed_start_date
      feed_end_date
      earliest_calendar_date
      latest_calendar_date
      fallback_week
    }
    feed_infos {
      feed_publisher_name
      feed_publisher_url
      feed_lang
      default_lang
      feed_version
      feed_start_date
      feed_end_date
      feed_contact_email
      feed_contact_url
    }
  }
}
`

const maxLimit = 10000

const { result, loading, error, fetchMore } = useQuery<QueryResult, QueryVariables>(
  fvQuery,
  () => ({
    after: 0,
    onestop_id: props.feed.onestop_id,
    limit: props.limit
  }),
  {
    clientId: 'transitland'
  }
)

const entities = computed<FeedVersion[]>(() => result.value?.entities ?? [])

const hasMore = computed<boolean>(() => {
  return (entities.value.length % props.limit) === 0
})

const latestFeedVersionSha1 = computed<string>(() => {
  const s = entities.value.slice(0).sort((a, b) => new Date(a.fetched_at).getTime() - new Date(b.fetched_at).getTime())
  if (s.length > 0) {
    return s[0].sha1
  }
  return ''
})

function fetchMoreFn (): void {
  if (entities.value.length > maxLimit) {
    return
  }
  const lastId = entities.value.length > 0 ? entities.value[entities.value.length - 1].id : 0
  fetchMore({
    variables: {
      after: lastId,
      limit: props.limit
    },
    updateQuery: (previousResult: QueryResult, { fetchMoreResult }: { fetchMoreResult?: QueryResult }) => {
      if (!fetchMoreResult) { return previousResult }
      const cur = [...previousResult.entities, ...fetchMoreResult.entities]
      return {
        entities: cur
      }
    }
  })
}

function triggerDownload (sha1: string): void {
  const isLatest = (sha1 === latestFeedVersionSha1.value)
  emit('downloadTriggered', sha1, isLatest)
  if (props.issueDownloadRequest) {
    window.open(`${useApiEndpoint()}/rest/feed_versions/${sha1}/download`, '_blank')
  }
}
</script>
