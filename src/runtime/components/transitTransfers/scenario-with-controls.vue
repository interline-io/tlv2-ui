<template>
  <tl-transitTransfers-scenario-data
    ref="dataComponentRef"
    :station-hubs="stationHubs"
    :station-area="stationArea"
    @data-ready="handleDataReady"
  >
    <template #default>
      <tl-transitTransfers-scenario-controls
        v-if="showControls"
        :feed-version-options="feedVersionOptions"
        :scenario="(scenario as Scenario)"
        :scenario-result="(scenarioResult as ScenarioResult)"
        :loading="loading"
        :station="station"
        :show-transfers="showTransferControls"
        :enable-profiles="displayProfiles"
        :show-trips="showTripControls"
        @set-exclude-incoming-trips="handleSetExcludeIncomingTrips"
        @set-exclude-outgoing-trips="handleSetExcludeOutgoingTrips"
        @transfer-scoring-breakpoints-changed="handleSetTransferScoringBreakpoints"
        @set-time-of-day="handleSetTimeOfDay"
        @set-selected-feed-version="handleSetSelectedFeedVersion"
        @set-profile-name="handleSetProfileName"
        @set-use-stop-observations="handleSetUseStopObservations"
        @set-hide-subsequent-transfers="handleSetHideSubsequentTransfers"
        @error="handleSetError"
      />
      <o-notification
        v-if="error"
        variant="danger"
      >
        Error loading data: {{ error.message }}
      </o-notification>
      <slot
        v-else
        :scenario="scenario"
        :scenario-result="scenarioResult"
        :station="station"
        :feed-version-options="feedVersionOptions"
        :display-profiles="displayProfiles"
        :loading="loading"
      />
    </template>
  </tl-transitTransfers-scenario-data>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Scenario, ScenarioResult, FeedVersionOption } from './scenario'
import type { Station } from './station'
import type { StationHub } from './types'

interface Props {
  stationHubs: StationHub[]
  stationArea: StationHub
  showControls?: boolean
  showTransferControls?: boolean
  showTripControls?: boolean
}

withDefaults(defineProps<Props>(), {
  showControls: true,
  showTransferControls: false,
  showTripControls: false
})

const scenario = ref<Scenario | undefined>(undefined)
const scenarioResult = ref<ScenarioResult | undefined>(undefined)
const station = ref<Station | null>(null)
const feedVersionOptions = ref<FeedVersionOption[]>([])
const displayProfiles = ref(false)
const loading = ref(false)
const error = ref<Error | null>(null)
const dataComponentRef = ref<any>(null)

function handleDataReady (data: {
  scenario: Scenario
  scenarioResult: ScenarioResult
  station: Station
  feedVersionOptions: FeedVersionOption[]
  displayProfiles: boolean
  loading: boolean
  error: Error | null
}) {
  scenario.value = data.scenario
  scenarioResult.value = data.scenarioResult
  station.value = data.station
  feedVersionOptions.value = data.feedVersionOptions
  displayProfiles.value = data.displayProfiles
  loading.value = data.loading
  error.value = data.error
}

function handleSetExcludeIncomingTrips (val: string[]) {
  dataComponentRef.value?.handleSetExcludeIncomingTrips(val)
}

function handleSetExcludeOutgoingTrips (val: string[]) {
  dataComponentRef.value?.handleSetExcludeOutgoingTrips(val)
}

function handleSetTransferScoringBreakpoints (val: number[]) {
  dataComponentRef.value?.handleSetTransferScoringBreakpoints(val)
}

function handleSetTimeOfDay (val: string) {
  dataComponentRef.value?.handleSetTimeOfDay(val)
}

function handleSetSelectedFeedVersion (idx: number, id: number | null, date: string | null) {
  dataComponentRef.value?.handleSetSelectedFeedVersion(idx, id, date)
}

function handleSetProfileName (val: string | null) {
  dataComponentRef.value?.handleSetProfileName(val)
}

function handleSetUseStopObservations (val: boolean) {
  dataComponentRef.value?.handleSetUseStopObservations(val)
}

function handleSetHideSubsequentTransfers (val: number | string) {
  dataComponentRef.value?.handleSetHideSubsequentTransfers(val)
}

function handleSetError (val: string) {
  error.value = new Error(val)
}
</script>
