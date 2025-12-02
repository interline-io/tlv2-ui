<script>
import { gql } from 'graphql-tag'
import { Stop, Station, stationQuery, stationStopQuery, mapLevelKeyFn } from '../station'
import { useToastNotification } from '../../../../composables/useToastNotification'

const currentFeeds = gql`
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
  props: {
    feedKey: { type: String, default: '' },
    feedVersionKey: { type: String, default: '' },
    stationKey: { type: String, default: '' },
    levelKey: { type: String, default: '' },
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
      fetchPolicy: 'network-only',
      error (e) {
        this.error(e)
      },
      variables () {
        return {
          feed_onestop_id: this.feedKey,
          feed_version_ids: this.feedVersionKey ? [this.feedVersionKey] : null
        }
      }
    },
    stationQuery: {
      client: 'stationEditor',
      query: stationQuery,
      fetchPolicy: 'network-only',
      variables () {
        return {
          feed_version_ids: this.feedVersionKey ? [this.feedVersionKey] : null,
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
        this.stopList = [initialStop.id, ...initialStop.children.map((s) => { return s.id })]
        this.$apollo.queries.stationStopsQuery.refetch({ stop_ids: this.stopList })
      }
    },
    stationStopsQuery: {
      client: 'stationEditor',
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
        a.add(this.station.stop.id)
        b.add(this.station.stop.id)
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
  data () {
    return {
      // TODO: Remove after upgrading components to Vue Composition API
      ready: false,
      station: null,
      stations: [],
      stopList: [],
      selectedAgenciesShadow: null,
      selectedLevelShadow: null,
      selectedLevelsShadow: null,
    }
  },
  computed: {
    feed () {
      return this.feeds?.length > 0 ? this.feeds[0] : null
    },
    feedName () {
      return this.feed?.name || this.feed?.onestop_id || this.feedKey
    },
    stationName () {
      return this.station?.stop?.stop_name
    },
    feedVersion () {
      return this.feed?.feed_versions?.length > 0 ? this.feed.feed_versions[0] : null
    },
    feedVersionName () {
      return String(this.feedVersion?.id || this.feedVersionKey || '').substr(0, 8)
    },
    stopAssociationsEnabled () {
      return (this.feedVersion?.agencies || []).length === 0
    },
    selectedAgencies: {
      get () {
        if (this.selectedAgenciesShadow != null) {
          return this.selectedAgenciesShadow
        }
        const allAgencies = new Map()
        for (const stop of this.station?.stops || []) {
          for (const rs of stop.route_stops || []) {
            if (rs.agency) {
              allAgencies.set(rs.agency.agency_id, true)
            }
          }
        }
        return Array.from(allAgencies.keys())
      },
      set (v) {
        this.selectedAgenciesShadow = v
      }
    },
    selectedLevel: {
      get () {
        if (this.selectedLevelShadow != null) {
          return this.selectedLevelShadow
        }
        return this.station?.levels[0]?.id || null
      },
      set (v) {
        this.selectedLevelShadow = v
      }
    },
    selectedLevels: {
      get () {
        if (this.selectedLevelsShadow != null) {
          return this.selectedLevelsShadow
        }
        return this.station?.levels?.map(mapLevelKeyFn) || []
      },
      set (v) {
        this.selectedLevelsShadow = v
      }
    },
  },
  methods: {
    handleError (response) {
      if (!response.ok) {
        console.log('request failed', response)
        throw new Error(response.statusText)
      } else {
        // console.log('request ok')
        return response.json()
      }
    },
    setError (e) {
      this.error(e)
    },
    error (error) {
      const msg = error.message ? error.message : JSON.stringify(error)
      this.showToast(`Error: ${msg}`, 'danger')
    },
    refetch () {
      console.log('refetch')
      return this.$apollo.queries.stationQuery.refetch()
    }
  }
}
</script>
