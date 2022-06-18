<template>
  <div>
    <div v-if="$apollo.loading && stops.length === 0">
      <!-- "double buffer" -->
      <h6 class="title is-6">
        Loading
      </h6>
    </div>
    <div v-else-if="error">
      <b-notification type="is-danger" style="margin:10px" :closable="false" :has-icon="true">
        {{ error }}
      </b-notification>
    </div>
    <div v-else-if="!searchCoords && stopIds.length === 0">
      <h6 class="title is-6">
        Click on the map to select a location
      </h6>
    </div>
    <div v-else>
      <div class="search-options">
        <b-field grouped>
          <b-field v-if="showDateSelector">
            <b-datetimepicker
              v-model="displayStartDate"
              horizontal-time-picker
              placeholder="Now"
              icon="calendar-today"
              trap-focus
              size="is-small"
            />
          </b-field>

          <b-field v-if="showRadiusSelector">
            <b-select v-model="radius" size="is-small">
              <option v-for="r of allowedRadius" :key="r" :value="r">
                {{ r }}m
              </option>
            </b-select>
            <p class="control button-like-small" style="padding-left:10px">
              Radius
            </p>
          </b-field>

          <b-checkbox v-if="showAutoRefresh" v-model="autoRefresh" size="is-small">
            Auto-refresh
          </b-checkbox>

          <b-checkbox v-if="showFallbackSelector" v-model="useServiceWindow" size="is-small">
            Fallback service day
          </b-checkbox>
        </b-field>
      </div>
      <div v-if="filteredStopsGroupRoutes.length === 0">
        <h6 class="title is-6">
          No results
        </h6>
        <div>Unfortunately, no departures were found at this location for the selected location and time. Try increasing the search radius or selecting the "fallback service day" option.</div>
      </div>
      <div v-else>
        <div v-for="(ss, sskey) of filteredStopsGroupRoutes" :key="sskey">
          <h6 class="title is-6">
            {{ ss.agency.agency_name }}
          </h6>
          <div v-for="(sr,srkey) of ss.routes.slice(0,routesPerAgencyShadow)" :key="srkey" class="is-clearfix">
            <div
              class="is-pulled-left route-icon-fade-out"
            >
              <nuxt-link
                :to="{name:'routes-onestop_id', params:{onestop_id:sr.route.onestop_id}}"
              >
                <tl-route-icon
                  :key="'icon'+sr.route.id"
                  :route-type="sr.route.route_type"
                  :route-short-name="sr.route.route_short_name"
                  :route-long-name="sr.trip_headsign || sr.route.route_long_name"
                  :route-link="sr.route.route_url"
                />
              </nuxt-link>
            </div>
            <div class="is-pulled-right route-icon-departures">
              <b-field grouped group-multiline>
                <b-tag v-for="st of sr.departures.slice(0,3)" :key="st.trip.id">
                  <template v-if="st.departure.estimated">
                    {{ st.departure.estimated | reformatHMS }} <b-icon type="is-success" size="is-small" icon="wifi" />
                  </template><template v-else>
                    {{ st.departure.scheduled | reformatHMS }}
                  </template>
                </b-tag>
              </b-field>
            </div>
          </div>
          <div v-if="ss.routes.length > routesPerAgencyShadow" class="is-clearfix">
            <span class="button is-small" style="margin-left:30px" @click="expandRoutesPerAgency">Click to show {{ ss.routes.length - routesPerAgencyShadow }} additional rows</span>
          </div>
        </div>
      </div>
    </div>
    <div v-if="lastFetched" :key="lastFetchedDisplayKey" class="last-fetched">
      Last checked: {{ lastFetched | fromNowDate }}
    </div>
  </div>
</template>

<script>
import haversine from 'haversine'
import { gql } from 'graphql-tag'
import Filters from './filters'

const query = gql`
query( $stopIds: [Int!], $where: StopFilter, $stwhere: StopTimeFilter, $includeGeometry: Boolean! = false) {
  stops(where: $where, ids: $stopIds) {
    id
    onestop_id
    stop_id
    stop_name
    stop_code
    geometry
    route_stops {
      route {
        id
        route_id
        route_short_name
        route_long_name
        route_type
        route_color
        route_text_color
        geometry @include(if:$includeGeometry)
      }
    }
    departures(where: $stwhere) {
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
            agency {
              id
              agency_id
              agency_name
            }            
        }
      }
    }
  }
}
`

