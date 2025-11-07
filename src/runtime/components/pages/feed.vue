<template>
  <div>
    <tl-loading v-if="loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="entity">
      <slot name="title" :entity="entity">
        <tl-title :title="staticTitle" :description="staticDescription">
          {{ feedSpec }} feed: {{ operatorNames }}
        </tl-title>
      </slot>

      <div class="columns">
        <div class="column">
          <tl-props>
            <tr>
              <td>
                <o-tooltip label="A globally unique identifier for this feed">
                  Onestop ID
                </o-tooltip>
              </td>
              <td>
                <tl-safelink :text="entity.onestop_id" />
              </td>
            </tr>
            <tr>
              <td>
                <o-tooltip label="Data specification or format for this feed">
                  Format
                </o-tooltip>
              </td>
              <td>{{ feedSpec }}</td>
            </tr>

            <tr v-if="displayUrls">
              <td>URLs</td>
              <td>
                <ul>
                  <li v-if="entity.urls.static_current">
                    Current Static GTFS: <tl-safelink :url="entity.urls.static_current" />
                  </li>
                  <li v-if="entity.urls.static_planned && entity.urls.static_planned.length > 0">
                    Future Static GTFS: <tl-safelink :url="entity.urls.static_planned" />
                  </li>
                  <li v-if="entity.urls.static_historic">
                    <div v-for="(k, i) of entity.urls.static_historic" :key="i">
                      Historic GTFS: <tl-safelink :url="k" />
                    </div>
                  </li>
                  <li v-if="entity.urls.realtime_vehicle_positions">
                    GTFS Realtime Vehicle Positions: <tl-safelink :url="entity.urls.realtime_vehicle_positions" />
                  </li>
                  <li v-if="entity.urls.realtime_trip_updates">
                    GTFS Realtime Trip Updates: <tl-safelink :url="entity.urls.realtime_trip_updates" />
                  </li>
                  <li v-if="entity.urls.realtime_alerts">
                    GTFS Realtime Alerts: <tl-safelink :url="entity.urls.realtime_alerts" />
                  </li>
                </ul>
              </td>
            </tr>

            <tr>
              <td>
                <o-tooltip label="Last time a fetch successfully returned valid GTFS data">
                  Last Fetch
                </o-tooltip>
              </td>
              <td>
                <template v-if="lastSuccessfulFetch && lastSuccessfulFetch.fetched_at">
                  {{ formatDate(lastSuccessfulFetch.fetched_at) }} ({{
                    fromNow(lastSuccessfulFetch.fetched_at) }})
                </template>
                <template v-else>
                  Unknown
                </template>
              </td>
            </tr>

            <tr v-if="lastFetch && lastFetch.fetch_error">
              <td>
                <o-tooltip label="Error message from last fetch attempt">
                  Fetch Error
                </o-tooltip>
              </td>
              <td>
                <tl-msg-error>
                  {{ lastFetch.fetch_error }}
                </tl-msg-error>
              </td>
            </tr>

            <tr v-if="entity.authorization && entity.authorization.type">
              <td>Authorization</td>
              <td>
                <ul>
                  <li v-if="entity.authorization.type">
                    Type: {{ entity.authorization.type }}
                  </li>
                  <li v-if="entity.authorization.param_name">
                    Parameter Name: {{ entity.authorization.param_name }}
                  </li>
                  <li v-if="entity.authorization.info_url">
                    Info URL: <tl-safelink :url="entity.authorization.info_url" />
                  </li>
                </ul>
              </td>
            </tr>

            <tr v-if="displayLicense && entity.license">
              <td>License</td>
              <td>
                <ul>
                  <li v-if="entity.license.url">
                    License URL: <tl-safelink :url="entity.license.url" />
                  </li>
                  <li v-if="entity.license.spdx_identifier">
                    License Identifier: {{ entity.license.spdx_identifier }}
                  </li>
                  <li v-if="entity.license.use_without_attribution">
                    Use allowed without attribution: {{ capitalize(entity.license.use_without_attribution || '') }}
                  </li>
                  <li v-if="entity.license.share_alike_optional">
                    Share-alike optional: {{ capitalize(entity.license.share_alike_optional || '') }}
                  </li>
                  <li v-if="entity.license.commercial_use_allowed">
                    Commercial use allowed: {{ capitalize(entity.license.commercial_use_allowed || '') }}
                  </li>
                  <li v-if="entity.license.create_derived_product">
                    Creating derived products allowed: {{ capitalize(entity.license.create_derived_product || '') }}
                  </li>
                  <li v-if="entity.license.redistribution_allowed">
                    Redistribution allowed: {{ capitalize(entity.license.redistribution_allowed || '') }}
                  </li>
                  <li v-if="entity.license.attribution_text">
                    Required attribution text: {{ entity.license.attribution_text }}
                  </li>
                  <li v-if="entity.license.attribution_instructions" class="content">
                    Attribution instructions:
                    <blockquote>{{ capitalize(entity.license.attribution_instructions || '') }}</blockquote>
                  </li>
                </ul>
              </td>
            </tr>
            <tr v-if="entity.languages">
              <td>Languages</td>
              <td>{{ entity.languages }}</td>
            </tr>

            <tr v-if="entity.spec == 'GTFS'">
              <td>
                <o-tooltip
                  multilined
                  label="Information provided by the feed producer inside a feed_info.txt file"
                >
                  Feed Info
                </o-tooltip>
              </td>
              <td v-if="mostRecentFeedInfo">
                <tl-feed-info :feed-info="mostRecentFeedInfo" />
              </td>
              <td v-else>
                <em>No <code>feed_info.txt</code> file included in the most recent feed version.</em>
              </td>
            </tr>

            <tr v-if="displayTags">
              <td>
                <o-tooltip label="Metadata about this feed set in the Transitland Atlas registry">
                  Tags
                </o-tooltip>
              </td>
              <td>
                <ul v-if="entity.tags">
                  <li v-for="(value, key) in entity.tags" :key="key">
                    {{ key }}: {{ value }}
                  </li>
                </ul>
                <em v-else>No tags</em>
              </td>
            </tr>
          </tl-props>
        </div>

        <slot name="edit-feed" :entity="entity" />
      </div>

      <slot name="description" :entity="entity">
        <div class="content">
          {{ staticDescription }}
        </div>
      </slot>

      <div class="is-clearfix mb-4">
        <slot v-if="showUpload" name="upload" :entity="entity">
          <nuxt-link :to="{ name: 'feeds-feedKey-upload', params: { feedKey: props.pathKey } }" class="button is-primary is-pulled-right">
            Upload
          </nuxt-link>
        </slot>

        <slot v-if="showPermissions" name="permissions" :entity="entity">
          <o-button class="is-pulled-right is-primary" icon-left="pencil" @click="showPermissionsModal=true">
            Permissions
          </o-button>
          <tl-modal v-model="showPermissionsModal" title="Feed Permissions">
            <tl-admin-feed :id="entity.id" />
          </tl-modal>
        </slot>
      </div>

      <!-- TODO: Operators component -->
      <div v-if="showOperators">
        <hr>
        <h4 class="title is-4">
          Operator(s) Associated with this Feed
        </h4>
        <slot name="associatedOperatorsContent" :entity="entity" />
        <tl-associated-operators :associated-operators="entity.associated_operators" />
      </div>

      <hr>

      <div v-if="entity.spec == 'GTFS'">
        <h4 class="title is-4">
          Feed versions
        </h4>

        <tl-feed-version-table
          :feed="entity"
          :show-download-column="showDownloadColumn"
          :show-description-column="showDescriptionColumn"
          :show-date-columns="showDateColumns"
          :show-active-column="showActiveColumn"
          :show-timeline-chart="true"
          :issue-download-request="issueDownloadRequest"
          @download-triggered="(sha1: string, isLatest: boolean) => $emit('downloadTriggered', sha1, isLatest)"
        />
        <slot name="add-feed-version" :entity="entity" />
      </div>

      <div v-if="entity.spec == 'GTFS_RT'">
        <h4 class="title is-4">
          GTFS Realtime Feed Messages
        </h4>

        <template v-if="entity.license && entity.license.redistribution_allowed !== 'no'">
          <tl-msg-info>
            When a feed's license allows redistribution, you can view or download Transitland's recently cached copy of each GTFS Realtime endpoint. <a
              href="/documentation/concepts/source-feeds/#gtfs-realtime-feed-fetching-and-caching"
            >Learn
              more.</a>
          </tl-msg-info>
          <tl-login-gate role="tl_download_fv_current">
            <div class="columns">
              <div class="column">
                <div v-if="entity.urls.realtime_vehicle_positions" class="mb-4">
                  <h5 class="title is-5">
                    Vehicle Positions
                  </h5>
                  <div class="buttons">
                    <tl-feed-rt-download
                      :feed-onestop-id="entity.onestop_id"
                      rt-type="vehicle_positions"
                      :last-fetched-at="lastSuccessfulFetch?.fetched_at ? `${formatDate(lastSuccessfulFetch.fetched_at)} (${fromNow(lastSuccessfulFetch.fetched_at)})` : null"
                    />
                    <tl-feed-rt-api-query
                      :feed-onestop-id="entity.onestop_id"
                      rt-type="vehicle_positions"
                    />
                  </div>
                </div>
                <div v-if="entity.urls.realtime_trip_updates" class="mb-4">
                  <h5 class="title is-5">
                    Trip Updates
                  </h5>
                  <div class="buttons">
                    <tl-feed-rt-download
                      :feed-onestop-id="entity.onestop_id"
                      rt-type="trip_updates"
                      :last-fetched-at="lastSuccessfulFetch?.fetched_at ? `${formatDate(lastSuccessfulFetch.fetched_at)} (${fromNow(lastSuccessfulFetch.fetched_at)})` : null"
                    />
                    <tl-feed-rt-api-query
                      :feed-onestop-id="entity.onestop_id"
                      rt-type="trip_updates"
                    />
                  </div>
                </div>
                <div v-if="entity.urls.realtime_alerts" class="mb-4">
                  <h5 class="title is-5">
                    Service Alerts
                  </h5>
                  <div class="buttons">
                    <tl-feed-rt-download
                      :feed-onestop-id="entity.onestop_id"
                      rt-type="alerts"
                      :last-fetched-at="lastSuccessfulFetch?.fetched_at ? `${formatDate(lastSuccessfulFetch.fetched_at)} (${fromNow(lastSuccessfulFetch.fetched_at)})` : null"
                    />
                    <tl-feed-rt-api-query
                      :feed-onestop-id="entity.onestop_id"
                      rt-type="alerts"
                    />
                  </div>
                </div>
              </div>
            </div>
            <template #loginText>
              <o-notification icon="lock">
                To view or download GTFS Realtime data, please sign into an Interline account with a Transitland subscription.
              </o-notification>
            </template>
            <template #roleText>
              <o-notification icon="lock">
                Your account does not have permission to view or download GTFS Realtime data. Please <a href="https://app.interline.io/products/tlv2_api/orders/new">sign up for a Transitland subscription</a>.
              </o-notification>
            </template>
          </tl-login-gate>
        </template>
        <template v-else>
          <tl-msg-warning>
            This feed's license does not allow redistribution. Therefore feed contents are used to provide <a href="/documentation/concepts/alerts/">alerts</a> and <a href="/documentation/rest-api/departures">departures</a> through Transitland APIs, but cannot be downloaded in full raw format.
          </tl-msg-warning>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { useEntityPath } from '../../composables/useEntityPath'
