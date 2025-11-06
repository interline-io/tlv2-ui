<template>
  <div class="tl-feed-upload">
    <slot name="title">
      <tl-title title="Upload feed version" />
    </slot>

    <o-notification
      v-if="networkError"
      variant="danger"
    >
      Error: {{ networkError }}
    </o-notification>

    <o-steps
      v-model="activeStep"
      :has-navigation="false"
    >
      <o-loading
        v-model="mutationLoading"
        :is-full-page="false"
      />
      <o-step-item
        value="1"
        step="1"
        label="Upload feed"
      >
        <o-notification
          variant="info"
          has-icon
        >
          Upload a GTFS archive from your local computer or enter a URL to download a GTFS archive from another server. Provide a single ZIP archive that contains all relevant GTFS files without any subdirectories.
        </o-notification>
        <div class="dropbox" @click="fileInput?.click()">
          <input
            ref="fileInput"
            type="file"
            class="input-file"
            accept=".zip"
            @change="upload"
          >
          <p>Drag a GTFS archive to this box, or click to browse your computer's file system.</p>
        </div>

        <p class="action-or">
          or
        </p>

        <o-field
          label="Static GTFS URL"
          grouped
        >
          <o-input
            v-model="feedUrl"
            type="text"
            expanded
            placeholder="Enter a URL for GTFS feed archive starting with http:// or https://"
          />
          <div class="block is-clearfix">
            <o-button
              v-if="mutationLoading"
              variant="primary"
              class="is-pulled-right"
              :disabled="true"
            >
              Uploading...
            </o-button>
            <o-button
              v-else
              class="button is-primary is-pulled-right"
              :disabled="!feedUrlIsValid"
              @click="submitUrl"
            >
              Upload feed
            </o-button>
          </div>
        </o-field>
        <br>
      </o-step-item>

      <o-step-item
        value="2"
        step="2"
        label="Validate feed"
      >
        <o-loading
          v-model="fetchLoading"
          :is-full-page="false"
        />
        <div v-if="entity">
          <div v-if="!entity.success">
            <o-notification
              has-icon
              variant="danger"
            >
              Failed to validate file. {{ entity.failure_reason }}
            </o-notification>
          </div>
          <div v-else>
            <o-notification
              has-icon
              variant="info"
            >
              Review validation results below. Errors are important to fix before proceeding, warnings are advisory.  When satisfied, press the <em>Import feed</em> button to continue.
            </o-notification>
            <div class="buttons is-right">
              <o-button
                v-if="fetchLoading"
                variant="primary"
                class="is-pulled-right"
                :disabled="true"
              >
                Starting to import...
              </o-button>
              <o-button
                v-else
                variant="primary"
                class="is-pulled-right"
                @click="fetchFeedVersion"
              >
                Import feed
              </o-button>
            </div>

            <hr>

            <rgrt-validation-results :entity="entity" />
          </div>
        </div>
      </o-step-item>

      <o-step-item
        value="3"
        step="3"
        label="Import feed"
      >
        <o-notification
          variant="info"
          has-icon
        >
          Please wait while your data is imported.
          <o-loading
            v-model="importLoading"
            :is-full-page="false"
          />
        </o-notification>
      </o-step-item>

      <o-step-item
        value="4"
        step="4"
        label="Name and finalize feed"
      >
        <div v-if="fetchResult">
          <o-notification
            v-if="fetchResult.fetch_error"
            has-icon
            variant="danger"
          >
            Failed: {{ fetchResult }}
          </o-notification>

          <o-notification
            v-else-if="fetchResult.found_sha1 || fetchResult.found_dir_sha1"
            has-icon
            variant="danger"
          >
            <slot name="existing-feed-version" :fetch-result="fetchResult">
              This feed version already exists in the database, with SHA1 checksum value {{ fetchResult.feed_version.sha1 }}, uploaded on {{ formatDate(fetchResult.feed_version.fetched_at) }}. Existing feeds cannot be uploaded again.
            </slot>
          </o-notification>

          <template v-else>
            <o-notification
              has-icon
              variant="info"
            >
              Success! The contents of your feed have been imported. The final step is to give this feed a name and description for future reference. Press the <em>Save</em> button to finish the upload process.
            </o-notification>
            <p>
              <tl-feed-version-edit
                :id="fetchResult.feed_version.id"
                @update="finished"
              />
            </p>
          </template>
        </div>
      </o-step-item>
    </o-steps>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, navigateTo } from '#imports'
import { gql } from 'graphql-tag'
import { useMutation } from '@vue/apollo-composable'
import { useMixpanel } from '../../composables/useMixpanel'
import { formatDate } from '../../lib/filters'

// Entity page mixin functionality inline
const route = useRoute()
const pathKey = computed(() => route.params.feedKey as string)

