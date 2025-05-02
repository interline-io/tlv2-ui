<script>
import { gql } from 'graphql-tag'

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

export default {
  apollo: {
    feeds: {
      client: 'transitland',
      query: currentFeeds,
      fetchPolicy: 'cache-and-network',
      error (e) {
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
  props: {
    feedKey: { type: String, default: null },
    feedVersionKey: { type: String, default: null }
  },
  data () {
    return {
      feeds: []
    }
  },
  computed: {
    feedVersion () {
      return this.feed && this.feed.feed_versions ? this.feed.feed_versions[0] : this.feedVersionKey
    },
    feed () {
      return (this.feeds && this.feeds.length === 1) ? this.feeds[0] : null
    },
    feedName () {
      return this.feed ? (this.feed.name || this.feed.onestop_id) : this.feedKey
    },
    feedVersionName () {
      return String(this.feedVersion?.id || this.feedVersionKey || '').substr(0, 8)
    },
    stations () {
      return this.feedVersion ? this.feedVersion.stations : null
    }
  },
  methods: {
    error (error) {
      const msg = error.message ? error.message : JSON.stringify(error)
      this.$oruga.notification.open({
        message: `Error: ${msg}`,
        indefinite: true,
        rootClass: 'toast-notification',
        variant: 'danger',
        closable: true,
        position: 'top'
      })
    }
  }
}
</script>