import { formatDate, fromNow, capitalize } from '../../lib/filters'

// Types
interface FeedResponse {
  id: number
  onestop_id: string
  name?: string
  tags?: Record<string, any>
  languages?: string[]
  spec: string
  file?: string
  authorization?: {
    type: string
    info_url?: string
    param_name?: string
  }
  license?: {
    spdx_identifier?: string
    url?: string
    use_without_attribution?: string
    create_derived_product?: string
    redistribution_allowed?: string
    commercial_use_allowed?: string
    share_alike_optional?: string
    attribution_text?: string
    attribution_instructions?: string
  }
  urls: {
    static_current?: string
    static_historic?: string[]
    static_planned?: string
    realtime_alerts?: string
    realtime_trip_updates?: string
    realtime_vehicle_positions?: string
  }
  associated_operators: {
    onestop_id: string
    name: string
    short_name?: string
    agencies: {
      agency_id: string
      agency_name: string
    }[]
  }[]
  last_fetch: {
    fetch_error?: string
    fetched_at: string
  }[]
  last_successful_fetch: {
    fetch_error?: string
    fetched_at: string
  }[]
  most_recent_feed_version: {
    id: number
    sha1?: string
    earliest_calendar_date?: string
    latest_calendar_date?: string
    fetched_at: string
    url?: string
    feed_infos?: {
      feed_publisher_name: string
      feed_publisher_url?: string
      feed_lang: string
      default_lang?: string
      feed_version?: string
      feed_start_date?: string
      feed_end_date?: string
      feed_contact_email?: string
      feed_contact_url?: string
    }[]
  }[]
  feed_versions: Array<{ id: number }>
  feed_state?: {
    id: number
    feed_version: {
      sha1: string
      id: number
    }
  }
}

