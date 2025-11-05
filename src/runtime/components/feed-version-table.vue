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
          <tr
            v-for="fv of entities"
            :key="fv.id"
            :class="{ 'is-latest': isLatestFeedVersion(fv.sha1) }"
            :data-is-latest="isLatestFeedVersion(fv.sha1)"
          >
            <td v-if="showDescriptionColumn">
              {{ fv.name }}
            </td>
            <td v-if="showDescriptionColumn">
              {{ fv.description }}
            </td>
            <td>{{ formatDate(fv.fetched_at) }} ({{ fromNow(fv.fetched_at) }})</td>
            <td>
              <nuxt-link
                :to="{ name: 'feeds-feedKey-versions-feedVersionKey', params: { feedKey: feed.onestop_id, feedVersionKey: fv.sha1 } }"
              >
                {{ fv.sha1.substr(0, 6) }}…
              </nuxt-link>
            </td>
            <td v-if="showDateColumns">
              <template v-if="fv.service_window?.feed_start_date && fv.service_window?.feed_end_date">
                {{ formatDate(fv.service_window?.feed_start_date) }}
              </template>
              <template v-else>
                {{ formatDate(fv.earliest_calendar_date) }}
              </template>
            </td>
            <td v-if="showDateColumns">
              <template v-if="fv.service_window?.feed_start_date && fv.service_window?.feed_end_date">
                {{ formatDate(fv.service_window?.feed_end_date) }}
              </template>
              <template v-else>
                {{ formatDate(fv.latest_calendar_date) }}
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
                    v-if="isLatestFeedVersion(fv.sha1)"
                    icon="download"
                    title="Download latest feed version"
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
/**
 * Feed Version Table Component
 *
 * This component displays a table of feed versions and is aware of which entry represents
 * the latest/most recent feed version. This awareness affects:
 * - Visual styling (latest version shows success variant download icon)
 * - CSS classes (latest row has 'is-latest' class)
 * - Data attributes (data-is-latest boolean attribute)
 * - Download events (emits isLatest boolean with sha1)
 */
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { computed } from 'vue'
import { useApiEndpoint } from '../composables/useApiEndpoint'
import { formatDate, fromNow } from '../lib/filters'

// Types
interface FeedVersionResponse {
  id: number
  sha1: string
  name?: string
  description?: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  fetched_at: string
  url?: string
  feed_version_gtfs_import?: {
    id: number
    success?: boolean
    in_progress?: boolean
    exception_log?: string
    schedule_removed?: boolean
  }
  service_window?: {
    feed_start_date?: string
    feed_end_date?: string
    earliest_calendar_date?: string
    latest_calendar_date?: string
    fallback_week?: boolean
  }
  feed_infos?: {
    feed_publisher_name?: string
    feed_publisher_url?: string
    feed_lang?: string
    default_lang?: string
    feed_version?: string
    feed_start_date?: string
    feed_end_date?: string
    feed_contact_email?: string
    feed_contact_url?: string
  }[]
}

// Extract individual types from the response type
type FeedVersion = FeedVersionResponse

interface License {
  redistribution_allowed?: string
}

interface Feed {
  onestop_id: string
  license: License
}

interface QueryVariables {
  limit?: number
  onestop_id?: string
  after?: number
}

interface Emits {
  downloadTriggered: [sha1: string, isLatest: boolean]
}

// Props
const props = withDefaults(defineProps<{
  feed: Feed
  showDownloadColumn?: boolean
  showDescriptionColumn?: boolean
  showDateColumns?: boolean
  showActiveColumn?: boolean
  showTimelineChart?: boolean
  issueDownloadRequest?: boolean
  limit?: number
}>(), {
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

const { result, fetchMore } = useQuery<{ entities: FeedVersionResponse[] }, QueryVariables>(
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
  const s = entities.value.slice(0).sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime())
  if (s.length > 0 && s[0]) {
    return s[0].sha1
  }
  return ''
})

function isLatestFeedVersion (sha1: string): boolean {
  return sha1 === latestFeedVersionSha1.value
}

function fetchMoreFn (): void {
  if (entities.value.length > maxLimit) {
    return
  }
  const lastEntity = entities.value[entities.value.length - 1]
  const lastId = lastEntity ? lastEntity.id : 0
  fetchMore({
    variables: {
      after: lastId,
      limit: props.limit
    },
    updateQuery: (previousResult: { entities: FeedVersionResponse[] }, { fetchMoreResult }: { fetchMoreResult?: { entities: FeedVersionResponse[] } }) => {
      if (!fetchMoreResult) { return previousResult }
      const cur = [...previousResult.entities, ...fetchMoreResult.entities]
      return {
        entities: cur
      }
    }
  })
}

function triggerDownload (sha1: string): void {
  const isLatest = isLatestFeedVersion(sha1)
  emit('downloadTriggered', sha1, isLatest)
  if (props.issueDownloadRequest) {
    window.open(`${useApiEndpoint()}/rest/feed_versions/${sha1}/download`, '_blank')
  }
}
</script>
