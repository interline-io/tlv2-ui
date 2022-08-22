<template>
  <div>
    <div v-if="$apollo.loading">
      Loading...
    </div><div v-else>
      <b-select v-model="selectedPattern" placeholder="Select a trip pattern">
        <option v-for="pattern of processedPatterns" :key="pattern.stop_pattern_id" :value="pattern.stop_pattern_id">
          Headsign: "{{ pattern.trip.trip_headsign }}" --
          From: "{{ pattern.stop_times[0].stop.stop_name }}" To: "{{ pattern.stop_times[pattern.stop_times.length-1].stop.stop_name }}"
          ({{ pattern.count }} trips)
        </option>
      </b-select>
      <br>
      <ul class="stop-list">
        <li v-for="(st) of activePattern.stop_times" :key="st.stop_sequence">
          <p>
            {{ st.stop.stop_name }}
            <br>
          </p>
          <div
            v-for="(rss,agency) of st.stop.routes"
            :key="agency"
            class="route-link"
          >
            <h6 class="title is-6">
              {{ agency }}
            </h6>
            <div v-for="rs of rss" :key="rs.id">
              <nuxt-link
                :to="{name:'routes-onestop_id', params:{onestop_id:rs.onestop_id}}"
              >
                <tl-route-icon

                  :agency-name="rs.agency_name"
                  :route-short-name="rs.route_short_name"
                  :route-type="rs.route_type"
                  :route-long-name="rs.route_long_name"
                />
              </nuxt-link>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import haversine from 'haversine'
import gql from 'graphql-tag'
const q = gql`
query ($route_id: Int!) {
  routes(ids: [$route_id]) {
    id
    route_id
    route_short_name
    route_long_name
    onestop_id
    patterns {
      direction_id
      stop_pattern_id
      count
      trips(limit: 1) {
        id
        trip_id
        trip_headsign
        stop_times {
          stop_sequence
          stop {
            id
            stop_id
            stop_name
            location_type
            geometry
            nearby_stops(radius: 100.0, limit: 100) {
              id
              stop_id
              stop_name
              location_type
              geometry              
              route_stops {
                route {
                  id
                  route_id
                  route_short_name
                  route_long_name
                  route_type
                  onestop_id
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
      }
    }
  }
}
`

export default {
  props: {
    routeId: {
      type: Number,
      required: true
    },
    directionId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      routes: [],
      selectedPattern: null
    }
  },
  apollo: {
    routes: {
      client: 'transitland',
      query: q,
      variables () {
        return {
          route_id: this.routeId
        }
      }
    }
  },
  computed: {
    alignments () {
      const stops = {}
      const parents = {}
      const children = {}
      for (const pat of this.patterns) {
        const count = pat.count
        const sts = pat.trips[0].stop_times
        for (const st of sts) {
          stops[st.stop.id] = st.stop
        }
        for (let i = 0; i < sts.length - 2; i++) {
          const pid = sts[i].stop.id
          const sid = sts[i + 1].stop.id
          children[pid] = (children[pid] || {})
          children[sid] = (children[sid] || {})
          children[pid][sid] = (children[pid][sid] || 0) + count
          parents[pid] = (parents[pid] || {})
          parents[sid] = (parents[sid] || {})
          parents[sid][pid] = (parents[sid][pid] || 0) + count
        }
      }
      // Attach roots to 0
      children[0] = {}
      let i = 0
      for (const [k, v] of Object.entries(parents)) {
        if (Object.keys(v).length === 0) {
          children[0][k] = i
          i += 1
        }
      }
      return {
        children
      }
    },
    patterns () {
      let pats = this.routes.length > 0 ? this.routes[0].patterns : []
      pats = pats.filter((s) => { return s.trips && s.trips.length > 0 && s.direction_id === this.directionId })
      return pats
    },
    activePattern () {
      for (const pat of this.processedPatterns) {
        if (pat.stop_pattern_id === this.selectedPattern) {
          return pat
        }
      }
      return this.processedPatterns[0]
    },
    processedPatterns () {
      let totalTrips = 0
      for (const pat of this.patterns) {
        totalTrips += pat.count
      }
      const ret = []
      for (const pat of this.patterns) {
        // Exclude patterns with less than 1% of trips
        if (pat.count / totalTrips <= 0.01) {
          continue
        }
        const pt = pat.trips[0]
        const p = {
          stop_pattern_id: pat.stop_pattern_id,
          count: pat.count,
          trip: {
            trip_headsign: pt.trip_headsign
          },
          stop_times: []
        }
        for (const st of pt.stop_times) {
          const nearbyRoutes = this.nearbyRouteStops(st.stop)
          const routesByAgency = {}
          for (const rs of nearbyRoutes) {
            const a = routesByAgency[rs.agency_name] || []
            a.push(rs)
            routesByAgency[rs.agency_name] = a
          }
          p.stop_times.push({
            stop: {
              id: st.stop.id,
              stop_id: st.stop.stop_id,
              stop_name: st.stop.stop_name,
              routes: routesByAgency
            }
          })
        }
        ret.push(p)
      }
      return ret
    }
  },
  methods: {
    firstOrLast (idx, v) {
      if (idx === 0 || idx === v.length - 1) {
        return true
      }
      return false
    },
    nearbyRouteStops (stop) {
      const rids = new Set()
      if (this.routes && this.routes.length > 0) {
        const thisRouteKey = `${this.routes[0].route_short_name}${this.routes[0].route_long_name}`
        rids.add(thisRouteKey)
      }
      const ret = []
      for (const ns of (stop.nearby_stops || [])) {
        const stopDist = hsin(stop.geometry, ns.geometry)
        if (ns.location_type !== 0) {
          continue
        }
        for (const rs of ns.route_stops || []) {
          const routeKey = `${rs.route.route_short_name}${rs.route.route_long_name}`
          if (rids.has(routeKey)) {
            continue
          }
          rids.add(routeKey)
          ret.push({
            distance: stopDist,
            id: rs.route.id,
            onestop_id: rs.route.onestop_id,
            route_short_name: rs.route.route_short_name,
            route_long_name: rs.route.route_long_name,
            route_type: rs.route.route_type,
            agency_id: rs.route.agency.agency_id,
            agency_name: rs.route.agency.agency_name
          })
        }
      }
      return ret.sort((a, b) => { return a.distance - b.distance })
    }
  }
}

function hsin (fromPoint, toPoint) {
  const d = haversine({
    latitude: fromPoint.coordinates[1],
    longitude: fromPoint.coordinates[0]
  }, {
    latitude: toPoint.coordinates[1],
    longitude: toPoint.coordinates[0]
  }, { unit: 'meter' })
  return d
}

</script>

<style scoped>
.connecting-routes {
    padding-left:20px;
}
.stop-list p {
  padding-left:40px;
}
.stop-list li .route-link {
  margin-top:5px;
  margin-left:40px;
}
.stop-list li {
  margin:0px;
  padding:10px;
}
.stop-list li {
  background-image: url( '~assets/route-middle-1.svg' ) ;
  background-repeat: no-repeat;
  background-size:20px 4000px;
  background-position:0px -20px;
}
.stop-list li:first-child {
  background-image: url( '~assets/route-start.svg' ) ;
  background-repeat: no-repeat;
  background-size:20px 4000px;
  background-position:0px 10px;
}
.stop-list li:last-child {
  background-image: url( '~assets/route-end.svg' ) ;
  background-repeat: no-repeat;
  background-size:20px 100px;
  background-position:0px -18px;
}
</style>
