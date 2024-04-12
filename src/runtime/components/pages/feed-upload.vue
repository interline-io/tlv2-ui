<template>
  <div>
    <tl-title title="Upload feed version" />

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
        label="Upload feed"
        step="1"
      >
        <o-notification
          variant="info"
          has-icon
        >
          Upload a GTFS archive from your local computer or enter a URL to download a GTFS archive from another server. Provide a single ZIP archive that contains all relevant GTFS files without any subdirectories.
        </o-notification>
        <div class="dropbox">
          <input
            type="file"
            class="input-file"
            accept=".zip"
            @change="upload"
          >
          <p>Drag a GTFS archive to this box, or click to browse your computer's file system.</p>
        </div>

        <p style="text-align:center;margin:20px;">
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
        label="Validate feed"
        step="2"
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

            <analyst-validation-results :entity="entity" />
          </div>
        </div>
      </o-step-item>

      <o-step-item
        label="Import feed"
        step="3"
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
        label="Name and finalize feed"
        step="4"
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
              This feed version already exists in the database, with SHA1 checksum value {{ fetchResult.feed_version.sha1 }}, uploaded on {{ $filters.formatDate(fetchResult.feed_version.fetched_at) }}. Existing feeds cannot be uploaded again.
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

<script>
import { gql } from 'graphql-tag'
import { useMixpanel } from '../../composables/useMixpanel'
import EntityPageMixin from './entity-page-mixin'

const q = gql`
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
const fetchQuery = gql`
  mutation ($file: Upload, $url: String, $feed_onestop_id: String!) {
      feed_version_fetch(file: $file, url: $url, feed_onestop_id: $feed_onestop_id) {
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

const importQuery = gql`
  mutation ($id: Int!) {
    feed_version_import(id: $id) {
      success
    }
  }
  `

export default {
  mixins: [EntityPageMixin],
  props: {

  },
  data () {
    return {
      activeStep: 1,
      fetchResult: null,
      selectedFiles: [],
      entities: [],
      feedUrl: null,
      realtimeUrl: '',
      mutationLoading: false,
      fetchLoading: false,
      importLoading: true,
      networkError: false
    }
  },
  computed: {
    entity () {
      return this.entities.length > 0 ? this.entities[0] : null
    },
    feedUrlIsValid () {
      return this.feedUrl && this.feedUrl.length > 0 && (this.feedUrl.startsWith('http://') || this.feedUrl.startsWith('https://'))
    }
  },
  methods: {
    validateFeed (file) {
      this.entities = []
      this.mutationLoading = true
      this.$apollo
        .mutate({
          client: 'transitland',
          mutation: q,
          variables: {
            file,
            url: this.feedUrl,
            realtime_urls: this.realtimeUrl ? [this.realtimeUrl] : null
          },
          update: (_, { data }) => {
            this.activeStep = 2
            this.entities = [data.validate_gtfs]
            this.mutationLoading = false
          }
        }).catch((error) => {
          this.mutationLoading = false
          this.networkError = error
        })
    },
    fetchFeedVersion () {
      useMixpanel().track('Upload feed version: Fetch feed version')
      this.fetchResult = null
      this.fetchLoading = true
      this.$apollo
        .mutate({
          client: 'transitland',
          mutation: fetchQuery,
          variables: {
            file: this.selectedFiles[0],
            url: this.feedUrl,
            feed_onestop_id: this.pathKey
          },
          update: (_, { data }) => {
            this.activeStep = 3
            this.fetchResult = data.feed_version_fetch
            this.fetchLoading = false
            this.importFeedVersion(this.fetchResult.feed_version.id)
          }
        }).catch((error) => {
          this.fetchLoading = false
          this.networkError = error
        })
    },
    importFeedVersion (fvid) {
      useMixpanel().track('Upload feed version: Import feed version')
      this.importLoading = true
      this.importResult = null
      this.$apollo
        .mutate({
          client: 'transitland',
          mutation: importQuery,
          variables: {
            id: fvid
          },
          update: () => {
            this.importLoading = false
            this.activeStep = 4
          }
        }).catch((error) => {
          console.log('import feed version error:', error)
          this.networkError = error
        })
    },
    submitUrl () {
      useMixpanel().track('Upload feed version: Submit URL', {
        'feed-url': this.feedUrl
      })
      this.validateFeed()
    },
    upload ({ target: { files = [] } }) {
      useMixpanel().track('Upload feed version: Upload')
      this.selectedFiles = files
      if (!files.length) {
        return
      }
      this.validateFeed(files[0])
    },
    finished () {
      useMixpanel().track('Upload feed version: Finished')
      navigateTo({
        name: 'feeds-feedKey',
        params: { feedKey: this.pathKey }
      })
    }
  }
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
  </style>
