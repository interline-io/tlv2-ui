import { ref, computed, watch, type Ref } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import {
  analystFeedQuery,
  feedVersionDefaultDate,
  SelectedFeedVersion
} from './scenario'
import type { StationHub } from './types'

export function useFeedVersions (stationArea: Ref<StationHub>) {
  const feedVersions = ref<any[]>([])
  const activeFeedVersionIds = ref<number[]>([])
  const error = ref<Error | null>(null)

  const { result: feedResult, loading: feedLoading, error: feedError } = useQuery(analystFeedQuery,
    () => ({
      geometry: stationArea.value?.geometry
    }),
    () => ({
      enabled: !!stationArea.value?.geometry
    })
  )

  watch(() => stationArea.value, () => {
    feedVersions.value = []
    activeFeedVersionIds.value = []
  })

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

  const defaultSelectedFeedVersions = computed<SelectedFeedVersion[]>(() => {
    const defaults: SelectedFeedVersion[] = []

    // 1. Try active feed versions
    for (const id of activeFeedVersionIds.value) {
      const fv = feedVersions.value.find((f: any) => f.id === id)
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
      const sorted = feedVersions.value.slice(0).sort((a: any, b: any) => {
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
