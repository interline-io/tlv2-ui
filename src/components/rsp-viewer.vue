<template>
  <div>
    <div v-if="$apollo.loading">
      Loading...
    </div><div v-else>
      <b-tabs type="is-toggle">
        <b-tab-item v-for="pattern of patterns" :key="pattern.stop_pattern_id" :label="`${pattern.trips[0].trip_headsign} (${pattern.count} trips)`">
          <ul>
            <li v-for="st of pattern.trips[0].stop_times" :key="st.stop_sequence">
              <p>{{ st.stop.stop_name }}</p>
              <b-taglist>
                <b-tag v-for="rs of nearbyRouteStops(st.stop)" :key="rs.id" type="is-light" size="is-small">
                  <b-icon v-if="rs.distance > 50" icon="walk" size="is-small" />
                  {{ rs.route_long_name }}
                </b-tag>
              </b-taglist>
            </li>
          </ul>
        </b-tab-item>
      </b-tabs>
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
      routes: []
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
    }
  },
  methods: {
    nearbyRouteStops (stop) {
      const rids = new Set()
      if (this.routes && this.routes.length > 0) {
        const thisRouteKey = `${this.routes[0].route_short_name}${this.routes[0].route_long_name}`
        console.log('thisroutekey:', thisRouteKey)
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
            route_short_name: rs.route.route_short_name,
            route_long_name: rs.route.route_long_name
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
</style>
