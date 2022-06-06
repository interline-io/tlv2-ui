<template>
  <div style="position:relative">
    <div>
      <tl-feed-version-map-viewer
        :route-ids="routeIds"
        :include-stops="true"
        :zoom="15"
        :auto-fit="false"
        :center="currentCoords"
        :overlay="false"
      />
      <div class="departure-panel">
        <section>
          <b-field grouped>
            <b-autocomplete
              expanded
              placeholder="Search stops. Example: 55657"
              :data="stopSearch"
              max-height="600px"
              :clearable="true"
              icon="magnify"
              @typing="typing"
              @select="option => coords = option.geometry.coordinates"
            >
              <template slot-scope="props">
                {{ props.option.stop_name }}
                <div v-for="rs of props.option.route_stops" :key="rs.route.id" class="clearfix tag">
                  {{ rs.route.agency.agency_name }} :{{ rs.route.route_short_name }}
                </div>
              </template>
            </b-autocomplete>
            <div>
              <span v-if="!useGeolocation" class="button" @click="useGeolocation = true"><b-icon icon="crosshairs" /></span>
              <span v-if="useGeolocation && $geolocation.loading" class="button"><b-icon icon="loading" /></span>
              <span v-else-if="useGeolocation && !$geolocation.loading" class="button"><b-icon icon="crosshairs-gps" /></span>
            </div>
          </b-field>
        </section>

        <br>

        <div v-for="ss of filteredStopsGroupRoutes" :key="ss.stop.id">
          <h3 v-if="!collapseStops" class="title">
            <b-icon icon="pin" />
            {{ ss.stop.stop_name }}
          </h3>
          <b-field v-if="debug" grouped group-multiline>
            <div class="control">
              <b-taglist attached>
                <b-tag type="is-dark">
                  distance
                </b-tag>
                <b-tag>
                  {{ haversine(currentPoint, ss.stop.geometry).toFixed(0) }}m
                </b-tag>
              </b-taglist>
            </div>
            <div class="control">
              <b-taglist v-if="ss.stop.stop_code" attached>
                <b-tag type="is-dark">
                  stop code
                </b-tag>
                <b-tag>{{ ss.stop.stop_code }}</b-tag>
              </b-taglist>
            </div>
          </b-field>

          <div v-for="sr of ss.routes" :key="sr.id" class="is-clearfix">
            <div
              class="is-pulled-left"
            >
              <nuxt-link
                :to="{name:'routes-onestop_id', params:{onestop_id:sr.route.onestop_id}}"
              >
                <tl-route-icon
                  :key="sr.route.id"
                  :route-type="sr.route.route_type"
                  :route-short-name="sr.route.route_short_name"
                  :route-long-name="sr.trip_headsign || sr.route.route_long_name"
                  :route-link="sr.route.route_url"
                />
              </nuxt-link>
            </div>
            <div class="is-pulled-right">
              <b-field grouped group-multiline style="padding-top:20px">
                <b-tag v-for="st of sr.departures.slice(0,3)" :key="st.trip.id">
                  <template v-if="st.departure.estimated">
                    {{ st.departure.estimated | reformatHMS }} <b-icon type="is-danger" size="is-small" icon="wifi" />
                  </template><template v-else>
                    {{ st.departure.scheduled | reformatHMS }}
                  </template>
                </b-tag>
              </b-field>
            </div>
          </div>
          <hr>
        </div>
        <br><br>
        <div v-if="debug">
          <b-message>
            Stops: <br>{{ stopOnestopIds }}
          </b-message>
          <b-message>
            Routes: <br>{{ routeOnestopIds }}
          </b-message>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import haversine from 'haversine'
import { gql } from 'graphql-tag'
import Filters from './../filters'

const stopSearchQuery = gql`
query($search: String!) {
  stops(limit: 100, where:{stop_code:$search}) {
    id
    geometry
    onestop_id
    stop_name
    stop_code
    route_stops {
      route {
        id
        route_short_name
        route_long_name
        agency {
          id
          agency_name
        }
      }
    }
  }
}
`

const query = gql`
query( $where: StopFilter, $nextSeconds: Int!) {
  # $serviceDate: Date, $startTime: Int, $endTime: Int, 
  stops(where: $where) {
    id
    onestop_id
    stop_id
    stop_name
    stop_code
    geometry
    stop_times(
      where: {
        next: $nextSeconds
      }
    ) {
      arrival_time
      arrival {
        delay
        estimated
        estimated_utc
        scheduled
        stop_timezone
        uncertainty
      }
      departure_time
      departure {
        delay
        estimated
        estimated_utc
        scheduled
        stop_timezone
        uncertainty
      }
      trip {
        id
        trip_id
        trip_headsign
        route {
            id
            onestop_id
            route_short_name
            route_long_name
            route_color
            route_text_color
            route_type
            route_url
        }
      }
    }
  }
}
`

// const COORDS = [-71.324620, 42.615878]
// const COORDS = [-87.636559, 41.878857]
// const COORDS = [-73.99278044700623, 40.750231790306195]
const COORDS = [-122.27159857749938, 37.80365531892627]
// const COORDS = [-73.989066, 40.752997]
// const COORDS = [-122.2374379634857, 37.77057904551523]

