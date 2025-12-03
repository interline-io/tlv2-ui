<template>
  <div class="mb-4">
    <t-notification
      v-if="error"
      variant="danger"
    >
      Error: {{ error }}
    </t-notification>

    <!-- Feed version/service date/time-of-day selector -->
    <tl-apps-transfers-feed-versions-readonly
      v-if="readOnlyFeedVersions"
      :selected-feed-versions="selectedFeedVersions"
      :feed-version-options="feedVersionOptions"
      :time-of-day="scenario?.timeOfDay"
      :show-time-of-day="showTimeOfDay"
      :show-all-day-option="showAllDay"
      :disabled="disabled"
      @update:service-date="handleServiceDateUpdate"
      @update:time-of-day="emitSetTimeOfDay"
    />
    <tl-apps-transfers-feed-version-time-selector
      v-else
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
    >
      <!-- Validation messages for each feed version -->
      <template
        v-for="(fv, idx) of displayFeedVersionOptions"
        :key="idx"
        #[`warning-${idx}`]
      >
        <p
          v-if="station != null && fv.id != null && !loading && fv.hasStops === false"
          class="help is-danger"
        >
          No stops in current location
        </p>
        <p
          v-if="station != null && fv.id != null && !loading && fv.hasStops && fv.hasDepartures === false"
          class="help is-danger"
        >
          No departures on {{ scenario?.selectedFeedVersions?.[idx]?.serviceDate }} between {{ scenario?.timeOfDay }}
        </p>
      </template>
    </tl-apps-transfers-feed-version-time-selector>

    <div
      v-if="showTransfers"
      class="columns is-clearfix block"
    >
      <div class="column is-one-third">
        <div class="box">
          <t-field
            label="Walking Profile (Beta)"
            :message="enableProfiles ? undefined : 'GTFS-Pathways data not found in this station area'"
          >
            <t-select
              v-model="profileName"
              :disabled="!enableProfiles"
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
            </t-select>
          </t-field>
          <div class="mt-4">
            <a class="is-size-7" @click="showAdvancedOptions = !showAdvancedOptions">
              <t-icon :icon="showAdvancedOptions ? 'chevron-down' : 'chevron-right'" size="small" /> Advanced options
            </a>
          </div>
          <div v-if="showAdvancedOptions" class="mt-3">
            <t-field label="Time Source" :message="gtfsRealtimeStopObservationsAvailable ? undefined : 'GTFS Realtime stop observations not available'">
              <t-select
                v-model="useStopObservations"
                :disabled="!gtfsRealtimeStopObservationsAvailable"
              >
                <option value="true">
                  Static GTFS &amp; GTFS Realtime schedules
                </option>
                <option value="false">
                  Static GTFS schedule only
                </option>
              </t-select>
            </t-field>
            <p
              v-if="gtfsRealtimeStopObservationsAvailable && scenario?.useStopObservations && !hasAtLeastOneStopObservation && station != null && !loading"
              class="help is-danger"
            >
              No real-time observations found on {{ scenario?.selectedFeedVersions?.[0]?.serviceDate }} between {{ scenario?.timeOfDay }}
            </p>
            <t-checkbox
              :model-value="(scenario?.hideSubsequentTransfers || 0) > 0"
              @update:model-value="(value) => hideSubsequentTransfersChanged(Array.isArray(value) ? false : value)"
            >
              Hide subsequent transfers to the same route &amp; headsign
            </t-checkbox>
          </div>
        </div>
      </div>
      <div class="column is-two-thirds">
        <div class="box">
          <label class="label">Transfer Time Scoring</label>
          <tl-apps-transfers-time-scoring-control
            :transfer-scoring-breakpoints="scenario?.transferScoringBreakpoints || []"
            @changed="transferScoringBreakpointsChanged"
          />
        </div>
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
              <div class="control">
                <t-button size="small" @click="setExcludeIncomingTrips(false, '*')">
                  None
                </t-button>
              </div>
              <div class="control">
                <t-button size="small" @click="setExcludeIncomingTrips(true, '*')">
                  All
                </t-button>
              </div>
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
              <div class="control">
                <t-button size="small" @click="setExcludeOutgoingTrips(false, '*')">
                  None
                </t-button>
              </div>
              <div class="control">
                <t-button size="small" @click="setExcludeOutgoingTrips(true, '*')">
                  All
                </t-button>
              </div>
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
import { Profiles } from '../../../pathways/graph'
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
  readOnlyFeedVersions?: boolean
  gtfsRealtimeStopObservationsAvailable?: boolean
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
  loading: false,
  readOnlyFeedVersions: false,
  gtfsRealtimeStopObservationsAvailable: true
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
const showAdvancedOptions = ref(false)
const profileName = ref<string | null>(props.scenario?.profileName || null)
// If GTFS-RT stop observations not available, force to static only
const useStopObservations = ref<string>(
  props.gtfsRealtimeStopObservationsAvailable
    ? String(props.scenario?.useStopObservations)
    : 'false'
)

watch(() => props.scenario?.selectedFeedVersions, (newVal) => {
  if (newVal) {
    selectedFeedVersions.value = newVal.slice(0)
  }
}, { deep: true, immediate: true })

watch(() => props.scenario?.profileName, (newVal) => {
  profileName.value = newVal || null
})

watch(profileName, (newVal) => {
  emit('setProfileName', newVal)
})

watch(() => props.scenario?.useStopObservations, (newVal) => {
  // Only update if GTFS-RT is available, otherwise keep as static only
  if (props.gtfsRealtimeStopObservationsAvailable) {
    useStopObservations.value = String(newVal)
  }
})

watch(useStopObservations, (newVal) => {
  emit('setUseStopObservations', newVal === 'true')
})

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

// Handle service date updates from the read-only component
function handleServiceDateUpdate (idx: number, serviceDate: string) {
  const fv = selectedFeedVersions.value[idx]
  if (fv) {
    emit('setSelectedFeedVersion', idx, fv.id, serviceDate)
    // Update local state
    selectedFeedVersions.value[idx] = new SelectedFeedVersion({
      id: fv.id,
      serviceDate: serviceDate
    })
  }
}
</script>

<style scoped>
input[type="date"] {
  width: auto;
}
</style>
