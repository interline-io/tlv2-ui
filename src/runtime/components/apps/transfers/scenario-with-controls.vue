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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useQuery } from '@vue/apollo-composable'
import { useMixpanel } from '../../../composables/useMixpanel'
import { useScenarioData } from './useScenarioData'
import {
  SelectedFeedVersion,
  NewScenario,
  TransferOverrides,
  feedVersionDefaultDate,
  analystFeedQuery,
  FeedVersionOption,
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
const mixpanel = useMixpanel()

// State
const feedVersions = ref<any[]>([])
const activeFeedVersionIds = ref<number[]>([])
const error = ref<Error | null>(null)

// Queries
const { result: feedResult, loading: feedLoading, error: feedError } = useQuery(analystFeedQuery,
  () => ({
    geometry: props.stationArea?.geometry
  }),
  () => ({
    enabled: !!props.stationArea?.geometry
  })
)

watch(feedResult, (data) => {
  if (!data) return
  const feeds = data.feeds
  const fvs: any[] = []
  const activeIds: number[] = []
  for (const feed of feeds) {
    if (feed.feed_state?.feed_version?.id) {
      if (feed.feed_state.feed_version.stops && feed.feed_state.feed_version.stops.length > 0) {
        activeIds.push(feed.feed_state.feed_version.id)
      }
    }
    for (const fv of feed.feed_versions) {
      if (fv.feed_version_gtfs_import?.success === true) {
        fvs.push(fv)
      }
    }
  }
  feedVersions.value = fvs
  activeFeedVersionIds.value = activeIds
})

watch(feedError, (e) => {
  if (e) error.value = e
})

// Computed
const scenario = computed<Scenario>(() => {
  const query = route.query as Record<string, any>
  const fvos: any[] = []

  // Process query params
  const paramFvos = (turnStringOrArrayIntoArray(query.selectedFeedVersions) || [])
    .map((s: string) => {
      const a = (s || '').split(':')
      const id = Number.parseInt(a[0] || '0')
      let date = a.length > 1 ? a[1] : undefined

      if (!date) {
        const fv = feedVersions.value.find((f: any) => f.id === id)
        if (fv) {
          date = feedVersionDefaultDate(fv) || undefined
        }
      }

      return new SelectedFeedVersion({
        id: id,
        serviceDate: date || ''
      })
    })

  if (paramFvos.length > 0) {
    fvos.push(...paramFvos)
  } else {
    console.log('Defaulting to active feed versions:', activeFeedVersionIds.value)
    for (const id of activeFeedVersionIds.value) {
      const fv = feedVersions.value.find((f: any) => f.id === id)
      if (fv) {
        console.log('Adding default active feed version:', fv.id, fv.sha1, fv.feed.onestop_id)
        fvos.push(new SelectedFeedVersion({
          id: fv.id,
          serviceDate: feedVersionDefaultDate(fv) || ''
        }))
      }
    }
  }

  // Set transfer scoring breakpoints
  let tsbp: number[] | undefined
  if (query.transferScoringBreakpoints) {
    tsbp = (query.transferScoringBreakpoints as string).split(',').map((s: string) => { return Number.parseInt(s) })
  }

  let useStopObservations = true
  if (query.useStopObservations) {
    useStopObservations = tryBool(query.useStopObservations)
  }

  return NewScenario({
    selectedFeedVersions: fvos,
    timeOfDay: (query.timeOfDay as string) || '05:00-07:00',
    profileName: query.profileName as string | undefined,
    transferScoringBreakpoints: tsbp,
    useStopObservations,
    excludeIncomingTrips: (turnStringOrArrayIntoArray(query.excludeIncomingTrips) || []) as string[],
    excludeOutgoingTrips: (turnStringOrArrayIntoArray(query.excludeOutgoingTrips) || []) as string[],
    hideSubsequentTransfers: tryNumber(query.hideSubsequentTransfers) ?? undefined,
    transferOverrides: new TransferOverrides(query.transferOverrides)
  })
})

// Use Scenario Data Composable
const {
  scenarioResult,
  station,
  displayProfiles,
  loading: dataLoading,
  error: dataError
} = useScenarioData(toRef(props, 'stationArea'), scenario)

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
  console.log('handleSetSelectedFeedVersion:', idx, id, serviceDate)
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
function tryBool (value: string | boolean | undefined | null): boolean {
  if (value === 'false' || value === '') {
    return false
  }
  if (value === 'true' || value === true) {
    return true
  }
  return false
}

function tryNumber (value: string | number | undefined | null): number | null {
  const f = Number(value)
  if (Number.isNaN(f)) {
    return null
  }
  return f
}

function turnStringOrArrayIntoArray (value: string | string[] | null | undefined): string[] | null {
  if (value == null) {
    return null
  }
  if (value === '') {
    return []
  }
  const a = String(value || '').split(',')
  return a.length > 0 ? a : null
}

function removeEmpty<T extends Record<string, any>> (obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => (v !== '' && v != null))
  ) as Partial<T>
}
</script>
