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

<script setup lang="ts">
import { computed, ref } from 'vue'
import ApiExample from './api-example.vue'

// TypeScript interfaces and types
type RTType = 'alerts' | 'trip_updates' | 'vehicle_positions'
type OutputFormat = 'json' | 'pb'

interface RTTypeDisplayMap {
  vehicle_positions: string
  trip_updates: string
  alerts: string
}

// Props
const props = defineProps<{
  feedOnestopId: string
  rtType: RTType
}>()

// Reactive data
const selectedFormat = ref<OutputFormat>('json')
const showModal = ref<boolean>(false)

// RT Type display mapping
const rtTypeDisplayMap: RTTypeDisplayMap = {
  vehicle_positions: 'Vehicle Positions',
  trip_updates: 'Trip Updates',
  alerts: 'Service Alerts'
}

// Computed properties
const rtTypeDisplay = computed<string>(() => {
  return rtTypeDisplayMap[props.rtType] || props.rtType
})

const apiDescription = computed<string>(() => {
  return `To download ${rtTypeDisplay.value} data in ${selectedFormat.value.toUpperCase()} format using the Transitland REST API:`
})

const apiUrl = computed<string>(() => {
  return `https://transit.land/api/v2/rest/feeds/${props.feedOnestopId}/download_latest_rt/${props.rtType}.${selectedFormat.value}?apikey=REPLACE_WITH_YOUR_API_KEY`
})

const modalTitle = computed<string>(() => {
  return `GTFS Realtime: ${rtTypeDisplay.value}`
})

// Methods
const showApiModal = (): void => {
  showModal.value = true
}

// Props validation function (for runtime validation)
const isValidRTType = (value: string): value is RTType => {
  return ['alerts', 'trip_updates', 'vehicle_positions'].includes(value)
}

// Runtime validation
if (!isValidRTType(props.rtType)) {
  console.warn(`Invalid rtType: ${props.rtType}. Expected one of: alerts, trip_updates, vehicle_positions`)
}
</script>

<style scoped>
.buttons.has-addons .button.is-selected {
  background-color: var(--bulma-info);
  border-color: var(--bulma-info);
  color: var(--bulma-info-invert);
}
</style>
