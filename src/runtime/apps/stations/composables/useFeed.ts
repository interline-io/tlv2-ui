import { computed, type Ref } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { useToastNotification } from '../../../composables/useToastNotification'
import type { FeedQueryResponse } from '../types'

const currentFeedsQuery = gql`
query currentFeeds ($feed_onestop_id: String, $feed_version_ids: [Int!]) {
  feeds(limit:1000, where: {onestop_id: $feed_onestop_id, spec: GTFS}) {
    id
    name
    onestop_id
    feed_versions(limit: 10, where: {ids: $feed_version_ids}) {
      file
      sha1
      name
      description
      id
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

export interface UseFeedOptions {
  feedKey?: Ref<string | undefined>
  feedVersionKey?: Ref<string | undefined>
  clientId?: string
}

export function useFeed (options: UseFeedOptions) {
  const { feedKey, feedVersionKey, clientId } = options
  const { showToast } = useToastNotification()

  // Apollo query using useQuery from @vue/apollo-composable
  const { result, loading, error, onError } = useQuery(
    currentFeedsQuery,
    () => ({
      feed_onestop_id: feedKey?.value || undefined,
      feed_version_ids: feedVersionKey?.value ? [feedVersionKey.value] : null
    }),
    () => ({
      ...(clientId && { clientId }),
      fetchPolicy: 'cache-and-network'
    })
  )

  // Handle errors
  onError((err) => {
    const msg = err.message || JSON.stringify(err)
    showToast(`Error: ${msg}`, 'danger')
  })

  // Reactive state
  const feeds = computed(() => result.value?.feeds || [])

  // Computed properties
  const feed = computed<FeedQueryResponse | null | undefined>(() => {
    return (feeds.value && feeds.value.length === 1) ? feeds.value[0] : null
  })

  const feedVersion = computed<FeedQueryResponse['feed_versions'][0] | string | null | undefined>(() => {
    if (feed.value?.feed_versions && feed.value.feed_versions.length > 0) {
      return feed.value.feed_versions[0] ?? feedVersionKey?.value
    }
    return feedVersionKey?.value
  })

  const feedName = computed<string | null | undefined>(() => {
    return feed.value ? (feed.value.name || feed.value.onestop_id) : feedKey?.value
  })

  const feedVersionName = computed<string>(() => {
    return String((typeof feedVersion.value === 'string' ? null : feedVersion.value?.id) || feedVersionKey?.value || '').substr(0, 8)
  })

  const stations = computed<FeedQueryResponse['feed_versions'][0]['stations'] | null>(() => {
    return (typeof feedVersion.value !== 'string' && feedVersion.value) ? feedVersion.value.stations : null
  })

  return {
    // Reactive state
    feeds,
    loading,
    error,

    // Computed properties
    feed,
    feedVersion,
    feedName,
    feedVersionName,
    stations
  }
}