// Extract individual types from the response type
type Feed = FeedResponse
type FeedFetch = FeedResponse['last_fetch'][0]
type FeedVersion = FeedResponse['most_recent_feed_version'][0]
type FeedInfo = NonNullable<FeedVersion['feed_infos']>[0]

// Props
const props = withDefaults(defineProps<{
  pathKey: string
  showPermissions?: boolean
  showUpload?: boolean
  showDownloadColumn?: boolean
  showDescriptionColumn?: boolean
  showActiveColumn?: boolean
  showDateColumns?: boolean
  issueDownloadRequest?: boolean
  showOperators?: boolean
}>(), {
  showPermissions: false,
  showUpload: false,
  showDownloadColumn: true,
  showDescriptionColumn: true,
  showActiveColumn: true,
  showDateColumns: true,
  issueDownloadRequest: true,
  showOperators: true
})

// Emits
const emit = defineEmits<{
  downloadTriggered: [sha1: string, isLatest: boolean]
  entitiesLoaded: [entities: Feed[]]
  staticDescriptionUpdated: [description: string]
  operatorNamesUpdated: [names: string]
}>()

const q = gql`
query($onestopId: String, $ids: [Int!]) {
  entities: feeds(ids: $ids, where: {onestop_id: $onestopId}, limit: 1) {
    id
    onestop_id
    name
    tags
    languages
    spec
    file
    authorization {
      type
      info_url
      param_name
    }
    license {
      spdx_identifier
      url
      use_without_attribution
      create_derived_product
      redistribution_allowed
      commercial_use_allowed
      share_alike_optional
      attribution_text
      attribution_instructions
    }
    urls {
      static_current
      static_historic
      static_planned
      realtime_alerts
      realtime_trip_updates
      realtime_vehicle_positions
    }
    associated_operators {
      onestop_id
      name
      short_name
      agencies {
        agency_id
        agency_name
      }
    }
    last_fetch: feed_fetches(limit:1) {
      fetch_error
      fetched_at
    }
    last_successful_fetch: feed_fetches(limit:1, where:{success:true}) {
      fetch_error
      fetched_at
    }
    most_recent_feed_version: feed_versions(limit:1) {
      id
      sha1
      earliest_calendar_date
      latest_calendar_date
      fetched_at
      url
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
    feed_versions(limit:100) {
      id
    }
    feed_state {
      id
      feed_version {
        sha1
        id
      }
    }
  }
}
`

