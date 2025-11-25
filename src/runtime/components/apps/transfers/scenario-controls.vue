<template>
  <div class="mb-4">
    <o-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </o-notification>

    <!-- Feed version/service date/time-of-day selector -->
    <tl-feed-version-time-selector
      :model-value="feedVersionSelections"
      :time-of-day="scenario?.timeOfDay"
      :feed-version-options="mappedFeedVersionOptions"
      :disabled="disabled"
      :show-time-of-day="showTimeOfDay"
      :show-all-day-option="showAllDay"
      :allow-multiple="showAddFeedVersion"
      :show-upload-link="showUploadNewFeedVersion"
      @update:model-value="handleFeedVersionSelectionsChanged"
      @update:time-of-day="emitSetTimeOfDay"
    />

    <!-- Validation messages for feed versions -->
    <div
      v-for="(fv, idx) of displayFeedVersionOptions"
      :key="idx"
      class="mb-2"
    >
      <o-notification
        v-if="station != null && fv.id != null && !loading && !fv.hasStops"
        variant="danger"
        :closeable="false"
      >
        Feed version {{ fv.displayName || fv.id }}: No stops in current location
      </o-notification>
      <o-notification
        v-if="station != null && fv.id != null && !loading && fv.hasStops && !fv.hasDepartures"
        variant="danger"
        :closeable="false"
      >
        Feed version {{ fv.displayName || fv.id }}: No departures on {{ scenario?.selectedFeedVersions?.[0]?.serviceDate }} between {{ scenario?.timeOfDay }}
      </o-notification>
    </div>

    <div
      v-if="showTransfers"
      class="columns is-clearfix block"
    >
      <div class="column is-one-third">
        <div class="control">
          <o-field
            label="Walking Profile (Beta)"
            grouped
            :message="enableProfiles ? undefined : 'Profiles may not be available for this station and/or feed version'"
          >
            <o-select
              :model-value="scenario?.profileName"
              :disabled="!enableProfiles"
              @update:model-value="emitSetProfileName"
            >
              <option :value="null">
                Straight-line
              </option>
              <option
                v-for="(p, i) of profiles"
                :key="i"
                :value="i"
              >
                {{ i }}
              </option>
            </o-select>
          </o-field>
        </div>
        <div class="control">
          <o-field>
            <template #message>
              <p v-if="station == null || loading " />
              <p
                v-else-if="scenario?.useStopObservations && !hasAtLeastOneStopObservation"
                class="help is-danger"
              >
                No real-time observations found on {{ scenario?.selectedFeedVersions?.[0]?.serviceDate }} between {{ scenario?.timeOfDay }}
              </p>
            </template>
            <template #label>
              Time Source
            </template>
            <o-select
              :model-value="scenario?.useStopObservations"
              @update:model-value="emitSetUseStopObservations"
            >
              <option value="true">
                Static GTFS &amp; GTFS Realtime schedules
              </option>
              <option value="false">
                Static GTFS schedule only
              </option>
            </o-select>
          </o-field>
        </div>
      </div>
      <div class="column is-two-thirds">
        <tl-apps-transfers-time-scoring-control
          :transfer-scoring-breakpoints="scenario?.transferScoringBreakpoints || []"
          @changed="transferScoringBreakpointsChanged"
        />
        <o-field label="Options">
          <!-- @vue-skip -->
          <o-checkbox
            style="padding-top:8px;"
            :model-value="(scenario?.hideSubsequentTransfers || 0) > 0"
            @update:model-value="hideSubsequentTransfersChanged"
          >
            Hide subsequent transfers to the same route &amp; headsign
          </o-checkbox>
        </o-field>
      </div>
    </div>

    <div
      v-if="showTrips"
      class="columns ttat-trip-selector block"
    >
      <div class="column is-one-half">
        <article class="message">
          <div class="message-header">
            <p>Incoming trips</p>
            <div class="field has-addons">
              <p class="control">
                <o-button
                  size="small"
                  @click="setExcludeIncomingTrips(false, '*')"
                >
                  None
                </o-button>
              </p>
              <p class="control">
                <o-button
                  size="small"
                  @click="setExcludeIncomingTrips(true, '*')"
                >
                  All
                </o-button>
              </p>
            </div>
          </div>
          <div class="message-body">
            <tl-tree-control
              v-if="scenarioResult"
              :hide-root="true"
              :node="scenarioResult.incomingTripTree"
              :max-deep="3"
              @select="setExcludeIncomingTrips"
            />
          </div>
        </article>
      </div>

      <div class="column is-one-half">
        <article class="message">
          <div class="message-header">
            <p>Outgoing trips</p>
            <div class="field has-addons">
              <p class="control">
                <o-button
                  size="small"
                  @click="setExcludeOutgoingTrips(false, '*')"
                >
                  None
                </o-button>
              </p>
              <p class="control">
                <o-button
                  size="small"
                  @click="setExcludeOutgoingTrips(true, '*')"
                >
                  All
                </o-button>
              </p>
            </div>
          </div>
          <div class="message-body">
            <tl-tree-control
              v-if="scenarioResult"
              :hide-root="true"
              :node="scenarioResult.outgoingTripTree"
              :max-deep="3"
              @select="setExcludeOutgoingTrips"
            />
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NewScenario,
  NewScenarioResult,
  SelectedFeedVersion
} from './scenario'
import type { Scenario, ScenarioResult,
  FeedVersionOption } from './scenario'
import type { Station } from './station'
import { Profiles } from './graph'
import { computed, ref, watch } from 'vue'
import { useMixpanel } from '../../../composables/useMixpanel'

