<template>
  <div v-if="loading">
    <slot name="loading">
      Loading...
    </slot>
  </div>
  <div v-else>
    <tl-apps-transfers-scenario-controls
      v-if="showControls"
      :feed-version-options="feedVersionOptions"
      :scenario="(scenario as Scenario)"
      :scenario-result="(scenarioResult as ScenarioResult)"
      :loading="loading"
      :station="station"
      :show-transfers="showTransferControls"
      :enable-profiles="displayProfiles"
      :show-trips="showTripControls"
      :read-only-feed-versions="readOnlyFeedVersions"
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
    <t-notification
      v-if="error"
      variant="danger"
    >
      Error loading data: {{ error.message }}
    </t-notification>
    <slot
      v-else
      :scenario="scenario"
      :scenario-result="scenarioResult"
      :station="station"
      :feed-version-options="feedVersionOptions"
      :display-profiles="displayProfiles"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useMixpanel } from '../../../composables/useMixpanel'
import { useScenarioData } from './useScenarioData'
import { useFeedVersions } from './useFeedVersions'
import {
  SelectedFeedVersion,
  FeedVersionOption,
  parseScenarioFromUrl,
  type Scenario,
  type ScenarioResult
} from './scenario'
import type { StationHub } from './types'

interface Props {
  stationArea: StationHub
  showControls?: boolean
  showTransferControls?: boolean
  showTripControls?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showControls: true,
  showTransferControls: false,
  showTripControls: false
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

// Use read-only feed selector if configured in module options
const readOnlyFeedVersions = computed(() => {
  return runtimeConfig.public.tlv2?.transferAnalystReadOnlyFeedSelector === true
})
const mixpanel = useMixpanel()

// State
const {
  feedVersions,
  defaultSelectedFeedVersions,
  loading: feedLoading,
  error: feedError
} = useFeedVersions(toRef(props, 'stationArea'))

const error = ref<Error | null>(null)

watch(feedError, (e) => {
  if (e) error.value = e
})

// Computed
const scenario = computed<Scenario>(() => {
  const query = route.query as Record<string, any>
  return parseScenarioFromUrl(query, feedVersions.value, defaultSelectedFeedVersions.value)
})

// Use Scenario Data Composable
const {
  scenarioResult,
  station,
  loading: dataLoading,
  error: dataError
} = useScenarioData(toRef(props, 'stationArea'), scenario)

const displayProfiles = computed<boolean>(() => {
  return !!station.value
    && station.value.pathways.filter((s) => { return (s.id || 0) > 0 }).length > 0
    && scenario.value.selectedFeedVersions.length === 1
})

const loading = computed(() => dataLoading.value || feedLoading.value)

watch(dataError, (e) => {
  if (e) error.value = e
})

const feedVersionOptions = computed<FeedVersionOption[]>(() => {
  if (!station.value) return []

  const fvHasStops = new Map()
  for (const stop of station.value.stops) {
    fvHasStops.set(stop.feed_version.id, true)
  }
  const fvHasDepartures = new Map()
  if (scenarioResult.value) {
    for (const d of scenarioResult.value.outgoingDepartures) {
      fvHasDepartures.set(d.trip.feed_version.id, true)
    }
  }
  const defaultHasStops = (station.value.stops.length === 0)
  const defaultHasDepartures = (station.value.stops.length === 0)

  // sort and filter - most recent first
  const fvs = feedVersions.value.slice(0).sort((a: any, b: any) => {
    return a.fetched_at > b.fetched_at ? -1 : 1
  })
  const ret: any[] = []
  for (const fv of fvs) {
    ret.push(new FeedVersionOption({
      feedVersion: fv,
      hasStops: fvHasStops.get(fv.id) || defaultHasStops,
      hasDepartures: fvHasDepartures.get(fv.id) || defaultHasDepartures
    }))
  }
  // Shared feed versions logic removed as per previous refactor in scenario-data
  return ret
})

function mixpanelLogScenario (): void {
  if (!scenario.value) return
  const sfvs = scenario.value.selectedFeedVersions
  const fvos = new Map()
  for (const fvo of feedVersionOptions.value) {
    fvos.set(fvo.id, fvo)
  }
  const stationName = props.stationArea.properties.name || 'custom'
  mixpanel.track('Run analyst report', {
    'fv-ids': sfvs.map((sfv: any) => { return sfv.id }),
    'service-dates': sfvs.map((sfv: any) => { return sfv.serviceDate }),
    'fv-full-names': sfvs.map((sfv: any) => { return fvos.get(sfv.id)?.displayName }),
    'feed-ids': sfvs.map((sfv: any) => { return fvos.get(sfv.id)?.feedOnestopId }),
    'report-name': route.name || '',
    'station-name': stationName,
    'station-id': props.stationArea.properties?.id || ''
  })
}

// Log scenario when data is ready and scenario changes significantly (e.g. initial load or parameter change)
watch(scenario, (newVal) => {
  mixpanelLogScenario()

  // Persist default feed versions to URL if not present
  if (!route.query.selectedFeedVersions && newVal.selectedFeedVersions.length > 0) {
    const q = { ...route.query }
    q.selectedFeedVersions = newVal.selectedFeedVersions.map((fvo) => {
      return `${fvo.id}:${fvo.serviceDate}`
    })
    navigateTo({ query: q, replace: true })
  }
}, { deep: true })

function handleSetExcludeIncomingTrips (val: string[]) {
  navigateTo({
    query: { ...route.query, excludeIncomingTrips: val.join(',') }
  })
}

function handleSetExcludeOutgoingTrips (val: string[]) {
  navigateTo({
    query: { ...route.query, excludeOutgoingTrips: val.join(',') }
  })
}

function handleSetTransferScoringBreakpoints (val: number[]) {
  navigateTo({
    query: { ...route.query, transferScoringBreakpoints: val.join(',') }
  })
}

function handleSetTimeOfDay (val: string) {
  navigateTo({
    query: { ...route.query, timeOfDay: val }
  })
}

function handleSetSelectedFeedVersion (idx: number, id: number | null, serviceDate: string | null) {
  const fvos = new Map()
  for (const fvo of feedVersionOptions.value) {
    fvos.set(fvo.id, fvo)
  }

  const prevFvos = scenario.value?.selectedFeedVersions.slice(0) || []
  const idxFvo = new SelectedFeedVersion({
    id: id ?? 0,
    serviceDate: serviceDate ?? undefined
  })

  const newFvos = prevFvos.map((fvo, i) => {
    if (i !== idx) {
      return fvo
    }
    const newFvo = new SelectedFeedVersion({
      id: idxFvo.id || fvo.id,
      serviceDate: idxFvo.serviceDate || fvo.serviceDate
    })
    mixpanel.track('Modify analyst report: Set feed version', {
      'fv-id': newFvo.id,
      'service-date': newFvo.serviceDate,
      'fv-full-name': fvos.get(newFvo.id)?.displayName,
      'feed-id': fvos.get(newFvo.id)?.feedOnestopId,
      'station-name': props.stationArea.properties.name,
      'station-id': props.stationArea.properties.id
    })
    return newFvo
  })

  const add = (idx > prevFvos.length - 1)
  const remove = (!id && !serviceDate)
  const defaultDate = newFvos.length > 0 ? newFvos[0]?.serviceDate : undefined
  idxFvo.serviceDate = idxFvo.serviceDate || defaultDate || ''

  if (add) {
    mixpanel.track('Modify analyst report: Add feed version', {
      'fv-id': idxFvo.id,
      'service-date': idxFvo.serviceDate,
      'fv-full-name': fvos.get(idxFvo.id)?.displayName,
      'feed-id': fvos.get(idxFvo.id)?.feedOnestopId,
      'station-name': props.stationArea.properties.name,
      'station-id': props.stationArea.properties.id
    })
    newFvos.push(idxFvo)
  } else if (remove) {
    const removeFdo = newFvos[idx]
    if (removeFdo) {
      mixpanel.track('Modify analyst report: Remove feed version', {
        'fv-id': removeFdo.id,
        'service-date': removeFdo.serviceDate,
        'fv-full-name': fvos.get(removeFdo.id)?.displayName,
        'feed-id': fvos.get(removeFdo.id)?.feedOnestopId,
        'station-name': props.stationArea.properties.name,
        'station-id': props.stationArea.properties.id
      })
      newFvos.splice(idx, 1)
    }
  }

  const qstr = newFvos.map((s: any) => { return `${s.id}:${s.serviceDate || ''}` }).join(',')
  navigateTo({
    query: removeEmpty({
      ...route.query,
      selectedFeedVersions: qstr,
      excludeIncomingTrips: undefined,
      excludeOutgoingTrips: undefined
    })
  })
}

function handleSetProfileName (val: string | null) {
  navigateTo({
    query: { ...route.query, profileName: val }
  })
}

function handleSetUseStopObservations (val: boolean) {
  navigateTo({
    query: { ...route.query, useStopObservations: String(val) }
  })
}

function handleSetHideSubsequentTransfers (val: number | string) {
  const nvString = (Number(val) > 0 ? String(val) : '')
  navigateTo({
    query: { ...route.query, hideSubsequentTransfers: nvString }
  })
}

function handleSetError (val: string) {
  error.value = new Error(val)
}

// Helper functions
function removeEmpty<T extends Record<string, any>> (obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => (v !== '' && v !== null && v !== undefined))
  ) as Partial<T>
}
</script>
