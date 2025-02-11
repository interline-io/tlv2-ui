<template>
  <div>
    <tl-msg-error v-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else-if="!searchCoords && stopIds.length === 0">
      <h6 class="title is-6">
        Click on the map to select a location
      </h6>
    </div>

    <div v-else>
      <div class="search-options mb-2">
        <o-field grouped>
          <o-field v-if="showDateSelector">
            <o-datetimepicker
              v-model="displayStartDate"
              horizontal-time-picker
              placeholder="Now"
              icon="calendar-today"
              trap-focus
              size="small"
            />
          </o-field>

          <o-field v-if="showRadiusSelector">
            <o-select v-model="radius" size="small">
              <option v-for="r of allowedRadius" :key="r" :value="r">
                {{ r }}m
              </option>
            </o-select>
            <p class="control button-like-small">
              Radius
            </p>
          </o-field>

          <o-checkbox v-if="showAutoRefresh" v-model="autoRefresh" size="small">
            Auto-refresh
          </o-checkbox>

          <o-checkbox v-if="showFallbackSelector" v-model="useServiceWindow" size="small">
            Fallback service day
          </o-checkbox>
        </o-field>
        <div v-if="lastFetched" :key="lastFetchedDisplayKey" class="tags has-addons">
          <span class="tag is-small">Last checked</span>
          <span class="tag is-success is-small">{{ $filters.fromNowDate(lastFetched) }}</span>
        </div>
      </div>

      <tl-loading v-if="$apollo.loading" />

      <div v-else-if="!coordsOrStops">
        <h6 class="title is-6">
          Click the map to set a departure location
        </h6>
      </div>

      <div v-else-if="filteredStopsGroupRoutes.length === 0">
        <h6 class="title is-6">
          No results
        </h6>
        <p>Unfortunately, no departures were found at this location for the selected location and time.</p>
        <p>Try increasing the search radius or selecting the "fallback service day" option.</p>
      </div>

      <div v-for="(ss, sskey) of filteredStopsGroupRoutes" :key="sskey">
        <h6 class="title is-6">
          {{ ss.agency.agency_name }}
        </h6>
        <div v-for="(sr,srkey) of ss.routes.slice(0,routesPerAgencyShadow)" :key="srkey" class="tl-departure-container">
          <div
            class="tl-departure-route"
          >
            <nuxt-link
              :to="$filters.makeRouteLink(sr.route.onestop_id, sr.route.feed_onestop_id, sr.route.feed_version_sha1, sr.route.route_id, sr.route.id, false)"
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
          <div class="tl-departure-times">
            <span v-for="st of sr.departures.slice(0,3)" :key="st.trip.id" class="tl-departure-time tag">
              <template v-if="st.departure.estimated">
                {{ $filters.reformatHMS(st.departure.estimated) }} &nbsp;<o-icon variant="success" size="small" icon="wifi" />
              </template><template v-else>
                {{ $filters.reformatHMS(st.departure.scheduled) }} &nbsp;<o-icon variant="success" size="small" icon="blank" />
              </template>
            </span>
          </div>
        </div>
        <div v-if="ss.routes.length > routesPerAgencyShadow" class="is-clearfix">
          <span class="button small ml-5" @click="expandRoutesPerAgency">Click to show {{ ss.routes.length - routesPerAgencyShadow }} additional rows</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import haversine from 'haversine'
import { gql } from 'graphql-tag'

const query = gql`
query( $stopIds: [Int!], $where: StopFilter, $stwhere: StopTimeFilter, $includeGeometry: Boolean! = false) {
  stops(where: $where, ids: $stopIds) {
    id
    onestop_id
    stop_id
    stop_name
    stop_code
    location_type
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
        feed_onestop_id
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
        direction_id
        route {
            id
            route_id
            onestop_id
            route_short_name
            route_long_name
            route_color
            route_text_color
            route_type
            route_url
            feed_onestop_id
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
  layout: 'map',
  props: {
    searchCoords: { type: Array, default () { return null } },
    searchRadius: { type: Number, default () { return 200 } },
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
      skip () { return !this.coordsOrStops },
      variables () {
        const q = {
          stwhere: {
            use_service_window: this.useServiceWindow,
            next: this.nextSeconds
          }
        }
        if (this.stopIds.length > 0) {
          q.stopIds = this.stopIds
        } else if (this.searchCoords && this.radius > 0) {
          q.where = {
            near: {
              lon: this.searchCoords[0],
              lat: this.searchCoords[1],
              radius: this.radius
            }
          }
        }
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
      radius: this.searchRadius
    }
  },
  computed: {
    coordsOrStops() {
      return (this.searchCoords?.length === 2 || this.stopIds.length > 0)
    },
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
        return s.departures.length > 0 && s.location_type === 0 && s.geometry.coordinates
      }).sort((a, b) => {
        const ad = this.haversine(this.currentPoint, a.geometry)
        const bd = this.haversine(this.currentPoint, b.geometry)
        return ad - bd
      })
    },
    filteredStopsGroupRoutes () {
      const makeRouteKey = function (d) {
        return `${d.trip.direction_id}:${d.trip.route.route_short_name}:${d.trip.route.route_long_name}:${d.trip.trip_headsign}`
      }
      // group routes by agency
      const agencyGroups = {}
      const seenRoutes = {}
      for (const stop of this.filteredStops) {
        for (const d of stop.departures) {
          // d.stop = stop
          const agencyKey = d.trip.route.agency.agency_name // d.trip.route.agency.id
          const routeKey = makeRouteKey(d)
          if (seenRoutes[routeKey]) {
            continue
          }
          const a = agencyGroups[agencyKey] || {
            agency: d.trip.route.agency,
            routes: {}
          }
          const r = a.routes[routeKey] || {
            route: d.trip.route,
            trip_headsign: d.trip.trip_headsign,
            direction_id: d.trip.direction_id,
            id: routeKey,
            departures: []
          }
          r.departures.push(d)
          a.routes[routeKey] = r
          agencyGroups[agencyKey] = a
        }
        for (const d of stop.departures) {
          seenRoutes[makeRouteKey(d)] = true
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
    },
    searchCoords (v) {
      this.stops = []
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
      this.$apollo?.queries?.departureQuery.refetch()
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
.tl-departure-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.tl-departure-route {
  flex-grow:1;
  white-space: nowrap;
  min-width:240px;
  -webkit-mask-image: linear-gradient(to right, rgba(0,0,0,1) 90%, rgba(0,0,0,0));

}
.tl-departure-times {
  display: flex;
  flex-direction: row;
}
.tl-departure-time {
  display: flex;
  padding:6px;
  width:80px;
  margin-right:5px;
}

.search-options {
  padding-top:10px
}

.tl-route-icon-departures {
  text-align:left;
  display:inline-block;
  margin:0px;
  padding:0px;
  padding-top:5px;
  white-space: nowrap;
}

.tl-route-icon-departures .message {
  margin-right:5px;
  width:80px;
}

.tl-route-icon-departures .message .icon {
  display:inline-block;
  width:20px;
}

.tl-route-icon-fade-out {
}

.button-like {
    padding-bottom: 0.5em;
    padding-top: 0.5em;
}

.button-like-small {
    font-size: 0.75rem;
    padding-left:10px;
    padding-bottom: 0.5em;
    padding-top: 0.5em;
}
</style>