export default {
  mixins: [Filters],
  layout: 'map',
  props: {
    searchCoords: { type: Array, default () { return null } },
    nextSeconds: { type: Number, default () { return 7200 } },
    routesPerAgency: { type: Number, default () { return 10 } },
    showDateSelector: { type: Boolean, default () { return false } },
    showRadiusSelector: { type: Boolean, default () { return false } },
    showFallbackSelector: { type: Boolean, default () { return false } },
    showAutoRefresh: { type: Boolean, default () { return false } },
    showLastFetched: { type: Boolean, default () { return false } },
    autoRefreshInterval: { type: Number, default () { return 60 } },
    stopIds: { type: Array, default () { return [] } }
  },
  apollo: {
    departureQuery: {
      query,
      skip () { return !this.searchCoords && this.stopIds.length === 0 },
      variables () {
        const q = {
          stwhere: {
            use_service_window: this.useServiceWindow,
            next: this.nextSeconds
          }
        }
        if (this.stopIds.length > 0) { q.stopIds = this.stopIds }
        if (this.searchCoords) { q.where = { near: { lon: this.searchCoords[0], lat: this.searchCoords[1], radius: this.radius } } }
        return q
      },
      update (data) {
        this.resetTimer()
        this.stops = data.stops
        this.lastFetched = new Date()
      },
      error (e) {
        this.error = e
      }
    }
  },
  data () {
    return {
      timer: null,
      error: null,
      lastFetched: null,
      lastFetchedDisplayKey: 0, // force redraw
      autoRefresh: true,
      useServiceWindow: false,
      displayStartDate: null,
      allowedRadius: [0, 50, 100, 150, 200, 500, 1000],
      routesPerAgencyShadow: this.routesPerAgency,
      stops: [],
      debug: false,
      radius: 100
    }
  },
  computed: {
    routeFeatures () {
      const features = new Map()
      for (const stop of this.stops || []) {
        for (const rs of stop.route_stops) {
          const route = rs.route
          if (features.has(route.id)) {
            continue
          }
          let routeColor = route.route_color
          if (routeColor && routeColor.substr(0, 1) !== '#') {
            routeColor = '#' + routeColor
          }
          features.set(route.id,
            {
              type: 'Feature',
              geometry: route.geometry,
              properties: {
                id: route.id,
                route_short_name: route.route_short_name,
                route_long_name: route.route_long_name,
                route_type: route.route_type,
                route_color: routeColor,
                headway_secs: -1

              },
              id: route.id
            })
        }
      }
      return Array.from(features.values())
    },
    stopFeatures () {
      const features = []
      for (const g of this.stops || []) {
        features.push({
          type: 'Feature',
          geometry: g.geometry,
          properties: { stop_id: g.stop_id, stop_name: g.stop_name },
          id: g.id
        })
      }
      return features
    },
    currentPoint () {
      return {
        type: 'Point',
        coordinates: this.searchCoords
      }
    },
    filteredStops () {
      return this.stops.filter((s) => {
        return s.departures.length > 0
      }).sort((a, b) => {
        const ad = this.haversine(this.currentPoint, a.geometry)
        const bd = this.haversine(this.currentPoint, b.geometry)
        return ad - bd
      })
    },
    filteredStopsGroupRoutes () {
      // group routes by agency
      const agencyGroups = {}
      const seenRoutes = {}
      for (const stop of this.filteredStops) {
        for (const d of stop.departures) {
          d.stop = stop
          const agencyKey = d.trip.route.agency.agency_name // d.trip.route.agency.id
          const routeKey = `${d.trip.route.route_short_name}:${d.trip.route.route_long_name}:${d.trip.trip_headsign}`
          if (seenRoutes[routeKey]) {
            continue
          }
          const a = agencyGroups[agencyKey] || { agency: d.trip.route.agency, routes: {} }
          const r = a.routes[routeKey] || { route: d.trip.route, trip_headsign: d.trip.trip_headsign, id: routeKey, departures: [] }
          r.departures.push(d)
          a.routes[routeKey] = r
          agencyGroups[agencyKey] = a
        }
        for (const d of stop.departures) {
          const routeKey = `${d.trip.route.route_short_name}:${d.trip.route.route_long_name}:${d.trip.trip_headsign}`
          seenRoutes[routeKey] = true
        }
      }
      const ret = []
      for (const agencyGroup of Object.values(agencyGroups)) {
        const routes = Object.values(agencyGroup.routes).sort((a, b) => {
          const aa = a.departures[0].departure.estimated || a.departures[0].departure.scheduled
          const bb = b.departures[0].departure.estimated || b.departures[0].departure.scheduled
          if (aa > bb) {
            return 1
          }
          if (aa < bb) {
            return -1
          }
          return 0
        })
        ret.push({
          agency: agencyGroup.agency,
          routes
        })
      }
      // order by nunber of departures
      ret.sort((a, b) => {
        let aa = 0
        for (const r of a.routes) {
          aa += r.departures.length
        }
        let bb = 0
        for (const r of b.routes) {
          bb += r.departures.length
        }
        if (aa < bb) {
          return 1
        }
        if (aa > bb) {
          return -1
        }
        return 0
      })
      return ret
    }
  },
  watch: {
    autoRefresh (v) {
      // Helper to restart interval
      if (v) {
        this.refetch()
      }
    }
  },
  mounted () {
    // Force redraw
    setInterval(() => {
      this.lastFetchedDisplayKey += 1
    }, 1000)
  },
  methods: {
    startTimer () {
      this.timer = setInterval(() => {
        if (this.autoRefresh) {
          this.refetch()
        }
      }, this.autoRefreshInterval * 1000)
    },
    resetTimer () {
      window.clearInterval(this.timer)
      this.startTimer()
    },
    refetch () {
      this.$apollo.queries.departureQuery.refetch()
    },
    expandRoutesPerAgency () {
      this.routesPerAgencyShadow = 1000
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
  }
}
</script>

<style scoped>
.search-options {
  padding-top:10px
}

.tag {
  margin-right:5px;
}
.route-icon-departures {
  margin:0px;
  padding:0px;
  width: 260px;
  padding-top:14px;
}
.route-icon-fade-out {
  width:250px;
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 90%, rgba(0,0,0,0));
}

.last-fetched {
  padding-top:10px;
  font-size:0.75rem;
}
</style>
