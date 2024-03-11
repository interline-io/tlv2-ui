<script>
import { gql } from 'graphql-tag'
import { Stop, Station, stationQuery, stationStopQuery } from '../station'

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
}`

function symmetricDifference (setA, setB) {
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

export default {
  apollo: {
    feeds: {
      client: 'transitland',
      query: currentFeeds,
      fetchPolicy: 'network-only',
      error (e) {
        this.error(e)
      },
      variables () {
        return {
          feed_onestop_id: this.feedKey,
          feed_version_file: this.feedVersionKey
        }
      }
    },
    stationQuery: {
      client: 'transitland',
      query: stationQuery,
      fetchPolicy: 'network-only',
      variables () {
        return {
          feed_version_file: this.feedVersionKey,
          feed_onestop_id: this.feedKey,
          stop_id: this.stationKey
        }
      },
      update (data) {
        if (data.feed_versions.length === 0) {
          return
        }
        const fv = data.feed_versions[0]
        if (fv.stops.length === 0) {
          return
        }
        // console.log('station query result:', data.stops)
        this.station = new Station(fv.stops[0])
        const initialStop = new Stop(fv.stops[0])
        this.stopList = [...initialStop.children.map((s) => { return s.id })]
        this.$apollo.queries.stationStopsQuery.refetch({ stop_ids: this.stopList })
      }
    },
    stationStopsQuery: {
      client: 'transitland',
      query: stationStopQuery,
      fetchPolicy: 'network-only',
      skip () { return this.stopList.length === 0 },
      variables () {
        return {
          stop_ids: []
        }
      },
      update (data) {
        const a = new Set(this.stopList)
        const newStops = this.station.addStops(data.stops.map((s) => { return new Stop(s) }))
        const b = new Set(newStops)
        if (symmetricDifference(a, b).size === 0) {
          // console.log('READY!')
          this.ready = true
        } else {
          this.stopList = newStops
          this.$apollo.queries.stationStopsQuery.refetch({ stop_ids: this.stopList })
        }
      }
    }
  },
  props: {
    feedKey: { type: String, default: '', required: true },
    feedVersionKey: { type: String, default: '', required: true },
    stationKey: { type: String, default: '' },
    levelKey: { type: String, default: '' }
  },
  data () {
    return {
      ready: false,
      station: null,
      stations: [],
      stopList: []
    }
  },
  computed: {
    feed () {
      return this.feeds && this.feeds.length === 1 ? this.feeds[0] : null
    },
    feedName () {
      return this.feed ? this.feed.name : null
    },
    feed_version() {
      return this.feed?.feed_versions[0]
    },
    stationName () {
      return this.station ? this.station.stop.stop_name : null
    },
    stopIndex () {
      const a = new Map()
      if (!this.station) {
        return a
      }
      for (const stop of this.station.stops) {
        a.set(stop.id, stop)
      }
      return a
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
    },
    refetch () {
      console.log('refetch')
      return this.$apollo.queries.stationQuery.refetch()
    }
  }
}
</script>
