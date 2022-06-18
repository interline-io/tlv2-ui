<template>
  <div>
    <b-field grouped>
      <b-autocomplete
        expanded
        placeholder="Search stops. Example: 55657"
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
query($search: String!) {
  stops(limit: 100, where:{search:$search}) {
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

export default {
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
    }
  },
  data () {
    return {
      search: '',
      minSearchLength: 4,
      useGeolocation: false,
      stopSearch: []
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
