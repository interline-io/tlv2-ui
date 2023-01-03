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
        <template v-slot="props">
          {{ props.option.stop_name }}
          <div v-for="rs of props.option.route_stops" :key="rs.route.id" class="clearfix tag">
            {{ rs.route.agency.agency_name }} :{{ rs.route.route_short_name }}
          </div>
        </template>
      </b-autocomplete>
      <div>
        <span v-if="!locationUse" class="button" @click="watchLocation"><b-icon icon="crosshairs" /></span>
        <span v-if="locationUse && locationLoading" class="button"><b-icon icon="loading" /></span>
        <span v-else-if="locationUse && !locationLoading" class="button"><b-icon icon="crosshairs-gps" /></span>
      </div>
    </b-field>
  </div>
</template>

<script>
import { useGeolocation } from '@vueuse/core'
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
      error: null,
      minSearchLength: 4,
      locationUse: false,
      locationLoading: false,
      coords: null,
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
    coords () {
      const { error } = useGeolocation()
      this.error = error
      if (this.coords.accuracy === 0) {
        return
      }
      this.setLocation([this.coords.longitude, this.coords.latitude])
    }
  },
  methods: {
    setLocation (coords) {
      this.$emit('setGeolocation', coords)
      const { pause } = useGeolocation()
      pause()
      this.locationLoading = false
    },
    watchLocation () {
      this.locationUse = true
      this.locationLoading = true
      const { coords  } = useGeolocation()
      this.coords = coords
    },
    typing (val) {
      if (val.length >= this.minSearchLength) {
        this.search = val
      }
    }
  }
}
</script>