// Helper functions
function isEmpty (obj: any): boolean {
  if (!obj) { return false }
  for (const [k, v] of Object.entries(obj)) {
    if (k && k[0] !== '_' && v && (v as any).length > 0) {
      return true
    }
  }
  return false
}

function first<T> (v: T[]): T | null {
  if (v && v.length > 0 && v[0]) {
    return v[0]
  }
  return null
}

// Entity path setup
const { entityVariables } = useEntityPath({
  pathKey: props.pathKey
})

// Reactive state
const showPermissionsModal = ref(false)

// GraphQL query
const { result, loading, error } = useQuery<{ entities: FeedResponse[] }>(q, entityVariables)

// Computed entity
const entity = computed((): Feed | null => {
  return result.value?.entities?.[0] ?? null
})

// Computed properties
const feedSpec = computed((): string | undefined => {
  return entity.value?.spec?.toUpperCase()?.replace('_', '-')
})

const mostRecentFeedInfo = computed((): FeedInfo | null => {
  if (entity.value?.most_recent_feed_version && entity.value.most_recent_feed_version.length > 0) {
    return entity.value.most_recent_feed_version[0]?.feed_infos?.[0] ?? null
  }
  return null
})

const lastFetch = computed((): FeedFetch | null => {
  return first(entity.value?.last_fetch ?? [])
})

