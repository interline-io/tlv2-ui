import { ref, computed, watch, type Ref } from 'vue'
import { useQuery, useApolloClient } from '@vue/apollo-composable'
import {
  NewScenarioResult,
  analystStopQuery,
  scenarioStopStopTimesQuery,
  type Scenario,
  type ScenarioResult,
  type StopStopTimesData,
  type ScenarioStopStopTimesQueryResponse,
  type AnalystStopQueryResponse
} from './scenario'
import { windowToSeconds } from '../../utils/time-format'
import type { StationHub } from './types'
import {
  Station,
  Stop,
  addStreetPathways
} from './station'

export function useScenarioData (
  stationArea: Ref<StationHub>,
  scenario: Ref<Scenario>
) {
  // State
  const stopStopTimes = ref<StopStopTimesData[]>([])
  const stops = ref<Stop[]>([])
  const moreLoading = ref(false)
  const error = ref<Error | null>(null)

  const { client } = useApolloClient()

  // Helpers
  const setError = (e: Error) => {
    error.value = e
    moreLoading.value = false
  }

  // Queries

  // Analyst Stop Query
  const { result: stopResult, loading: stopLoading, error: stopError } = useQuery<AnalystStopQueryResponse>(analystStopQuery,
    () => {
      const ids = scenario.value?.selectedFeedVersions.map((s: any) => {
        return s.id
      }).filter((s: any) => { return s != null })
      return {
        feed_version_ids: ids,
        geometry: stationArea.value?.geometry
      }
    },
    () => ({
      enabled: !!stationArea.value?.geometry && scenario.value.selectedFeedVersions.length > 0
    })
  )

  // Computed
  const isLoading = computed(() => {
    return moreLoading.value || stopLoading.value
  })

  const station = computed<Station>(() => {
    // Convert to a "Stop-like" representation
    const sa = {
      properties: { ...stationArea.value.properties, id: 0 },
      geometry: { type: 'Point' as const, coordinates: [0, 0] as [number, number] }
    }
    const st = new Station(sa)
    st.addStops(stops.value as any)
    if (scenario.value.allowFuzzyMatching) {
      addStreetPathways(st)
    }
    return st
  })

  const scenarioResult = computed<ScenarioResult>(() => {
    return NewScenarioResult(scenario.value, station.value, stopStopTimes.value)
  })

  const fetchScenarioData = async (page: number): Promise<void> => {
    if (page === 0) {
      moreLoading.value = true
      stopStopTimes.value = []
    }

    const promises = scenario.value.selectedFeedVersions.map(async (thisFvo) => {
      if (!thisFvo || !thisFvo.id) return null

      const stopGroups: Record<number, number[]> = {}
      for (const stop of station.value.stops || []) {
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

      const tw = windowToSeconds(scenario.value.timeOfDay)
      if (!tw) return null
      const startTime = tw[0]
      const endTime = tw[1]

      const maxBefore = Math.min(...scenario.value.transferScoringBreakpoints)
      const maxAfter = Math.max(...scenario.value.transferScoringBreakpoints)
      const thisFvoId = thisFvo.id

      return client.query<ScenarioStopStopTimesQueryResponse>({
        query: scenarioStopStopTimesQuery,
        variables: {
          service_date: thisFvo.serviceDate,
          stop_ids: stopGroups[thisFvoId] || [0],
          start_time: startTime + maxBefore,
          end_time: endTime + maxAfter
        }
      })
    })

    try {
      const results = await Promise.all(promises)
      const newStopStopTimes: StopStopTimesData[] = []
      for (const result of results) {
        if (result && result.data && result.data.stopStopTimes) {
          newStopStopTimes.push(...result.data.stopStopTimes)
        }
      }
      stopStopTimes.value = newStopStopTimes
    } catch (e: any) {
      setError(e)
    } finally {
      moreLoading.value = false
    }
  }

  watch(stopResult, (data) => {
    if (!data) return
    const ret: Stop[] = []
    for (const fv of data.feed_versions) {
      for (const stop of fv.stops) {
        ret.push(new Stop(stop))
      }
    }
    stops.value = ret
    fetchScenarioData(0)
  }, { immediate: true })

  watch(stopError, (e) => {
    if (e) setError(e)
  })

  // Watchers
  watch(scenario, () => {
    if (stops.value.length > 0) {
      fetchScenarioData(0)
    }
  }, { deep: true })

  return {
    scenarioResult,
    station,
    stops,
    loading: isLoading,
    error,
    fetchMore: fetchScenarioData
  }
}
