<template>
  <div v-if="isLoading">
    <slot name="loading">
      Loading...
    </slot>
  </div>
  <slot v-else />
</template>

<script lang="ts">
import type { PropType } from 'vue'
import { navigateTo, useAuthHeaders } from '#imports'
import {
  TransferOverrides,
  FeedVersionOption,
  SelectedFeedVersion,
  NewScenario,
  NewScenarioResult,
  feedVersionDefaultDate,
  analystFeedQuery,
  analystStopQuery,
  scenarioStopStopTimesQuery,
  type Scenario,
  type ScenarioResult
} from './scenario'
import { windowToSeconds } from '../utils/time-format'
import type { StationHub } from './types'
import {
  Station,
  Stop,
  addStreetPathways
} from './station'
import { useApiEndpoint } from '../../composables/useApiEndpoint'
import { useMixpanel } from '../../composables/useMixpanel'

interface AnalystScenarioDataState {
  feedVersions: any[]
  sharedFeedVersions: any[]
  stopStopTimes: any[]
  stops: Stop[]
  moreLoading: boolean
  stopLimit: number
  error: Error | null
  loading: boolean
}

export default {
  props: {
    stationHubs: { type: Array as PropType<StationHub[]>, default: () => [] },
    stationArea: { type: Object as PropType<StationHub>, required: true }
  },
  emits: [
    'dataReady',
    'setTimeOfDay',
    'setProfileName',
    'setUseStopObservations',
    'setSelectedFeedVersion',
    'setExcludeIncomingTrips',
    'setExcludeOutgoingTrips',
    'setHideSubsequentTransfers',
    'setTransferScoringBreakpoints',
    'setTransferOverride'
  ],
  data (): AnalystScenarioDataState {
    return {
      feedVersions: [],
      sharedFeedVersions: [],
      stopStopTimes: [],
      stops: [],
      moreLoading: false,
      stopLimit: 1000,
      error: null,
      loading: false
    }
  },
  apollo: {
    analystFeedQuery: {
      query: analystFeedQuery,
      error (this: any, e: Error) {
        this.setError(e)
      },
      update (this: any, data: any) {
        const feeds = data.feeds
        const fvs: any[] = []
        for (const feed of feeds) {
          for (const fv of feed.feed_versions) {
            if (fv.feed_version_gtfs_import?.success === true) {
              fvs.push(fv)
            }
          }
        }
        this.feedVersions = fvs
      }
    },
    analystStopQuery: {
      query: analystStopQuery,
      error (this: any, e: Error) {
        this.setError(e)
      },
      skip (this: any): boolean {
        return !this.stationArea || !this.stationArea.geometry || this.scenario?.selectedFeedVersions.length === 0
      },
      variables (this: any): { feed_version_ids: number[], geometry: any } {
        return {
          feed_version_ids: this.scenario?.selectedFeedVersions.map((s: any) => {
            return s.id
          }).filter((s: any) => { return s }),
          geometry: this.stationArea?.geometry
        }
      },
      update (this: any, data: any) {
        const ret: Stop[] = []
        for (const fv of data.feed_versions) {
          for (const stop of fv.stops) {
            ret.push(new Stop(stop))
          }
        }
        this.stops = ret
        this.fetchMore(0)
      }
    },
    stopStopTimes: {
      query: scenarioStopStopTimesQuery,
      error (this: any, e: Error) {
        this.setError(e)
      },
      variables (): { stop_ids: number[], service_date: string, start_time: number, end_time: number } {
        return {
          stop_ids: [0],
          service_date: '2023-01-01',
          start_time: 0,
          end_time: 0
        }
      }
    }
  } as any,
  computed: {
    isLoading () {
      return this.loading || this.moreLoading || (this as any).$apollo.loading
    },
    scenario (): Scenario {
      const query = (this as any).$route.query as Record<string, any>

      // Convert fvs to fvos
      const rgFvos = this.feedVersions
        .slice(0)
        .filter((a: any) => { return a.feed.onestop_id === 'RG' })
        .map((fv: any) => {
          return new SelectedFeedVersion({
            id: fv.id,
            serviceDate: feedVersionDefaultDate(fv) || ''
          })
        })
      const defaultFvo = rgFvos.length > 0 && rgFvos ? rgFvos[0] : undefined
      const fvos: any[] = []

      // Process query params
      const paramFvos = (turnStringOrArrayIntoArray(query.selectedFeedVersions) || [])
        .map((s: string) => {
          const a = (s || '').split(':')
          return new SelectedFeedVersion({
            id: Number.parseInt(a[0] || '0'),
            serviceDate: a.length > 1 ? a[1] : (defaultFvo?.serviceDate)
          })
        })

      if (paramFvos.length > 0) {
        fvos.push(...paramFvos)
      } else if (rgFvos.length > 0) {
        fvos.push(rgFvos[0])
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
    },
    scenarioResult (): ScenarioResult {
      return NewScenarioResult(this.scenario, this.station, this.stopStopTimes)
    },
    station (): Station {
      // Convert to a "Stop-like" representation
      const sa = {
        properties: { ...this.stationArea.properties, id: 0 },
        geometry: { type: 'Point' as const, coordinates: [0, 0] as [number, number] }
      }
      const st = new Station(sa)
      st.addStops(this.stops as any)
      if (this.scenario.allowFuzzyMatching) {
        addStreetPathways(st)
      }
      return st
    },
    displayProfiles (): boolean {
      return this.station
        && this.station.pathways.filter((s) => { return (s.id || 0) > 0 }).length > 0
        && this.scenario.selectedFeedVersions.length === 1
    },
    feedVersionOptions (): FeedVersionOption[] {
      const fvHasStops = new Map()
      for (const stop of this.station.stops) {
        fvHasStops.set(stop.feed_version.id, true)
      }
      const fvHasDepartures = new Map()
      for (const d of this.scenarioResult.outgoingDepartures) {
        fvHasDepartures.set(d.trip.feed_version.id, true)
      }
      const defaultHasStops = (this.station.stops.length === 0)
      const defaultHasDepartures = (this.station.stops.length === 0)

      // sort and filter - most recent first
      const fvs = this.feedVersions.slice(0).sort((a: any, b: any) => {
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
      for (const fv of this.sharedFeedVersions) {
        ret.push(new FeedVersionOption({
          hasStops: fvHasStops.get(fv.id) || defaultHasStops,
          hasDepartures: fvHasDepartures.get(fv.id) || defaultHasDepartures,
          feedVersion: {
            ...fv,
            id: fv.id || 0,
            feed: fv.feed || { onestop_id: fv.feed_onestop_id || 'unknown' }
          } as any
        }))
      }
      return ret
    }
  },
  watch: {
    '$route.query.timeOfDay' () {
      this.fetchMore(0)
    },
    '$route.query.selectedFeedVersions' () {
      this.fetchMore(0)
    },
    scenario: {
      handler () {
        this.emitDataReady()
      },
      deep: true
    },
    scenarioResult: {
      handler () {
        this.emitDataReady()
      },
      deep: true
    },
    station: {
      handler () {
        this.emitDataReady()
      },
      deep: true
    },
    loading () {
      this.emitDataReady()
    },
    moreLoading () {
      this.emitDataReady()
    }
  },
  mounted () {
    this.getSharedFeedVersions()
    this.emitDataReady()
  },
  methods: {
    emitDataReady () {
      this.$emit('dataReady', {
        scenario: this.scenario,
        scenarioResult: this.scenarioResult,
        station: this.station,
        feedVersionOptions: this.feedVersionOptions,
        displayProfiles: this.displayProfiles,
        stops: this.stops,
        loading: this.loading || this.moreLoading || (this as any).$apollo.loading,
        error: this.error
      })
    },
    handleError (response: Response): Promise<any> {
      if (!response.ok) {
        console.log('request failed', response, 'text:', response.statusText)
        throw new Error(response.statusText)
      } else {
        return response.json()
      }
    },
    setError (e: Error): void {
      this.error = e
      this.moreLoading = false
    },
    async getSharedFeedVersions (): Promise<void> {
      await fetch(useApiEndpoint('/admin/feed_versions'), {
        headers: await useAuthHeaders()
      })
        .then(this.handleError)
        .then((data: any) => {
          this.sharedFeedVersions = data?.feed_versions || []
        })
        .catch((e: Error) => {
          this.error = e
        })
    },
    mixpanelLogScenario (): void {
      const sfvs = this.scenario.selectedFeedVersions
      const fvos = new Map()
      for (const fvo of this.feedVersionOptions) {
        fvos.set(fvo.id, fvo)
      }
      const stationName = this.stationArea.properties.name || 'custom'
      useMixpanel().track('Run analyst report', {
        'fv-ids': sfvs.map((sfv: any) => { return sfv.id }),
        'service-dates': sfvs.map((sfv: any) => { return sfv.serviceDate }),
        'fv-full-names': sfvs.map((sfv: any) => { return fvos.get(sfv.id)?.displayName }),
        'feed-ids': sfvs.map((sfv: any) => { return fvos.get(sfv.id)?.feedOnestopId }),
        'report-name': (this as any).$route.name || '',
        'station-name': stationName,
        'station-id': this.stationArea.properties?.id || ''
      })
    },
    fetchMore (page: number): void {
      if (page === 0) {
        this.moreLoading = true
        this.stopStopTimes = []
        this.mixpanelLogScenario()
      }
      const thisFvo = this.scenario.selectedFeedVersions[page]
      if (!thisFvo) {
        this.moreLoading = false
        return
      }
      const stopGroups: Record<number, number[]> = {}
      for (const stop of this.station.stops || []) {
        if (stop.location_type !== 0) {
          continue
        }
        const fvId = stop.feed_version.id
        if (fvId === undefined) continue
        const a = stopGroups[fvId] || []
        const stopId = stop.id
        if (stopId !== undefined) {
          a.push(stopId)
        }
        stopGroups[fvId] = a
      }
      const tw = windowToSeconds(this.scenario.timeOfDay)
      if (!(this as any).$apollo.queries.stopStopTimes) {
        this.moreLoading = false
        return
      }
      const maxBefore = Math.min(...this.scenario.transferScoringBreakpoints)
      const maxAfter = Math.max(...this.scenario.transferScoringBreakpoints)
      const thisFvoId = thisFvo.id
      if (thisFvoId === undefined) {
        this.moreLoading = false
        return
      }
      ;(this as any).$apollo.queries.stopStopTimes.fetchMore({
        variables: {
          service_date: thisFvo.serviceDate,
          stop_ids: stopGroups[thisFvoId] || [0],
          start_time: tw[0] + maxBefore,
          end_time: tw[1] + maxAfter
        },
        updateQuery: (previousResult: any, { fetchMoreResult }: any) => {
          let prev: any[] = []
          if (page > 0) {
            prev = previousResult.stopStopTimes
          }
          this.fetchMore(page + 1)
          this.stopStopTimes = [...prev, ...fetchMoreResult.stopStopTimes]
          return {
            stopStopTimes: this.stopStopTimes
          }
        }
      })
        .catch((e: Error) => {
          this.setError(e)
        })
    },
    handleSetExcludeIncomingTrips (val: string[]): void {
      navigateTo({
        query: { ...((this as any).$route.query), excludeIncomingTrips: val.join(',') }
      })
    },
    handleSetExcludeOutgoingTrips (val: string[]): void {
      navigateTo({
        query: { ...((this as any).$route.query), excludeOutgoingTrips: val.join(',') }
      })
    },
    handleSetSelectedFeedVersion (idx: number, id: number | null, serviceDate: string | null): void {
      console.log('handleSetSelectedFeedVersion:', idx, id, serviceDate)
      const fvos = new Map()
      for (const fvo of this.feedVersionOptions) {
        fvos.set(fvo.id, fvo)
      }

      const prevFvos = this.scenario.selectedFeedVersions.slice(0)
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
        useMixpanel().track('Modify analyst report: Set feed version', {
          'fv-id': newFvo.id,
          'service-date': newFvo.serviceDate,
          'fv-full-name': fvos.get(newFvo.id)?.displayName,
          'feed-id': fvos.get(newFvo.id)?.feedOnestopId,
          'station-name': this.stationArea.properties.name,
          'station-id': this.stationArea.properties.id
        })
        return newFvo
      })

      const add = (idx > prevFvos.length - 1)
      const remove = (!id && !serviceDate)
      const defaultDate = newFvos.length > 0 ? newFvos[0]?.serviceDate : undefined
      idxFvo.serviceDate = idxFvo.serviceDate || defaultDate || ''

      if (add) {
        useMixpanel().track('Modify analyst report: Add feed version', {
          'fv-id': idxFvo.id,
          'service-date': idxFvo.serviceDate,
          'fv-full-name': fvos.get(idxFvo.id)?.displayName,
          'feed-id': fvos.get(idxFvo.id)?.feedOnestopId,
          'station-name': this.stationArea.properties.name,
          'station-id': this.stationArea.properties.id
        })
        newFvos.push(idxFvo)
      } else if (remove) {
        const removeFdo = newFvos[idx]
        if (removeFdo) {
          useMixpanel().track('Modify analyst report: Remove feed version', {
            'fv-id': removeFdo.id,
            'service-date': removeFdo.serviceDate,
            'fv-full-name': fvos.get(removeFdo.id)?.displayName,
            'feed-id': fvos.get(removeFdo.id)?.feedOnestopId,
            'station-name': this.stationArea.properties.name,
            'station-id': this.stationArea.properties.id
          })
          newFvos.splice(idx, 1)
        }
      }

      const qstr = newFvos.map((s: any) => { return `${s.id}:${s.serviceDate || ''}` }).join(',')
      navigateTo({
        query: removeEmpty({
          ...((this as any).$route.query),
          selectedFeedVersions: qstr,
          excludeIncomingTrips: undefined,
          excludeOutgoingTrips: undefined
        })
      })
    },
    handleSetHideSubsequentTransfers (newValue: number | string): void {
      const nvString = (Number(newValue) > 0 ? String(newValue) : '')
      navigateTo({
        query: { ...((this as any).$route.query), hideSubsequentTransfers: nvString }
      })
    },
    handleSetTransferScoringBreakpoints (newValue: number[]): void {
      navigateTo({
        query: { ...((this as any).$route.query), transferScoringBreakpoints: newValue.join(',') }
      })
    },
    handleSetTimeOfDay (newValue: string): void {
      navigateTo({
        query: { ...((this as any).$route.query), timeOfDay: newValue }
      })
    },
    handleSetProfileName (newValue: string | null): void {
      navigateTo({
        query: { ...((this as any).$route.query), profileName: newValue }
      })
    },
    handleSetUseStopObservations (newValue: boolean): void {
      navigateTo({
        query: { ...((this as any).$route.query), useStopObservations: String(newValue) }
      })
    },
    handleSetTransferOverride (newValue: string): void {
      navigateTo({
        query: { ...((this as any).$route.query), transferOverrides: newValue }
      })
    }
  }
}

/**
 * Remove empty string and null values from an object
 */
export function removeEmpty<T extends Record<string, any>> (obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => (v !== '' && v != null))
  ) as Partial<T>
}

/**
 * Try to convert a value to a boolean
 * @param value - Value to convert
 * @returns Boolean value
 */
export function tryBool (value: string | boolean | undefined | null): boolean {
  if (value === 'false' || value === '') {
    return false
  }
  if (value === 'true' || value === true) {
    return true
  }
  return false
}

/**
 * Try to convert a value to a number
 * @param value - Value to convert
 * @returns Number or null if conversion fails
 */
export function tryNumber (value: string | number | undefined | null): number | null {
  const f = Number(value)
  if (Number.isNaN(f)) {
    return null
  }
  return f
}

/**
 * Convert a string or array into an array
 * @param value - Comma-separated string or array
 * @returns Array of strings or null
 */
export function turnStringOrArrayIntoArray (value: string | string[] | null | undefined): string[] | null {
  if (value == null) {
    return null
  }
  if (value === '') {
    return []
  }
  const a = String(value || '').split(',')
  return a.length > 0 ? a : null
}
</script>
