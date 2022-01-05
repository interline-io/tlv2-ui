<template>
  <div>
    <div v-if="stops.length >0">
      <div class="columns">
        <div class="column">
          <tl-feed-version-map-viewer
            :route-ids="routeIds"
            :include-stops="true"
            :zoom="15"
            :auto-fit="false"
            :center="currentCoords"
            :overlay="true"
          />
        </div>
        <div class="column">
          <h1 class="title">
            Departures
          </h1>
          <section>
            <b-field grouped label="Location">
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
            <h3 class="title">
              {{ ss.stop.stop_name }} {{ ss.stop.onestop_id }} {{ ss.stop.id }}
              <span class="tag">{{ haversine(currentPoint, ss.stop.geometry).toFixed(0) }}m</span>
              <span class="tag">{{ ss.stop.stop_code }}</span>
            </h3>
            <div v-for="sr of ss.routes" :key="sr.id" class="clearfix">
              <span class="is-pulled-left">
                <nuxt-link
                  :to="{name:'routes-onestop_id', params:{onestop_id:sr.route.onestop_id}}"
                >
                  <tl-route-icon
                    :key="sr.route.id"
                    :route-type="sr.route.route_type"
                    :route-short-name="sr.route.route_short_name"
                    :route-long-name="sr.route.route_long_name"
                    :route-link="sr.route.route_url"
                  />
                </nuxt-link>
                <!-- <span class="tag trip-headsign">{{ sr.route.onestop_id }}</span> -->
                <span class="tag">{{ sr.trip_headsign }}</span>
              </span>
              <span class="departure-times is-pulled-right">
                <span v-for="st of sr.departures" :key="st.trip.id" class="departure">
                  {{ st.departure_time | reformatHMS }}
                </span>
              </span>
            </div>
          </div>
          <br><br>
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
query( $where: StopFilter,  $timezone: String, $nextSeconds: Int) {
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
        timezone: $timezone
        next: $nextSeconds
      }
    ) {
      arrival_time
      departure_time
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

const COORDS = [-73.99278044700623, 40.750231790306195]
// const COORDS = [-122.27159857749938, 37.80365531892627]
// const COORDS = [-73.989066, 40.752997]
// const COORDS = [-122.2374379634857, 37.77057904551523]

export default {
  mixins: [Filters],
  data () {
    return {
      search: '',
      stopSearch: [],
      stops: [],
      minSearchLength: 4,
      timezone: 'America/Los_Angeles',
      debug: false,
      useGeolocation: false,
      radius: 500,
      defaultCoords: COORDS,
      coords: null
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
    stopIds () {
      const rmap = new Set(this.filteredStops.map((s) => { return s.id }))
      return Array.from(rmap)
    },
    filteredStopsGroupRoutes () {
      const tripKeys = new Set()
      const ret = []
      for (const stop of this.filteredStops) {
        const rmap = {}
        for (const st of stop.stop_times) {
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
.departure-times {
    padding-top:20px;
    font-weight:bold;
}
.departure {
    border-right:solid 2px #ccc;
    margin:0px;
    padding:0px;
    padding-right:10px;
    margin-right:10px;
}
h3 {
    font-size:18pt;
    margin:0px;
    margin-top:10px;
}
</style>
