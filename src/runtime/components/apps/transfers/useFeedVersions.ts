import { computed, type Ref } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import {
  analystFeedQuery,
  feedVersionDefaultDate,
  SelectedFeedVersion,
  type FeedVersionData,
  type AnalystFeedQueryResponse
} from './scenario'
import type { StationHub } from './types'

export function useFeedVersions (stationArea: Ref<StationHub>) {
  const error = computed<Error | null>(() => feedError.value || null)

  const { result: feedResult, loading: feedLoading, error: feedError } = useQuery<AnalystFeedQueryResponse>(analystFeedQuery,
    () => ({
      geometry: stationArea.value?.geometry
    }),
    () => ({
      enabled: !!stationArea.value?.geometry
    })
  )

  // Derive feedVersions directly from query result - no intermediate ref needed
  const feedVersions = computed<FeedVersionData[]>(() => {
    const data = feedResult.value
    if (!data) return []
    const fvs: FeedVersionData[] = []
    for (const feed of data.feeds) {
      for (const fv of feed.feed_versions) {
        if (fv.feed_version_gtfs_import?.success === true) {
          fvs.push(fv)
        }
      }
    }
    return fvs
  })

  // Derive active feed version IDs from query result
  const activeFeedVersionIds = computed<number[]>(() => {
    const data = feedResult.value
    if (!data) return []
    const activeIds: number[] = []
    for (const feed of data.feeds) {
      if (feed.feed_state?.feed_version?.id) {
        // Note: The 'stops' field is not strictly typed in FeedData yet, but exists in the query
        const fv = feed.feed_state.feed_version as any
        if (fv.stops && fv.stops.length > 0) {
          activeIds.push(fv.id)
        }
      }
    }
    return activeIds
  })

  const defaultSelectedFeedVersions = computed<SelectedFeedVersion[]>(() => {
    const defaults: SelectedFeedVersion[] = []
    // 1. Try active feed versions
    for (const id of activeFeedVersionIds.value) {
      const fv = feedVersions.value.find(f => f.id === id)
      if (fv) {
        defaults.push(new SelectedFeedVersion({
          id: fv.id,
          serviceDate: feedVersionDefaultDate(fv) || ''
        }))
      }
    }

    // 2. If no active feed versions, try to find ANY feed version that serves this station
    // Note: We don't have explicit "stops" info for all feed versions in the list,
    // but we can try to pick the most recent one as a fallback if the active one is missing/broken.
    // However, without knowing if it has stops, it's risky.
    // But if activeFeedVersionIds is empty, it means NO active feed has stops in this geometry.
    // So we are likely in a state where we need to pick *something*.

    if (defaults.length === 0 && feedVersions.value.length > 0) {
      // Sort by fetched_at desc
      const sorted = feedVersions.value.slice(0).sort((a, b) => {
        return a.fetched_at > b.fetched_at ? -1 : 1
      })
      const latest = sorted[0]
      if (latest) {
        defaults.push(new SelectedFeedVersion({
          id: latest.id,
          serviceDate: feedVersionDefaultDate(latest) || ''
        }))
      }
    }
    return defaults
  })

  return {
    feedVersions,
    activeFeedVersionIds,
    defaultSelectedFeedVersions,
    loading: feedLoading,
    error
  }
}