export default {
  mixins: [Filters],
  layout: 'map',
  data () {
    return {
      search: '',
      stopSearch: [],
      stops: [],
      minSearchLength: 4,
      debug: false,
      useGeolocation: false,
      radius: 500,
      defaultCoords: COORDS,
      coords: null,
      showStopInfo: false,
      collapseStops: true
    }
  },
  computed: {
    currentCoords () {
      if (this.coords) {
        return this.coords
      }
      if (this.useGeolocation && this.$geolocation.coords) {
        return [this.$geolocation.coords.longitude, this.$geolocation.coords.latitude]
      }
      return this.defaultCoords
    },
    currentPoint () {
      return {
        type: 'Point',
        coordinates: this.currentCoords
      }
    },
    filteredStops () {
      return this.stops.filter((s) => {
        return s.stop_times.length > 0
      }).sort((a, b) => {
        const ad = this.haversine(this.currentPoint, a.geometry)
        const bd = this.haversine(this.currentPoint, b.geometry)
        return ad - bd
      })
    },
    mapUpdate () {
      return 0
    },
    routeIds () {
      if (this.filteredStops.length === 0) {
        return []
      }
      const rmap = new Map()
      for (const stop of this.filteredStops) {
        for (const st of stop.stop_times) {
          rmap.set(st.trip.route.id, true)
        }
      }
      return Array.from(rmap.keys())
    },
    routeOnestopIds () {
      if (this.filteredStops.length === 0) {
        return []
      }
      const rmap = new Map()
      for (const stop of this.filteredStops) {
        for (const st of stop.stop_times) {
          rmap.set(st.trip.route.onestop_id, true)
        }
      }
      return Array.from(rmap.keys())
    },
    stopIds () {
      const rmap = new Set(this.filteredStops.map((s) => { return s.id }))
      return Array.from(rmap)
    },
    stopOnestopIds () {
      const rmap = new Set(this.filteredStops.map((s) => { return s.onestop_id }))
      return Array.from(rmap)
    },
    filteredStopsGroupRoutes () {
      const tripKeys = new Set()
      const ret = []
      // group stops
      const stopGroups = {}
      for (const stop of this.filteredStops) {
        console.log(stop.stop_name)
        const key = this.collapseStops ? '' : stop.id
        const g = stopGroups[key] || { id: stop.id, stop_name: stop.stop_name, stop_id: stop.stop_id, stop_times: [] }
        g.stop_times = g.stop_times.concat(stop.stop_times)
        stopGroups[key] = g
      }
      for (const stop of Object.values(stopGroups)) {
        const rmap = {}
        // sort stop times
        const sortedSt = stop.stop_times.sort((a, b) => {
          const aa = a.departure.estimated || a.departure.scheduled
          const bb = b.departure.estimated || b.departure.scheduled
          if (aa > bb) {
            return 1
          }
          if (aa < bb) {
            return -1
          }
          return 0
        })
        for (const st of sortedSt) {
          const r = st.trip.route
          const hs = st.trip.trip_headsign
          const key = `${r.id}:${hs}`
          if (tripKeys.has(key)) {
            continue
          }
          const a = rmap[key] || { id: r.id, trip_headsign: hs, route: r, departures: [] }
          a.departures.push(st)
          rmap[key] = a
        }
        for (const k of Object.keys(rmap)) {
          tripKeys.add(k)
        }
        if (Object.keys(rmap).length > 0) {
          ret.push({
            stop,
            routes: Object.values(rmap)
          })
        }
      }
      return ret
    }
  },
  methods: {
    typing (val) {
      if (val.length >= this.minSearchLength) {
        this.search = val
      }
    },
    haversine (fromPoint, toPoint) {
      const d = haversine({
        latitude: fromPoint.coordinates[1],
        longitude: fromPoint.coordinates[0]
      }, {
        latitude: toPoint.coordinates[1],
        longitude: toPoint.coordinates[0]
      }, { unit: 'meter' })
      return d
    }
  },
  apollo: {
    stopSearchQuery: {
      query: stopSearchQuery,
      skip () {
        return this.search.length < this.minSearchLength
      },
      variables () {
        return {
          search: this.search
        }
      },
      update (data) {
        this.stopSearch = data.stops
      }
    },
    stops: {
      query,
      variables () {
        const cc = this.currentCoords
        const radius = this.radius
        return {
          nextSeconds: 3600 * 2,
          timezone: this.timezone,
          where: {
            near: { lon: cc[0], lat: cc[1], radius }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.departure-panel {
  position: absolute;
  left:10px;
  top:10px;
  background:#ffffff;
  width:600px;
  opacity:0.8;

}
.tag {
  margin-right:5px;
}
h3 {
    font-size:18pt;
    margin:0px;
    margin-top:10px;
}
.route-icon {
  width:300px;
  white-space:nowrap;
  overflow:hidden;
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 90%, rgba(0,0,0,0));
}
</style>
