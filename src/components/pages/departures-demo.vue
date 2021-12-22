<template>
  <div>
    <div v-if="stops.length >0">
      <div class="columns">
        <div class="column">
          <tl-map-viewer
            :key="mapUpdate"
            v-if="routeFeatures.length > 0"
            :stop-features="stopFeatures"
            :route-features="routeFeatures"
            :center="point.coordinates"
            :zoom="15"
            :auto-fit="false"
          />
        </div>
        <div class="column">
          <h1 class="title">
            Departures
          </h1>
          <b-autocomplete
            placeholder="Search stops. Example: 55657"
            :data="stopSearch"
            @typing="typing"
            max-height="600px"
            :clearable="true"
            icon="magnify"
            @select="option => point = option.geometry"
          >
          <template slot-scope="props">
            {{ props.option.stop_name }}
              <div v-for="rs of props.option.route_stops" class="clearfix tag" :key="rs.route.id">
                {{ rs.route.agency.agency_name}} :{{ rs.route.route_short_name }}
              </div>
          </template>
        </b-autocomplete>        

          <div v-for="ss of filteredStopsGroupRoutes" :key="ss.stop.id">
            <h3 class="title">
              {{ ss.stop.stop_name }} <span class="tag">{{ haversine(point, ss.stop.geometry).toFixed(0) }}m</span>
            </h3>
            <!-- <span class="tag">{{ ss.stop.onestop_id }}</span> -->
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
          <b-message v-if="debug">
            Stops
            <ul>
              <li v-for="stop of stopFeatures" :key="stop.id" style="padding-left:30px">
                {{ stop.properties.onestop_id }}
              </li>
            </ul>

            Routes
            <ul>
              <li v-for="route of routeFeatures" :key="route.id" style="padding-left:30px">
                {{ route.properties.onestop_id }}
              </li>
            </ul>
          </b-message>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Filters from './../filters'
import haversine from 'haversine'
import gql from 'graphql-tag'

const stopSearchQuery = gql`
query($search: String!) {
  stops(limit: 100, where:{stop_code:$search}) {
    id
    geometry
    onestop_id
    stop_name
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
            geometry         
        }
      }
    }
  }
}
`

// const COORDS = [-73.99278044700623, 40.750231790306195]
// const COORDS = [-122.27159857749938, 37.80365531892627]
// const COORDS = [-73.989066, 40.752997]
const COORDS = [-122.2374379634857, 37.77057904551523]

export default {
  mixins: [Filters],
  data () {
    return {
      linkVersion: false,
      search: '',
      stopSearch: [],
      stops: [],
      minSearchLength: 4,
      timezone: 'America/Los_Angeles',
      debug: false,
      point: {
        type: 'Point',
        coordinates: COORDS
      }
    }
  },
  computed: {
    filteredStops () {
      return this.stops.filter((s) => {
        return s.stop_times.length > 0
      }).sort((a, b) => {
        const ad = this.haversine(this.point, a.geometry)
        const bd = this.haversine(this.point, b.geometry)
        return ad - bd
      })
    },
    stopFeatures () {
      return this.filteredStops.map((s) => {
        return {
          id: s.id,
          type: 'Feature',
          properties: { stop_name: s.stop_name, onestop_id: s.onestop_id },
          geometry: s.geometry
        }
      })
    },
    mapUpdate () {
      return this.stopFeatures.map((s)=>{return s.id}).join(",")
    },
    routeFeatures () {
      const rmap = new Map()
      for (const stop of this.filteredStops) {
        for (const st of stop.stop_times) {
          const r = st.trip.route
          let routeColor = r.route_color
          if (routeColor && routeColor.substr(0, 1) !== '#') {
            routeColor = '#' + routeColor
          }
          rmap.set(r.id, {
            type: 'Feature',
            id: r.id,
            geometry: r.geometry,
            properties: {
              geometry_length: -1,
              headway_secs: -1,
              onestop_id: r.onestop_id,
              route_id: r.route_id,
              route_color: routeColor,
              route_short_name: r.route_short_name,
              route_long_name: r.route_long_name,
              route_type: r.route_type
            }
          })
        }
      }
      return Array.from(rmap.values())
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
          console.log('rmap:', rmap)
          ret.push({
            stop,
            routes: rmap
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
        console.log(data)
        this.stopSearch = data.stops
      }
    },
    stops: {
      query,
      variables () {
        return {
          nextSeconds:  3600*2,
          timezone: this.timezone,
          where: {
            near: { lon: this.point.coordinates[0], lat: this.point.coordinates[1], radius: 500 }
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
