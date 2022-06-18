<template>
  <div>
    <b-field grouped>
      <b-autocomplete
        expanded
        placeholder="Search stops. Example: Penn Station"
        :data="stopSearch"
        max-height="800px"
        max-width="600px"
        :clearable="true"
        icon="magnify"
        @typing="typing"
        @select="option => setLocation(option.geometry.coordinates)"
      >
        <template slot-scope="props">
          {{ props.option.stop_name }}
          <div v-for="rs of props.option.route_stops" :key="rs.route.id" class="clearfix tag">
            {{ rs.route.agency.agency_name }} :{{ rs.route.route_short_name }}
          </div>
        </template>
      </b-autocomplete>
      <div>
        <span v-if="!useGeolocation" class="button" @click="watchLocation"><b-icon icon="crosshairs" /></span>
        <span v-if="useGeolocation && $geolocation.loading" class="button"><b-icon icon="loading" /></span>
        <span v-else-if="useGeolocation && !$geolocation.loading" class="button"><b-icon icon="crosshairs-gps" /></span>
      </div>
    </b-field>
  </div>
</template>

<script>
import { gql } from 'graphql-tag'

const stopSearchQuery = gql`
query($where: StopFilter!) {
  stops(limit: 10, where:$where) {
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
    boundedStopsQuery: {
      query: stopSearchQuery,
      skip () {
        return this.search.length < this.minSearchLength || !this.bboxPolygon || this.zoom < 8
      },
      variables () {
        return {
          where: {
            search: this.search,
            within: this.bboxPolygon
          }
        }
      },
      update (data) {
        this.boundedStops = data.stops
      }
    },
    unboundedStopsQuery: {
      query: stopSearchQuery,
      skip () {
        return this.search.length < this.minSearchLength
      },
      variables () {
        return {
          where: {
            search: this.search
          }
        }
      },
      update (data) {
        this.unboundedStops = data.stops
      }
    }
  },
  props: {
    bbox: { type: Array, default () { return null } },
    zoom: { type: Number, default () { return 0 } }
  },
  data () {
    return {
      search: '',
      minSearchLength: 4,
      useGeolocation: false,
      unboundedStops: [],
      boundedStops: []
    }
  },
  computed: {
    stopSearch () {
      const boundedIds = {}
      const ret = []
      for (const stop of this.boundedStops) {
        boundedIds[stop.id] = true
        ret.push(stop)
      }
      for (const stop of this.unboundedStops) {
        if (!boundedIds[stop.id]) {
          ret.push(stop)
        }
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
  watch: {
    '$geolocation.coords' () {
      this.setLocation([this.$geolocation.coords.longitude, this.$geolocation.coords.latitude])
      this.$geolocation.watch = false
    }
  },
  methods: {
    setLocation (coords) {
      this.$emit('setGeolocation', coords)
    },
    watchLocation () {
      this.useGeolocation = true
      this.$geolocation.watch = true
    },
    typing (val) {
      if (val.length >= this.minSearchLength) {
        this.search = val
      }
    }
  }
}
</script>