const lastSuccessfulFetch = computed((): FeedFetch | null => {
  if (entity.value?.last_successful_fetch && entity.value.last_successful_fetch.length > 0 && entity.value.last_successful_fetch[0]) {
    return entity.value.last_successful_fetch[0]
  }
  return null
})

const operatorNames = computed((): string => {
  if (!entity.value) return ''

  let operatorNames: string | null = null
  const names = (entity.value.associated_operators || []).map((o) => {
    if (o.short_name) {
      return `${o.name} (${o.short_name})`
    } else {
      return o.name
    }
  })

  if (names.length > 3) {
    operatorNames = `${names.slice(0, 3).join(', ')} and ${names.length - 3} additional operators`
  } else if (names.length > 0 && names.length <= 3) {
    operatorNames = names.slice(0, 3).join(', ')
  }

  return operatorNames || entity.value.onestop_id
})

const displayLicense = computed((): boolean => {
  if (entity.value) {
    return isEmpty(entity.value.license)
  }
  return false
})

const _displayAuthorization = computed((): boolean => {
  if (entity.value) {
    return isEmpty(entity.value.authorization)
  }
  return false
})

const displayUrls = computed((): boolean => {
  if (entity.value) {
    return isEmpty(entity.value.urls)
  }
  return false
})

const displayTags = computed((): boolean => {
  if (entity.value) {
    return isEmpty(entity.value.tags)
  }
  return false
})

const staticTitle = computed((): string => {
  if (!entity.value) return ''

  let title = `feed details: ${entity.value.onestop_id}`
  title = feedSpec.value + ' ' + title
  if (entity.value.associated_operators) {
    title = `${operatorNames.value} • ` + title
  }
  return title
})

const staticDescription = computed((): string => {
  if (!entity.value) return ''

  const operatorDescription = (entity.value && entity.value.associated_operators) ? ` with data for ${entity.value.name || operatorNames.value}` : ''
  const fvCount = entity.value.feed_versions.length
  let description = `This is a ${feedSpec.value} feed ${operatorDescription} with the Onestop ID of "${entity.value.onestop_id}".`

  if (fvCount >= 100) {
    description += ' There are over 100 versions of this feed.'
  } else if (fvCount > 1) {
    description += ` There are ${fvCount} versions of this feed.`
  }

  return description
})

// Watch for changes and emit events
watch(result, (newResult) => {
  if (newResult?.entities) {
    emit('entitiesLoaded', newResult.entities)
  }
}, { immediate: true })

watch(staticDescription, (newDescription) => {
  if (newDescription) {
    emit('staticDescriptionUpdated', newDescription)
  }
}, { immediate: true })

watch(operatorNames, (newNames) => {
  if (newNames) {
    emit('operatorNamesUpdated', newNames)
  }
}, { immediate: true })
</script>

<style scoped>
blockquote {
  margin: 10px;
  margin-left: 20px;
}
</style>