// Types
interface ValidateGtfsResponse {
  validate_gtfs: {
    success: boolean
    failure_reason?: string
    errors: {
      filename: string
      error_type: string
      error_code: string
      count: number
      errors: {
        filename: string
        entity_id?: string
        error_type: string
        error_code: string
        field?: string
        value?: string
        message: string
        geometry?: any
        entity_json?: any
      }[]
    }[]
    warnings: {
      filename: string
      error_type: string
      error_code: string
      count: number
      errors: {
        filename: string
        entity_id?: string
        error_type: string
        error_code: string
        field?: string
        value?: string
        message: string
        geometry?: any
        entity_json?: any
      }[]
    }[]
    details?: {
      realtime?: {
        url: string
        json: any
      }[]
      sha1: string
      earliest_calendar_date?: string
      latest_calendar_date?: string
      files: {
        name: string
        rows: number
        size: number
        sha1: string
        header: string[]
        csv_like: boolean
      }[]
      service_levels: {
        start_date: string
        end_date: string
        monday: number
        tuesday: number
        wednesday: number
        thursday: number
        friday: number
        saturday: number
        sunday: number
      }[]
      agencies: {
        agency_email?: string
        agency_fare_url?: string
        agency_id: string
        agency_lang?: string
        agency_name: string
        agency_phone?: string
        agency_timezone: string
        agency_url?: string
      }[]
      stops: {
        location_type: number
        stop_code?: string
        stop_desc?: string
        stop_id: string
        stop_name: string
        stop_timezone?: string
        stop_url?: string
        wheelchair_boarding?: number
        zone_id?: string
        geometry: any
      }[]
      routes: {
        route_id: string
        route_short_name?: string
        route_long_name?: string
        route_type: number
        route_color?: string
        route_text_color?: string
        route_sort_order?: number
        route_url?: string
        route_desc?: string
        geometry: any
      }[]
      feed_infos: {
        feed_publisher_name: string
        feed_publisher_url?: string
        feed_lang: string
        feed_version?: string
        feed_start_date?: string
        feed_end_date?: string
      }[]
    }
  }
}

interface FeedVersionFetchResponse {
  feed_version_fetch: {
    feed_version: {
      id: number
      sha1: string
      fetched_at: string
      name?: string
      description?: string
      agencies: {
        id: number
        agency_name: string
      }[]
      feed: {
        id: number
        onestop_id: string
      }
    }
    found_sha1: boolean
    found_dir_sha1: boolean
    fetch_error?: string
  }
}

interface FeedVersionImportResponse {
  feed_version_import: {
    success: boolean
  }
}

// Extract individual types from response types
type ValidationEntity = ValidateGtfsResponse['validate_gtfs']
type FetchResult = FeedVersionFetchResponse['feed_version_fetch']

// GraphQL mutations
const VALIDATE_GTFS_MUTATION = gql`
  mutation ($file: Upload, $url: String, $realtime_urls: [String!]) {
    validate_gtfs(file: $file, url: $url, realtime_urls: $realtime_urls) {
      success
      failure_reason
      errors {
        filename
        error_type
        error_code
        count
        errors {
          filename
          entity_id
          error_type
          error_code
          field
          value
          message
          geometry
          entity_json
        }
      }
      warnings {
        filename
        error_type
        error_code
        count
        errors {
          filename
          entity_id
          error_type
          error_code
          field
          value
          message
          geometry
          entity_json
        }
      }
      details {
        realtime {
          url
          json
        }
        sha1
        earliest_calendar_date
        latest_calendar_date
        files {
          name
          rows
          size
          sha1
          header
          csv_like
        }
        service_levels(limit: 1000, route_id: null) {
          start_date
          end_date
          monday
          tuesday
          wednesday
          thursday
          friday
          saturday
          sunday
        }
        agencies {
          agency_email
          agency_fare_url
          agency_id
          agency_lang
          agency_name
          agency_phone
          agency_timezone
          agency_url
        }
        stops {
          location_type
          stop_code
          stop_desc
          stop_id
          stop_name
          stop_timezone
          stop_url
          wheelchair_boarding
          zone_id
          geometry
        }
        routes {
          route_id
          route_short_name
          route_long_name
          route_type
          route_color
          route_text_color
          route_sort_order
          route_url
          route_desc
          geometry
        }
        feed_infos {
          feed_publisher_name
          feed_publisher_url
          feed_lang
          feed_version
          feed_start_date
          feed_end_date
        }
      }
    }
  }
`

const FETCH_FEED_VERSION_MUTATION = gql`
  mutation ($file: Upload, $url: String, $feedOnestopId: String!) {
    feed_version_fetch(file: $file, url: $url, feed_onestop_id: $feedOnestopId) {
      feed_version {
        id
        sha1
        fetched_at
        name
        description
        agencies {
          id
          agency_name
        }
        feed {
          id
          onestop_id
        }
      }
      found_sha1
      found_dir_sha1
      fetch_error
    }
  }
`

