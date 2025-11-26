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
    for (const id of activeFeedVersionIds.value) {
      const fv = feedVersions.value.find((f: any) => f.id === id)
      if (fv) {
        defaults.push(new SelectedFeedVersion({
          id: fv.id,
          serviceDate: feedVersionDefaultDate(fv) || ''
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
