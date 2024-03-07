<script>
import { gql } from 'graphql-tag'

const currentFeeds = gql`
query currentFeeds ($feed_onestop_id: String, $feed_version_file: String) {
  feeds(limit:1000, where: {onestop_id: $feed_onestop_id, spec: GTFS}) {
    id
    name
    onestop_id
    feed_versions(limit: 10, where: {file: $feed_version_file}) {
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
          feed_onestop_id: this.$route.params.feedKey,
          feed_version_file: this.feedVersionKey
        }
      }
    }
  },
  data () {
    return {
      feeds: []
    }
  },
  computed: {
    feedKey () {
      return this.$route.params.feedKey
    },
    feedVersionKey () {
      return this.$route.params.feedVersionKey
    },
    feed_version () {
      return this.feed && this.feed.feed_versions ? this.feed.feed_versions[0] : null
    },
    feed () {
      return (this.feeds && this.feeds.length === 1) ? this.feeds[0] : null
    },
    feedName () {
      return this.feed ? this.feed.name : null
    },
    stations () {
      return this.feed && this.feed.feed_versions ? this.feed.feed_versions[0].stations : null
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