const IMPORT_FEED_VERSION_MUTATION = gql`
  mutation ($id: Int!) {
    feed_version_import(id: $id) {
      success
    }
  }
`

// Extract pathKey from route params for feed upload

// Apollo mutations setup
const { mutate: validateGtfs } = useMutation<ValidateGtfsResponse>(VALIDATE_GTFS_MUTATION, {
  clientId: 'transitland'
})

const { mutate: fetchFeedVersionMutate } = useMutation<FeedVersionFetchResponse>(FETCH_FEED_VERSION_MUTATION, {
  clientId: 'transitland'
})

const { mutate: importFeedVersionMutate } = useMutation<FeedVersionImportResponse>(IMPORT_FEED_VERSION_MUTATION, {
  clientId: 'transitland'
})

// Template refs
const fileInput = ref<HTMLInputElement>()

// Reactive state
const activeStep = ref<string>('1')
const fetchResult = ref<FetchResult | null>(null)
const selectedFiles = ref<File[]>([])
const entities = ref<ValidationEntity[]>([])
const feedUrl = ref<string>('')
const realtimeUrl = ref<string>('')
const mutationLoading = ref<boolean>(false)
const fetchLoading = ref<boolean>(false)
const importLoading = ref<boolean>(true)
const networkError = ref<Error | false>(false)

// Computed properties
const entity = computed<ValidationEntity | null>(() => {
  return entities.value.length > 0 ? (entities.value[0] ?? null) : null
})

const feedUrlIsValid = computed<boolean>(() => {
  return !!(feedUrl.value
    && feedUrl.value.length > 0
    && (feedUrl.value.startsWith('http://') || feedUrl.value.startsWith('https://')))
})

// Methods
async function validateFeed (file?: File): Promise<void> {
  entities.value = []
  mutationLoading.value = true

  try {
    const result = await validateGtfs({
      file,
      url: feedUrl.value || null,
      realtime_urls: realtimeUrl.value ? [realtimeUrl.value] : null
    })

    if (result?.data) {
      activeStep.value = '2'
      entities.value = [result.data.validate_gtfs]
    } else {
      networkError.value = new Error('Validation failed: No data returned')
    }
  } catch (error) {
    networkError.value = error as Error
  } finally {
    mutationLoading.value = false
  }
}

async function fetchFeedVersion (): Promise<void> {
  useMixpanel().track('Upload feed version: Fetch feed version', {})
  fetchResult.value = null
  fetchLoading.value = true

  try {
    const result = await fetchFeedVersionMutate({
      file: selectedFiles.value[0] || null,
      url: feedUrl.value || null,
      feedOnestopId: pathKey.value
    })

    if (result?.data) {
      activeStep.value = '3'
      fetchResult.value = result.data.feed_version_fetch
      fetchLoading.value = false
      if (fetchResult.value) {
        importFeedVersion(fetchResult.value.feed_version.id)
      }
    }
  } catch (error) {
    fetchLoading.value = false
    networkError.value = error as Error
  }
}

async function importFeedVersion (fvid: number): Promise<void> {
  useMixpanel().track('Upload feed version: Import feed version', {})
  importLoading.value = true

  try {
    await importFeedVersionMutate({
      id: fvid
    })

    importLoading.value = false
    activeStep.value = '4'
  } catch (error) {
    console.log('import feed version error:', error)
    networkError.value = error as Error
  }
}

function submitUrl (): void {
  useMixpanel().track('Upload feed version: Submit URL', {
    'feed-url': feedUrl.value
  })
  validateFeed()
}

function upload (event: Event): void {
  const target = event.target as HTMLInputElement
  const files = target.files ? Array.from(target.files) : []

  useMixpanel().track('Upload feed version: Upload', {})
  selectedFiles.value = files
  if (!files.length) {
    return
  }
  validateFeed(files[0])
}

function finished (): void {
  useMixpanel().track('Upload feed version: Finished', {})
  navigateTo({
    name: 'feeds-feedKey',
    params: { feedKey: pathKey.value }
  })
}
</script>

  <style scoped>
  .error-group td {
    border-bottom:solid 1px #000;
    font-weight: bold;
    background: #ccc;
  }
  .dropbox {
    outline: 2px dashed grey; /* the dash box */
    background: #efefef;
    color: dimgray;
    height: 120px; /* minimum height */
    position: relative;
    cursor: pointer;
  }
  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 120px;
    position: absolute;
    cursor: pointer;
  }
  .dropbox:hover {
    background: #f6f6f6; /* when mouse over to the drop zone, change color */
  }
  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }
  .action-or {
    text-align:center;
    margin:20px;
  }
  </style>

<style>
.tl-feed-upload .step-content {
  margin-top:20px;
}
</style>