interface Props {
  scenario?: Scenario
  scenarioResult?: ScenarioResult
  station?: Station | null
  disabled?: boolean
  feedVersionOptions?: FeedVersionOption[]
  showTimeOfDay?: boolean
  showAllDay?: boolean
  showAddFeedVersion?: boolean
  showUploadNewFeedVersion?: boolean
  showTransfers?: boolean
  enableProfiles?: boolean
  showTrips?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  scenario: () => NewScenario(),
  scenarioResult: () => NewScenarioResult(null, null, null),
  station: null,
  disabled: false,
  feedVersionOptions: () => [],
  showTimeOfDay: true,
  showAllDay: true,
  showAddFeedVersion: true,
  showUploadNewFeedVersion: true,
  showTransfers: true,
  enableProfiles: false,
  showTrips: false,
  loading: false
})

const emit = defineEmits({
  transferScoringBreakpointsChanged: (_value: number[]) => true,
  setTimeOfDay: (_value: string) => true,
  setProfileName: (_value: string | null) => true,
  setUseStopObservations: (_value: boolean) => true,
  setExcludeIncomingTrips: (_value: string[]) => true,
  setExcludeOutgoingTrips: (_value: string[]) => true,
  setSelectedFeedVersion: (_idx: number, _fvid: number | null, _date: string | null) => true,
  setHideSubsequentTransfers: (_value: number | string) => true,
  error: (_value: string) => true
})

const profiles = Profiles
const selectedFeedVersions = ref<SelectedFeedVersion[]>(props.scenario?.selectedFeedVersions?.slice(0) || [])
const _enableStopObservations = ref(true)
const error = ref<string | null>(null)

const hasAtLeastOneStopObservation = computed(() => {
  if (!props.scenarioResult?.outgoingDepartures) return false
  for (const d of props.scenarioResult.outgoingDepartures) {
    if (d.observed_arrival_time) {
      return true
    }
  }
  return false
})

// Map FeedVersionOption to FeedVersionOptionInput for the new component
const mappedFeedVersionOptions = computed(() => {
  return props.feedVersionOptions.map(fv => ({
    id: fv.id,
    displayName: fv.displayName,
    feedOnestopId: fv.feedOnestopId,
    fetchedAt: fv.fetchedAt,
    defaultServiceDate: fv.defaultServiceDate,
    start_date: fv.start_date,
    end_date: fv.end_date
  }))
})

// Convert scenario's selectedFeedVersions to FeedVersionSelection format
const feedVersionSelections = computed(() => {
  return selectedFeedVersions.value.map(fv => ({
    id: fv.id,
    serviceDate: fv.serviceDate || ''
  }))
})

const displayFeedVersionOptions = computed(() => {
  const a = new Map<number, FeedVersionOption>()
  for (const fvo of props.feedVersionOptions) {
    if (!a.has(fvo.id)) {
      a.set(fvo.id, fvo)
    }
  }
  return selectedFeedVersions.value.map((fv) => {
    if (a.has(fv.id!)) {
      const b = a.get(fv.id!)!
      b.serviceDate = fv.serviceDate
      return b
    }
    // If feed version not in options, create a minimal stub
    // This should not normally happen - feed versions should be loaded first
    const b = {
      id: fv.id!,
      serviceDate: fv.serviceDate,
      displayName: `Feed Version ${fv.id}`,
      defaultServiceDate: fv.serviceDate || null,
      fetchedAt: '',
      feedOnestopId: undefined,
      hasDepartures: undefined,
      hasStops: undefined,
      start_date: undefined,
      end_date: undefined
    } as FeedVersionOption
    return b
  })
})

watch(() => props.scenario?.selectedFeedVersions, () => {
  if (props.scenario?.selectedFeedVersions) {
    selectedFeedVersions.value = props.scenario.selectedFeedVersions.slice(0)
  }
}, { deep: true })

function hideSubsequentTransfersChanged (newValue: boolean) {
  if (newValue) {
    emit('setHideSubsequentTransfers', 180)
  } else {
    emit('setHideSubsequentTransfers', '')
  }
}

function setExcludeIncomingTrips (state: boolean, keys: string) {
  if (!props.scenarioResult) return
  const excl = props.scenarioResult.incomingTripTree.toggleUnselected(state, keys).getExcludeList()
  emit('setExcludeIncomingTrips', excl)
}

function setExcludeOutgoingTrips (state: boolean, keys: string) {
  if (!props.scenarioResult) return
  const excl = props.scenarioResult.outgoingTripTree.toggleUnselected(state, keys).getExcludeList()
  emit('setExcludeOutgoingTrips', excl)
}

// Wrapper methods for template inline emits
function emitSetTimeOfDay (value: string | undefined) {
  if (value !== undefined) {
    emit('setTimeOfDay', value)
  }
}

function emitSetProfileName (value: string | null | undefined) {
  if (value !== undefined) {
    emit('setProfileName', value)
  }
}

function emitSetUseStopObservations (value: boolean | undefined) {
  if (value !== undefined) {
    emit('setUseStopObservations', value)
  }
}

function transferScoringBreakpointsChanged (v: number[]) {
  emit('transferScoringBreakpointsChanged', v)
  useMixpanel().track('Modify analyst report: Transfer scoring breakpoints changed', {
    values: v
  })
}

// Handle updates from the feed-version-time-selector component
function handleFeedVersionSelectionsChanged (selections: Array<{ id: number, serviceDate: string }>) {
  // Convert back to the format expected by the parent
  selections.forEach((selection, idx) => {
    emit('setSelectedFeedVersion', idx, selection.id, selection.serviceDate)
  })

  // Update local state
  selectedFeedVersions.value = selections.map(s => new SelectedFeedVersion({
    id: s.id,
    serviceDate: s.serviceDate
  }))
}
</script>

<style scoped>
input[type="date"] {
  width: auto;
}
</style>
