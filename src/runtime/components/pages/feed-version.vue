<template>
  <div>
    <tl-loading v-if="loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="entity">
      <slot name="title">
        <tl-title :title="staticTitle" :description="staticDescription">
          GTFS feed: {{ operatorOrAgencyNames }}
        </tl-title>
      </slot>

      <nav class="level">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Agencies
            </p>
            <p class="title">
              {{ rowCount['agency.txt'] ? rowCount['agency.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Routes
            </p>
            <p class="title">
              {{ rowCount['routes.txt'] ? rowCount['routes.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Stops
            </p>
            <p class="title">
              {{ rowCount['stops.txt'] ? rowCount['stops.txt'].toLocaleString() : '-' }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Earliest Date
            </p>
            <p v-if="entity.service_window?.feed_start_date && entity.service_window?.feed_end_date" class="title">
              {{ formatDate(entity.service_window?.feed_start_date) }}
            </p>
            <p v-else-if="entity.earliest_calendar_date" class="title">
              {{ formatDate(entity.earliest_calendar_date) }}
            </p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Latest Date
            </p>
            <p v-if="entity.service_window?.feed_start_date && entity.service_window?.feed_end_date" class="title">
              {{ formatDate(entity.service_window?.feed_end_date) }}
            </p>
            <p v-else-if="entity.latest_calendar_date" class="title">
              {{ formatDate(entity.latest_calendar_date) }}
            </p>
          </div>
        </div>
      </nav>

      <tl-props>
        <tbody>
          <tr>
            <td>Feed Onestop ID</td>
            <td>
              <tl-safelink :text="entity.feed.onestop_id" />
            </td>
          </tr>
          <tr v-if="entity.name">
            <td>Name</td>
            <td>
              <template v-if="entity.name">
                {{ entity.name }}
              </template>
              <template v-else>
                <em>No name provided</em>
              </template>
            </td>
          </tr>
          <tr v-if="entity.description">
            <td>Description</td>
            <td>
              <template v-if="entity.description">
                {{ entity.description }}
              </template>
              <template v-else>
                <em>No description provided</em>
              </template>
            </td>
          </tr>
          <template v-if="showUserInformation">
            <tr v-if="entity.created_by">
              <td>Created by</td>
              <td>{{ entity.created_by }}</td>
            </tr>
            <tr v-if="entity.updated_by">
              <td>Last updated by</td>
              <td>{{ entity.updated_by }}</td>
            </tr>
          </template>
          <tr>
            <td>Added</td>
            <td>{{ formatDate(entity.fetched_at) }} ({{ fromNow(entity.fetched_at) }})</td>
          </tr>
          <tr>
            <td>URL</td>
            <td>
              <tl-safelink :url="entity.url" />
            </td>
          </tr>
          <tr>
            <td>SHA1</td>
            <td>
              <tl-safelink :text="entity.sha1" />
            </td>
          </tr>

          <tr>
            <td>Service</td>
            <td>
              <template v-if="entity.service_window?.feed_start_date && entity.service_window?.feed_end_date">
                {{ formatDate(entity.service_window?.feed_start_date) }} to {{ formatDate(entity.service_window?.feed_end_date) }}
                <o-tooltip>
                  <template #content>
                    <p>These service dates are sourced from the information in <code>feed_info.txt</code>.</p>
                    <p v-if="entity.earliest_calendar_date && entity.latest_calendar_date">
                      The full span of service contained in <code>calendar.txt</code> is {{ formatDate(entity.earliest_calendar_date) }} to {{ formatDate(entity.latest_calendar_date) }}
                    </p>
                  </template>
                  <i class="fas fa-info-circle" />
                </o-tooltip>
              </template>
              <template v-else-if="entity.earliest_calendar_date && entity.latest_calendar_date">
                {{ formatDate(entity.earliest_calendar_date) }} to {{ formatDate(entity.latest_calendar_date) }}
                <o-tooltip>
                  <template #content>
                    <p>The full span of service contained in <code>calendar.txt</code>.</p>
                  </template>
                  <i class="fas fa-info-circle" />
                </o-tooltip>
              </template>
            </td>
          </tr>

          <tr v-if="entity.feed_infos && entity.feed_infos.length > 0">
            <td>Details</td>
            <td>
              <tl-feed-info :show-dates="true" :feed-info="entity.feed_infos[0]" />
            </td>
          </tr>
          <tr v-if="entity">
            <td>API Import Status</td>
            <td>
              <tl-feed-version-import-status
                :feed-version-gtfs-import="entity.feed_version_gtfs_import"
                :show-not-imported-status="true"
              />
            </td>
          </tr>

          <tr v-if="entity.feed_version_gtfs_import && entity.feed">
            <td>API Active Status</td>
            <td>
              <tl-feed-version-active-status
                :feed="entity.feed"
                :feed-version-id="entity.id"
                :show-description="true"
              />
            </td>
          </tr>
        </tbody>
      </tl-props>

      <div class="is-clearfix mb-4">
        <slot v-if="showEdit" name="edit" :entity="entity">
          <o-button class="is-pulled-right is-primary" icon-left="pencil" @click="showEditModal=true">
            Edit
          </o-button>
          <tl-modal v-model="showEditModal" title="Feed Version">
            <tl-feed-version-edit
              :id="entity.id"
              @update="showEditModal = false; refetchEntities()"
            />
          </tl-modal>
        </slot>

        <slot v-if="showPermissions" name="permissions" :entity="entity">
          <o-button class="is-pulled-right is-primary" icon-left="pencil" @click="showPermissionsModal=true">
            Permissions
          </o-button>
          <tl-modal v-model="showPermissionsModal" title="Feed Version Permissions">
            <tl-admin-feed-version
              :id="entity.id"
              client="feedManagement"
              @update="showPermissionsModal = false; refetchEntities()"
            />
          </tl-modal>
        </slot>

        <slot v-if="showDownload" name="download" :entity="entity">
          <div class="is-pulled-right">
            <tl-feed-version-download :feed-onestop-id="entity.feed.onestop_id" :feed-version-sha1="props.feedVersionKey" />
          </div>
        </slot>
      </div>

      <slot v-if="showImportStatus" name="import" :entity="entity">
        <tl-feed-version-import :entity="entity" @update="refetchEntities" />
      </slot>

      <o-tabs v-model="activeTab" class="tl-tabs" type="boxed" :animated="false" @update:model-value="setTab">
        <o-tab-item :value="tabNames.timeline" label="Service coverage timeline">
          <template v-if="activeTab === tabNames.timeline">
            <div class="mb-4">
              <p class="content">
                Use this timeline view to see the range of dates for which service is scheduled in this feed version:
              </p>
              <tl-feed-version-timeline-chart-plot
                v-if="entity"
                :feed="entity.feed"
                :feed-versions="[entity]"
                :show-status-legend="false"
              />
            </div>
          </template>
        </o-tab-item>

        <o-tab-item :value="tabNames.service" label="Service levels calendar">
          <template v-if="activeTab === tabNames.service">
            <p class="content">
              Use this calendar view to compare the relative number of service hours scheduled for each day in this feed version:
            </p>
            <tl-multi-service-levels :show-group-info="false" :show-service-relative="false" :fvids="[entity.id]" :week-agg="false" />
          </template>
        </o-tab-item>

        <o-tab-item :value="tabNames.files" label="Files">
          <tl-file-info-table :files="entity.files" />
        </o-tab-item>

        <o-tab-item :value="tabNames.map" label="Map">
          <template v-if="activeTab === 'map'">
            <div v-if="imported">
              <tl-feed-version-map-viewer :feed-version-sha1="entity.sha1" :overlay="true" :link-version="true" />
            </div>
            <tl-msg-info v-else>
              Map is only available for successfully imported feed versions.
            </tl-msg-info>
          </template>
        </o-tab-item>

        <o-tab-item v-if="imported" :value="tabNames.agencies" label="Agencies">
          <tl-agency-table v-if="activeTab === tabNames.agencies" :fvid="entity.sha1" />
        </o-tab-item>

        <o-tab-item v-if="imported" :value="tabNames.routes" label="Routes">
          <tl-route-table v-if="activeTab === tabNames.routes" :link-version="true" :feed-version-sha1="entity.sha1" />
        </o-tab-item>

        <o-tab-item v-if="imported" :value="tabNames.stops" label="Stops">
          <tl-stop-table
            v-if="activeTab === tabNames.stops"
            :show-onestop-id="true"
            :link-version="true"
            :feed-version-sha1="entity.sha1"
          />
        </o-tab-item>

        <o-tab-item v-if="imported" :value="tabNames.imports" label="Import log">
          <table class="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Filename</th>
                <th>Rows</th>
                <th>Imported</th>
                <th> / </th>
                <th>Errors</th>
                <th>Reference errors</th>
                <th>Filtered</th>
                <th>Unmarked</th>
                <th>Warnings</th>
              </tr>
            </thead><tbody>
              <tr v-for="(v, fn) of mergedCount(entity.feed_version_gtfs_import ?? null)" :key="fn">
                <td><code>{{ fn }}</code></td>
                <td>{{ rowCount[fn] }}</td>
                <td>{{ v.count }}</td>
                <td />
                <td>{{ v.skip_error }}</td>
                <td>{{ v.skip_reference }}</td>
                <td>{{ v.skip_marked }}</td>
                <td>{{ v.skip_filter }} </td>
                <td>{{ v.warnings }}</td>
              </tr>
            </tbody>
          </table>
        </o-tab-item>
      </o-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Feed Version Page Component
 *
 * This component displays detailed information about a specific GTFS feed version,
 * including metadata, files, import status, and various data views.
 */
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { computed, ref } from 'vue'
import { formatDate, fromNow } from '../../lib/filters'

// Type definitions
interface FeedVersionResponse {
  id: number
  sha1: string
  earliest_calendar_date?: string
  latest_calendar_date?: string
  url?: string
  fetched_at: string
  name?: string
  description?: string
  created_by?: string
  updated_by?: string
  files: {
    id: number
    name: string
    rows: number
    size: number
    sha1: string
    csv_like: boolean
    header: string
  }[]
  feed_infos: {
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
  feed_version_gtfs_import?: {
    id: number
    exception_log?: string
    in_progress?: boolean
    success?: boolean
    schedule_removed?: boolean
    skip_entity_error_count?: Record<string, number>
    skip_entity_reference_count?: Record<string, number>
    skip_entity_filter_count?: Record<string, number>
    skip_entity_marked_count?: Record<string, number>
    warning_count?: Record<string, number>
    entity_count?: Record<string, number>
  }
  service_window?: {
    feed_start_date?: string
    feed_end_date?: string
    earliest_calendar_date?: string
    latest_calendar_date?: string
    fallback_week?: boolean
  }
  agencies: {
    id: number
    agency_name: string
  }[]
  feed: {
    id: number
    onestop_id: string
    associated_operators: {
      name: string
      onestop_id: string
    }[]
    feed_state?: {
      feed_version: {
        id: number
      }
    }
  }
}

// Extract individual types from the response type
type FeedVersion = FeedVersionResponse
type FeedVersionGtfsImport = NonNullable<FeedVersionResponse['feed_version_gtfs_import']>

interface QueryVariables {
  feedVersionSha1: string
}

interface MergedCountItem {
  count?: number
  skip_error?: number
  skip_reference?: number
  skip_marked?: number
  skip_filter?: number
  warnings?: number
}

// Props
const props = withDefaults(defineProps<{
  showEdit?: boolean
  showPermissions?: boolean
  showUserInformation?: boolean
  showDownload?: boolean
  feedVersionKey: string
  showImportStatus?: boolean
}>(), {
  showEdit: false,
  showPermissions: true,
  showUserInformation: false,
  showDownload: true,
  showImportStatus: true
})

// Reactive data
const showEditModal = ref(false)
const showPermissionsModal = ref(false)
const activeTab = ref('timeline')

// Tab names
const tabNames = computed(() => {
  const tabs = ['timeline', 'service', 'map', 'agencies', 'routes', 'stops', 'imports', 'files']
  const result: Record<string, string> = {}
  for (const tab of tabs) {
    result[tab] = tab
  }
  return result
})

// GraphQL query
const feedVersionQuery = gql`
query ($feedVersionSha1: String!) {
  entities: feed_versions(limit: 1, where: {sha1: $feedVersionSha1}) {
    id
    sha1
    earliest_calendar_date
    latest_calendar_date
    url
    fetched_at
    name
    description
    created_by
    updated_by
    files {
      id
      name
      rows
      size
      sha1
      csv_like
      header
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
    feed_version_gtfs_import {
      id
      exception_log
      in_progress
      success
      schedule_removed
      skip_entity_error_count
      skip_entity_reference_count
      skip_entity_filter_count
      skip_entity_marked_count
      warning_count
      entity_count
    }
    service_window {
      feed_start_date
      feed_end_date
      earliest_calendar_date
      latest_calendar_date
      fallback_week
    }
    agencies {
      id
      agency_name
    }
    feed {
      id
      onestop_id
      associated_operators {
        name
        onestop_id
      }
      feed_state {
        feed_version {
          id
        }
      }
    }
  }
}
`

// Apollo query
const { result, loading, error, refetch } = useQuery<{ entities: FeedVersionResponse[] }, QueryVariables>(
  feedVersionQuery,
  () => ({
    feedVersionSha1: props.feedVersionKey
  }),
  {
    clientId: 'transitland',
    errorPolicy: 'all'
  }
)

// Computed properties
const entities = computed<FeedVersion[]>(() => {
  return result.value?.entities ?? []
})

const entity = computed<FeedVersion | null>(() => {
  return entities.value.length > 0 ? (entities.value[0] ?? null) : null
})

const fvi = computed<FeedVersionGtfsImport | null>(() => {
  return (entity.value && entity.value.feed_version_gtfs_import) ? entity.value.feed_version_gtfs_import : null
})

const imported = computed<boolean>(() => {
  return fvi.value ? fvi.value.success === true : false
})

const rowCount = computed<Record<string, number>>(() => {
  if (!entity.value) return {}
  const ret: Record<string, number> = {}
  for (const f of entity.value.files || []) {
    ret[f.name] = f.rows
  }
  return ret
})

const operatorOrAgencyNames = computed<string>(() => {
  if (!entity.value) return ''

  if (entity.value.agencies && entity.value.agencies.length > 0) {
    const names = entity.value.agencies.slice(0, 3).map(a => a.agency_name)
    if (entity.value.agencies.length > 3) {
      return `${names.join(', ')} and ${entity.value.agencies.length - 3} additional operators`
    } else if (names.length > 0 && names.length <= 3) {
      return names.slice(0, 3).join(', ')
    }
    return names.join(', ')
  } else {
    return entity.value.feed.onestop_id
  }
})

const staticTitle = computed<string>(() => {
  if (!entity.value) return ''
  return `${entity.value.feed.onestop_id} • ${entity.value.sha1} • Feed version`
})

const staticDescription = computed<string>(() => {
  if (!entity.value) return ''
  const agencies = rowCount.value['agency.txt'] ? rowCount.value['agency.txt'].toLocaleString() : '-'
  const routes = rowCount.value['routes.txt'] ? rowCount.value['routes.txt'].toLocaleString() : '-'
  const stops = rowCount.value['stops.txt'] ? rowCount.value['stops.txt'].toLocaleString() : '-'

  return `An archived GTFS feed version for ${operatorOrAgencyNames.value} from the feed with a Onestop ID of ${entity.value.feed.onestop_id} first fetched at ${entity.value.fetched_at}. This feed version contains ${agencies} agencies, ${routes} routes, and ${stops} stops.`
})

// Methods
function mergedCount (fvi: FeedVersionGtfsImport | null): Record<string, MergedCountItem> {
  const m: Record<string, MergedCountItem> = {}
  if (!fvi) return m

  for (const [a, b] of Object.entries(fvi.entity_count || {})) {
    m[a] = m[a] || {}
    m[a].count = b
  }
  for (const [a, b] of Object.entries(fvi.skip_entity_error_count || {})) {
    m[a] = m[a] || {}
    m[a].skip_error = b
  }
  for (const [a, b] of Object.entries(fvi.skip_entity_reference_count || {})) {
    m[a] = m[a] || {}
    m[a].skip_reference = b
  }
  for (const [a, b] of Object.entries(fvi.skip_entity_marked_count || {})) {
    m[a] = m[a] || {}
    m[a].skip_marked = b
  }
  for (const [a, b] of Object.entries(fvi.skip_entity_filter_count || {})) {
    m[a] = m[a] || {}
    m[a].skip_filter = b
  }
  return m
}

function refetchEntities (): void {
  refetch()
}

function setTab (value: string): void {
  activeTab.value = value
}
</script>

<style scoped>
</style>
