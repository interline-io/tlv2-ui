<script lang="ts">
import { defineComponent } from 'vue'
import { gql } from 'graphql-tag'
import { Stop, Station, stationQuery, stationStopQuery, mapLevelKeyFn } from '../station'
import { useToastNotification } from '../../../../composables/useToastNotification'
import type { FeedQueryResponse, StationQueryResponse, StopsQueryResponse } from '../types'

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

function symmetricDifference<T> (setA: Set<T>, setB: Set<T>): Set<T> {
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

export default defineComponent({
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
      error (e: Error) {
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
      update (data: StationQueryResponse) {
        if (data.feed_versions.length === 0) {
          return
        }
        const fv = data.feed_versions[0]
        if (!fv || fv.stops.length === 0) {
          return
        }
        // console.log('station query result:', data.stops)
        this.station = new Station(fv.stops[0])
        const initialStop = new Stop(fv.stops[0])
        if (!initialStop.id) {
          return
        }
        const childIds = (initialStop.children || []).map(s => s.id).filter((id): id is number => id !== undefined)
        this.stopList = [initialStop.id, ...childIds];
        (this.$apollo as any).queries.stationStopsQuery.refetch({ stop_ids: this.stopList })
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
      update (data: StopsQueryResponse) {
        if (!this.station) {
          return
        }
        const a = new Set(this.stopList)
        const newStops = this.station.addStops(data.stops.map((s) => { return new Stop(s) }))
        const b = new Set(newStops)
        const stationStopId = this.station.stop?.id
        if (stationStopId !== undefined) {
          a.add(stationStopId)
          b.add(stationStopId)
        }
        if (symmetricDifference(a, b).size === 0) {
          // console.log('READY!')
          this.ready = true
        } else {
          this.stopList = newStops;
          (this.$apollo as any).queries.stationStopsQuery.refetch({ stop_ids: this.stopList })
        }
      }
    }
  },
  data () {
    return {
      // TODO: Remove after upgrading components to Vue Composition API
      ready: false,
      station: null as Station | null,
      stations: [] as FeedQueryResponse['feed_versions'][0]['stations'],
      stopList: [] as number[],
      selectedAgenciesShadow: null as string[] | null,
      selectedLevelShadow: null as number | null,
      selectedLevelsShadow: null as string[] | null,
      feeds: [] as FeedQueryResponse[],
    }
  },
  computed: {
    feed (): FeedQueryResponse | null {
      if (this.feeds && this.feeds.length > 0) {
        return this.feeds[0] ?? null
      }
      return null
    },
    feedName (): string {
      return this.feed?.name || this.feed?.onestop_id || this.feedKey
    },
    stationName (): string | undefined {
      return this.station?.stop?.stop_name
    },
    feedVersion (): FeedQueryResponse['feed_versions'][0] | null | undefined {
      if (!this.feed?.feed_versions || this.feed.feed_versions.length === 0) {
        return null
      }
      return this.feed.feed_versions[0]
    },
    feedVersionName (): string {
      return String(this.feedVersion?.id || this.feedVersionKey || '').substr(0, 8)
    },
    stopAssociationsEnabled (): boolean {
      return (this.feedVersion?.agencies || []).length === 0
    },
    selectedAgencies: {
      get (): string[] {
        if (this.selectedAgenciesShadow != null) {
          return this.selectedAgenciesShadow
        }
        const allAgencies = new Map<string, boolean>()
        for (const stop of this.station?.stops || []) {
          for (const rs of stop.route_stops || []) {
            if (rs.agency) {
              allAgencies.set(rs.agency.agency_id!, true)
            }
          }
        }
        return Array.from(allAgencies.keys())
      },
      set (v: string[]) {
        this.selectedAgenciesShadow = v
      }
    },
    selectedLevel: {
      get (): number | null {
        if (this.selectedLevelShadow != null) {
          return this.selectedLevelShadow
        }
        return this.station?.levels[0]?.id || null
      },
      set (v: number | null) {
        this.selectedLevelShadow = v
      }
    },
    selectedLevels: {
      get (): string[] {
        if (this.selectedLevelsShadow != null) {
          return this.selectedLevelsShadow
        }
        return this.station?.levels?.map(mapLevelKeyFn) || []
      },
      set (v: string[]) {
        this.selectedLevelsShadow = v
      }
    },
  },
  methods: {
    handleError (response: Response): Promise<unknown> {
      if (!response.ok) {
        console.log('request failed', response)
        throw new Error(response.statusText)
      } else {
        // console.log('request ok')
        return response.json()
      }
    },
    setError (e: Error | string) {
      this.error(e)
    },
    error (error: Error | string) {
      const msg = typeof error === 'string' ? error : (error.message || JSON.stringify(error))
      this.showToast(`Error: ${msg}`, 'danger')
    },
    refetch (): Promise<unknown> {
      console.log('refetch')
      // Apollo is injected at runtime and not part of component type definition
      return (this as any).$apollo.queries.stationQuery.refetch()
    }
  }
})
</script>
