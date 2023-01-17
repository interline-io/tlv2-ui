<template>
  <div>
    <b-field grouped expanded class="controls-group">
      <b-field label="Trip pattern" class="pr-3">
        <b-select
          v-model="selectedPattern"
          placeholder="Select a trip pattern"
          class="trip-select mr-4"
        >
          <option v-for="pattern of processedPatterns" :key="pattern.stop_pattern_id" :value="pattern.stop_pattern_id">
            {{ pattern.desc }}
          </option>
        </b-select>
        <b-checkbox
          v-model="shadowIncludeNearbyStops"
          class="adjust-checkbox"
        >
          Show transfers
        </b-checkbox>
      </b-field>
      <b-field v-if="showTransferRadius" label="Transfer search radius (m)" expanded>
        <b-slider
          v-model="radius"
          class="radius-select"
          size="medium"
          :min="0"
          :max="500"
          :step="100"
          ticks
          lazy
        >
          <template v-for="val in [0,100,250,500]" :key="val">
            <b-slider-tick :value="val">
              {{ val }}
            </b-slider-tick>
          </template>
        </b-slider>
      </b-field>
    </b-field>

    <tl-loading v-if="$apollo.loading" />
    <tl-error v-else-if="error">{{ error }}</tl-error>
    <div v-else-if="processedPatterns.length === 0">
      No trip patterns were found for this route.
    </div>
    <ul v-else-if="activePattern" class="stop-list">
      <li v-for="(st) of activePattern.stop_times" :key="st.stop_sequence">
        <p class="route-stop-name">
          <nuxt-link
            :to="{name:'stops-onestop_id', params:{onestop_id:st.stop.onestop_id}}"
          >
            {{ st.stop.stop_name }}
          </nuxt-link>
        </p>
        <div v-if="shadowIncludeNearbyStops">
          <div
            v-for="(rss,agency) of st.stop.routes"
            :key="agency"
            class="route-link"
          >
            <div v-if="multiAgency" class="agency-name">
              {{ agency }}
            </div>
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
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import haversine from 'haversine'
import gql from 'graphql-tag'
const q = gql`
query ($route_ids: [Int!]!, $radius:Float!, $include_nearby_stops:Boolean!) {
  routes(ids: $route_ids) {
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
        direction_id
        stop_times  {
          stop_sequence
          stop {
            id
            onestop_id
            stop_id
            stop_name
            location_type
            geometry
            nearby_stops(radius: $radius, limit: 1000) @include(if: $include_nearby_stops) {
              id
              onestop_id
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
    routeIds: {
      type: Array,
      required: true
    },
    showTransferRadius: {
      type: Boolean
    },
    includeNearbyStops: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      routes: [],
      selectedPattern: null,
      shadowIncludeNearbyStops: this.includeNearbyStops,
      radius: 100,
      error: null
    }
  },
  apollo: {
    routes: {
      client: 'transitland',
      query: q,
      error (e) { this.error = e },
      variables () {
        return {
          route_ids: this.routeIds,
          radius: this.radius,
          include_nearby_stops: this.shadowIncludeNearbyStops
        }
      }
    }
  },
  computed: {
    // Attempt to draw a multiple sequent alignment, e.g. MBTA website
    // alignments () {
    //   const stops = {}
    //   const parents = {}
    //   const children = {}
    //   for (const pat of this.patterns) {
    //     const count = pat.count
    //     const sts = pat.trips[0].stop_times
    //     for (const st of sts) {
    //       stops[st.stop.id] = st.stop
    //     }
    //     for (let i = 0; i < sts.length - 2; i++) {
    //       const pid = sts[i].stop.id
    //       const sid = sts[i + 1].stop.id
    //       children[pid] = (children[pid] || {})
    //       children[sid] = (children[sid] || {})
    //       children[pid][sid] = (children[pid][sid] || 0) + count
    //       parents[pid] = (parents[pid] || {})
    //       parents[sid] = (parents[sid] || {})
    //       parents[sid][pid] = (parents[sid][pid] || 0) + count
    //     }
    //   }
    //   // Attach roots to 0
    //   children[0] = {}
    //   let i = 0
    //   for (const [k, v] of Object.entries(parents)) {
    //     if (Object.keys(v).length === 0) {
    //       children[0][k] = i
    //       i += 1
    //     }
    //   }
    //   return {
    //     children
    //   }
    // },
    patterns () {
      const pats = []
      for (const route of this.routes) {
        for (const pat of route.patterns) {
          if (pat.trips && pat.trips.length > 0) {
            pats.push(pat)
          }
        }
      }
      return pats
    },
    activePattern () {
      for (const pat of this.processedPatterns) {
        if (pat.stop_pattern_id === this.selectedPattern) {
          return pat
        }
      }
      if (this.processedPatterns.length > 0) {
        return this.processedPatterns[0]
      }
      return null
    },
    multiAgency () {
      const a = new Set()
      for (const pat of this.patterns) {
        for (const st of pat.trips[0].stop_times) {
          for (const ns of st.stop.nearby_stops) {
            for (const rs of ns.route_stops) {
              a.add(rs.route.agency.agency_name)
            }
          }
        }
      }
      return a.size > 1
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
        if (!pat.trips || pat.trips.length === 0 || !pat.trips[0].stop_times) {
          continue
        }
        const pt = pat.trips[0]
        const dirDesc = pt.direction_id === 0 ? 'Inbound' : 'Outbound'
        const p = {
          stop_pattern_id: pat.stop_pattern_id,
          count: pat.count,
          desc: `${pt.trip_headsign} (${dirDesc})`,
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
              onestop_id: st.stop.onestop_id,
              routes: routesByAgency
            }
          })
        }
        ret.push(p)
      }
      ret.sort((a, b) => { return b.count - a.count })
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
      for (const route of this.routes) {
        rids.add(route.onestop_id)
      }
      const ret = []
      for (const ns of (stop.nearby_stops || [])) {
        const stopDist = hsin(stop.geometry, ns.geometry)
        if (ns.location_type !== 0) {
          continue
        }
        for (const rs of ns.route_stops || []) {
          const routeKey = rs.route.onestop_id
          if (routeKey && rids.has(routeKey)) {
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
  background-image: url( '~/svg/route-middle-1.svg' ) ;
  background-repeat: no-repeat;
  background-size:20px 4000px;
  background-position:0px -18px;
}
.stop-list li:first-child {
  background-image: url( '~/svg/route-start.svg' ) ;
  background-repeat: no-repeat;
  background-size:20px 4000px;
  background-position:0px 10px;
}
.stop-list li:last-child {
  background-image: url( '~/svg/route-end.svg' ) ;
  background-repeat: no-repeat;
  background-size:20px 100px;
  background-position:0px -18px;
}
.route-stop-name {
  font-weight:bold;
  margin-bottom:10px;
}
.agency-name {
  margin:0px;
  margin-top:10px;
  margin-bottom:10px;
}
.adjust-checkbox {
}
.trip-select {
  min-width:400px;
  width:400px;
}
.radius-select {
  width:200px;
}
</style>
