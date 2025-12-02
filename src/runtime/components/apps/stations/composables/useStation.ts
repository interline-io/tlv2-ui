import { ref, computed, watch, type Ref } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { useToastNotification } from '../../../../composables/useToastNotification'
import { Stop, Station, stationQuery, stationStopQuery, mapLevelKeyFn } from '../station'
import type { FeedQueryResponse, StationQueryResponse, StopsQueryResponse } from '../types'

const currentFeedsQuery = gql`
query currentFeeds ($feed_onestop_id: String, $feed_version_ids: [Int!]) {
  feeds(limit:1000, where: {onestop_id: $feed_onestop_id, spec: GTFS}) {
    id
    name
    onestop_id
    feed_versions(limit: 10, where: {ids: $feed_version_ids}) {
      file
      sha1
      id
      agencies {
        id
        agency_id
        agency_name
      }
      stations: stops(limit:1000, where:{location_type:1}) {
        feed_version {
          id
        }
        station_id: stop_id
        stationName: stop_name
        geometry
      }
    }
  }
}
`

function symmetricDifference<T> (setA: Set<T>, setB: Set<T>): Set<T> {
  const _difference = new Set(setA)
  for (const elem of setB) {
    if (_difference.has(elem)) {
      _difference.delete(elem)
    } else {
      _difference.add(elem)
    }
  }
  return _difference
}

export interface UseStationOptions {
  feedKey: Ref<string>
  feedVersionKey: Ref<string>
  stationKey: Ref<string>
  clientId?: string
}

export function useStation (options: UseStationOptions) {
  const { feedKey, feedVersionKey, stationKey, clientId } = options
  const { showToast } = useToastNotification()

  // Reactive state
  const ready = ref(false)
  const station = ref<Station | null>(null)
  const stopList = ref<number[]>([])
  const selectedAgenciesShadow = ref<string[] | null>(null)
  const selectedLevelShadow = ref<number | null>(null)
  const selectedLevelsShadow = ref<string[] | null>(null)

  // Error handler
  const handleError = (err: Error | string) => {
    const msg = typeof err === 'string' ? err : (err.message || JSON.stringify(err))
    showToast(`Error: ${msg}`, 'danger')
  }

  // Query feeds
  const { result: feedsResult, loading: feedsLoading, onError: onFeedsError } = useQuery(
    currentFeedsQuery,
    () => ({
      feed_onestop_id: feedKey.value,
      feed_version_ids: feedVersionKey.value ? [feedVersionKey.value] : null
    }),
    () => ({
      ...(clientId && { clientId }),
      fetchPolicy: 'network-only'
    })
  )

  onFeedsError(handleError)

  const feeds = computed(() => feedsResult.value?.feeds || [])
  const feed = computed<FeedQueryResponse | null>(() => {
    return feeds.value.length > 0 ? feeds.value[0] : null
  })

  const feedVersion = computed<FeedQueryResponse['feed_versions'][0] | null | undefined>(() => {
    if (!feed.value?.feed_versions || feed.value.feed_versions.length === 0) {
      return null
    }
    return feed.value.feed_versions[0]
  })

  const feedName = computed(() => {
    return feed.value?.name || feed.value?.onestop_id || feedKey.value
  })

  const feedVersionName = computed(() => {
    return String(feedVersion.value?.id || feedVersionKey.value || '').substr(0, 8)
  })

  const stationName = computed(() => {
    return station.value?.stop?.stop_name
  })

  const stopAssociationsEnabled = computed(() => {
    return (feedVersion.value?.agencies || []).length === 0
  })

  // Query station
  const { result: stationResult, loading: stationLoading, onError: onStationError, refetch: refetchStation } = useQuery(
    stationQuery,
    () => ({
      feed_version_ids: feedVersionKey.value ? [feedVersionKey.value] : null,
      feed_onestop_id: feedKey.value,
      stop_id: stationKey.value
    }),
    () => ({
      ...(clientId && { clientId }),
      fetchPolicy: 'network-only'
    })
  )

  onStationError(handleError)

  // Watch station query result
  watch(stationResult, (data: StationQueryResponse | undefined) => {
    if (!data || data.feed_versions.length === 0) {
      return
    }
    const fv = data.feed_versions[0]
    if (!fv || fv.stops.length === 0) {
      return
    }
    station.value = new Station(fv.stops[0])
    const initialStop = new Stop(fv.stops[0])
    if (!initialStop.id) {
      return
    }
    const childIds = (initialStop.children || []).map(s => s.id).filter((id): id is number => id !== undefined)
    stopList.value = [initialStop.id, ...childIds]
  })

  // Query station stops (cascading query)
  const { result: stopsResult, loading: stopsLoading, onError: onStopsError, refetch: refetchStops } = useQuery(
    stationStopQuery,
    () => ({
      stop_ids: stopList.value
    }),
    () => ({
      ...(clientId && { clientId }),
      fetchPolicy: 'network-only',
      enabled: stopList.value.length > 0
    })
  )

  onStopsError(handleError)

  // Watch stops query result and cascade if needed
  watch(stopsResult, (data: StopsQueryResponse | undefined) => {
    if (!data || !station.value) {
      return
    }
    const a = new Set(stopList.value)
    const newStops = station.value.addStops(data.stops.map(s => new Stop(s)))
    const b = new Set(newStops)
    const stationStopId = station.value.stop?.id
    if (stationStopId !== undefined) {
      a.add(stationStopId)
      b.add(stationStopId)
    }
    if (symmetricDifference(a, b).size === 0) {
      ready.value = true
    } else {
      stopList.value = newStops
      refetchStops({ stop_ids: newStops })
    }
  })

  // Computed properties for selected agencies
  const selectedAgencies = computed({
    get (): string[] {
      if (selectedAgenciesShadow.value != null) {
        return selectedAgenciesShadow.value
      }
      const allAgencies = new Map<string, boolean>()
      for (const stop of station.value?.stops || []) {
        for (const rs of stop.route_stops || []) {
          if (rs.agency) {
            allAgencies.set(rs.agency.agency_id!, true)
          }
        }
      }
      return Array.from(allAgencies.keys())
    },
    set (v: string[]) {
      selectedAgenciesShadow.value = v
    }
  })

  // Computed properties for selected level
  const selectedLevel = computed({
    get (): number | null {
      if (selectedLevelShadow.value != null) {
        return selectedLevelShadow.value
      }
      return station.value?.levels[0]?.id || null
    },
    set (v: number | null) {
      selectedLevelShadow.value = v
    }
  })

  // Computed properties for selected levels
  const selectedLevels = computed({
    get (): string[] {
      if (selectedLevelsShadow.value != null) {
        return selectedLevelsShadow.value
      }
      return station.value?.levels?.map(mapLevelKeyFn) || []
    },
    set (v: string[]) {
      selectedLevelsShadow.value = v
    }
  })

  const loading = computed(() => {
    return feedsLoading.value || stationLoading.value || stopsLoading.value
  })

  const refetch = () => {
    return refetchStation()
  }

  return {
    // State
    ready,
    station,
    feeds,
    feed,
    feedVersion,
    feedName,
    feedVersionName,
    stationName,
    stopAssociationsEnabled,
    loading,

    // Selection state
    selectedAgencies,
    selectedLevel,
    selectedLevels,

    // Methods
    handleError,
    refetch
  }
}
