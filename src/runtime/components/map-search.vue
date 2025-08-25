<template>
  <div>
    <o-field grouped expanded>
      <o-field expanded>
        <o-autocomplete
          class="tl-map-search-autocomplete"
          expanded
          placeholder="Search stops. Example: Penn Station"
          group-field="type"
          group-options="items"
          :data="searchFiltered"
          :clearable="true"
          icon="magnify"
          @typing="typing"
          @select="option => setLocation(option.geometry.coordinates)"
        >
          <template #default="props">
            {{ props.option.name }}
            <span v-if="props.option.agencyName" class="tag">{{ props.option.agencyName }}</span>
            <div v-for="rs of props.option.routeStops || []" :key="rs.route.id" class="clearfix tag">
              {{ rs.route.agency.agency_name }} :{{ rs.route.route_short_name }}
            </div>
          </template>
        </o-autocomplete>
      </o-field>
      <o-field>
        <tl-geolocation @set-location="setLocation" />
      </o-field>
    </o-field>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'

const searchQuery = gql`
query($stopFilter: StopFilter, $routeFilter: RouteFilter, $includeStops: Boolean=false, $includeRoutes: Boolean=false) {
  routes(limit: 10, where:$routeFilter) @include(if: $includeRoutes) {
    id
    route_short_name
    route_long_name
    route_stops(limit:1) {
      stop {
        id
        geometry
      }
    }
    agency {
      id
      agency_name
    }
  }
  stops(limit: 10, where:$stopFilter) @include(if: $includeStops) {
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

export default {
  apollo: {
    boundedQuery: {
      query: searchQuery,
      skip () {
        return this.search.length < this.minSearchLength || !this.bboxPolygon
      },
      variables () {
        return {
          includeStops: this.includeStops,
          includeRoutes: this.includeRoutes,
          routeFilter: {
            search: this.search,
            within: this.bboxPolygon
          },
          stopFilter: {
            search: this.search,
            within: this.bboxPolygon
          }
        }
      },
      update (data) {
        this.boundedStops = data.stops || []
        this.boundedRoutes = data.routes || []
      }
    },
    unboundedQuery: {
      query: searchQuery,
      skip () {
        return this.search.length < this.minSearchLength
      },
      variables () {
        return {
          includeStops: this.includeStops,
          includeRoutes: this.includeRoutes,
          routeFilter: {
            search: this.search
          },
          stopFilter: {
            search: this.search
          }
        }
      },
      update (data) {
        this.unboundedStops = data.stops || []
        this.unboundedRoutes = data.routes || []
      }
    }
  },
  props: {
    bbox: { type: Array, default () { return null } },
    includeStops: { type: Boolean, default () { return false } },
    includeRoutes: { type: Boolean, default () { return false } }
  },
  emits: ['setLocation'],
  data () {
    return {
      search: '',
      error: null,
      minSearchLength: 4,
      coords: null,
      boundedStops: [],
      unboundedStops: [],
      boundedRoutes: [],
      unboundedRoutes: []
    }
  },
  computed: {
    searchFiltered () {
      const stops = []
      const boundedStops = {}
      for (const stop of this.boundedStops) {
        boundedStops[stop.id] = true
        const agencyName = (stop.route_stops.length > 0) ? stop.route_stops[0].route.agency.agency_name : ''
        stops.push({ name: stop.stop_name, routeStops: stop.route_stops, agencyName, geometry: stop.geometry })
      }
      for (const stop of this.unboundedStops) {
        if (!boundedStops[stop.id]) {
          const agencyName = (stop.route_stops.length > 0) ? stop.route_stops[0].route.agency.agency_name : ''
          stops.push({ name: stop.stop_name, routeStops: stop.route_stops, agencyName, geometry: stop.geometry })
        }
      }

      const routes = []
      const boundedRoutes = {}
      for (const route of this.boundedRoutes) {
        boundedRoutes[route.id] = true
        const geometry = (route.route_stops.length > 0) ? route.route_stops[0].stop.geometry : null
        const routeName = route.route_short_name || route.route_long_name || 'Unnamed Route'
        routes.push({ name: routeName, agencyName: route.agency.agency_name, geometry })
      }
      for (const route of this.unboundedRoutes) {
        if (!boundedRoutes[route.id]) {
          const geometry = (route.route_stops.length > 0) ? route.route_stops[0].stop.geometry : null
          const routeName = route.route_short_name || route.route_long_name || 'Unnamed Route'
          routes.push({ name: routeName, agencyName: route.agency.agency_name, geometry })
        }
      }
      console.log('routes:', routes)

      const ret = []
      if (this.includeRoutes > 0) {
        ret.push({ type: 'Routes', items: routes })
      }
      if (this.includeStops > 0) {
        ret.push({ type: 'Stops', items: stops })
      }
      return ret
    },
    bboxPolygon () {
      if (!this.bbox) { return null }
      const sw = this.bbox[0]
      const ne = this.bbox[1]
      const coords = [[
        [sw[0], sw[1]],
        [ne[0], sw[1]],
        [ne[0], ne[1]],
        [sw[0], ne[1]],
        [sw[0], sw[1]]
      ]]
      return { type: 'Polygon', coordinates: coords }
    }
  },
  methods: {
    setLocation (coords) {
      this.$emit('setLocation', coords)
    },
    typing (val) {
      if (val.length >= this.minSearchLength) {
        this.search = val
      }
    }
  }
}
</script>
