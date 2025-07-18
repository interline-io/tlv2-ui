<template>
  <div>
    <o-button
      variant="outlined"
      icon-left="api"
      size="small"
      @click="showApiModal"
    >
      Build API Query
    </o-button>

    <!-- API Query Modal -->
    <tl-modal v-model="showModal" :title="modalTitle">
      <div class="columns">
        <div class="column">
          <!-- Feed Info Section -->
          <div class="field">
            <label class="label">Feed</label>
            <div class="control">
              <tl-safelink :text="feedOnestopId" />
            </div>
          </div>
        </div>
        <div class="column">
          <!-- Format Selection Section -->
          <div class="field">
            <label class="label">Output Format</label>
            <div class="control">
              <div class="buttons has-addons">
                <button
                  class="button"
                  :class="{ 'is-selected is-info': selectedFormat === 'json' }"
                  @click="selectedFormat = 'json'"
                >
                  <span class="icon is-small">
                    <i class="mdi mdi-code-json" />
                  </span>
                  <span>JSON</span>
                </button>
                <button
                  class="button"
                  :class="{ 'is-selected is-info': selectedFormat === 'pb' }"
                  @click="selectedFormat = 'pb'"
                >
                  <span class="icon is-small">
                    <i class="mdi mdi-file-code" />
                  </span>
                  <span>Protocol Buffer</span>
                </button>
              </div>
            </div>
            <p class="help">
              <span v-if="selectedFormat === 'json'">
                JSON format is human-readable but large.
              </span>
              <span v-else>
                Protocol Buffer format is compact but harder to inspect.
              </span>
            </p>
          </div>
        </div>
      </div>

      <tl-api-example
        title="Transitland REST API"
        :description="apiDescription"
        :api-url="apiUrl"
        learn-more-url="/documentation/rest-api/feeds#downloading-latest-gtfs-realtime"
      />
    </tl-modal>
  </div>
</template>

<script>
import ApiExample from './api-example.vue'

export default {
  name: 'FeedRtApiQuery',
  components: {
    ApiExample
  },
  props: {
    feedOnestopId: {
      type: String,
      required: true
    },
    rtType: {
      type: String,
      required: true,
      validator: value => ['alerts', 'trip_updates', 'vehicle_positions'].includes(value)
    }
  },
  data () {
    return {
      selectedFormat: 'json',
      showModal: false
    }
  },
  computed: {
    rtTypeDisplay () {
      const types = {
        vehicle_positions: 'Vehicle Positions',
        trip_updates: 'Trip Updates',
        alerts: 'Service Alerts'
      }
      return types[this.rtType] || this.rtType
    },
    apiDescription () {
      return `To download ${this.rtTypeDisplay} data in ${this.selectedFormat.toUpperCase()} format using the Transitland REST API:`
    },
    apiUrl () {
      return `https://transit.land/api/v2/rest/feeds/${this.feedOnestopId}/download_latest_rt/${this.rtType}.${this.selectedFormat}?apikey=REPLACE_WITH_YOUR_API_KEY`
    },
    modalTitle () {
      return `GTFS Realtime: ${this.rtTypeDisplay}`
    }
  },
  methods: {
    showApiModal () {
      this.showModal = true
    }
  }
}
</script>

<style scoped>
.buttons.has-addons .button.is-selected {
  background-color: var(--bulma-info);
  border-color: var(--bulma-info);
  color: var(--bulma-info-invert);
}
</style>
