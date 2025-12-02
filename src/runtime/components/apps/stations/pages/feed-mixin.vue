<script lang="ts">
import { defineComponent } from 'vue'
import { gql } from 'graphql-tag'
import { useToastNotification } from '../../../../composables/useToastNotification'
import type { FeedQueryResponse } from '../types'

const currentFeeds = gql`
query currentFeeds ($feed_onestop_id: String, $feed_version_ids: [Int!]) {
  feeds(limit:1000, where: {onestop_id: $feed_onestop_id, spec: GTFS}) {
    id
    name
    onestop_id
    feed_versions(limit: 2, where: {ids: $feed_version_ids}) {
      file
      sha1
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

export default defineComponent({
  props: {
    feedKey: { type: String, default: null },
    feedVersionKey: { type: String, default: null },
    client: { type: String, default: 'stationEditor' }
  },
  setup () {
    const { showToast } = useToastNotification()
    return { showToast }
  },
  apollo: {
    feeds: {
      client: 'stationEditor',
      query: currentFeeds,
      fetchPolicy: 'cache-and-network',
      error (e: Error) {
        this.error(e)
      },
      variables () {
        return {
          feed_onestop_id: this.feedKey,
          feed_version_ids: this.feedVersionKey ? [this.feedVersionKey] : null
        }
      }
    }
  },
  data () {
    return {
      // TODO: Remove after upgrading components to Vue Composition API
      feeds: [] as FeedQueryResponse[]
    }
  },
  computed: {
    feedVersion (): FeedQueryResponse['feed_versions'][0] | string | null {
      if (this.feed?.feed_versions && this.feed.feed_versions.length > 0) {
        return this.feed.feed_versions[0] ?? this.feedVersionKey
      }
      return this.feedVersionKey
    },
    feed (): FeedQueryResponse | null | undefined {
      return (this.feeds && this.feeds.length === 1) ? this.feeds[0] : null
    },
    feedName (): string | null {
      return this.feed ? (this.feed.name || this.feed.onestop_id) : this.feedKey
    },
    feedVersionName (): string {
      return String((typeof this.feedVersion === 'string' ? null : this.feedVersion?.id) || this.feedVersionKey || '').substr(0, 8)
    },
    stations (): FeedQueryResponse['feed_versions'][0]['stations'] | null {
      return (typeof this.feedVersion !== 'string' && this.feedVersion) ? this.feedVersion.stations : null
    }
  },
  methods: {
    error (error: Error | string) {
      const msg = typeof error === 'string' ? error : (error.message || JSON.stringify(error))
      this.showToast(`Error: ${msg}`, 'danger')
    }
  }
})
</script>
