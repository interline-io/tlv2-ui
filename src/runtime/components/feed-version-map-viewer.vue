<template>
  <div class="tl-map">
    <tl-loading v-if="loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <tl-map-viewer
        :enable-scroll-zoom="enableScrollZoom"
        :features="features"
        :route-features="routeFeatures"
        :stop-features="stopFeatures"
        :center="center"
        :auto-fit="autoFit"
        :zoom="zoom ? zoom : null"
        :circle-radius="circleRadius"
        :circle-color="circleColor"
        @set-agency-features="agencyFeatures = $event"
        @map-click="mapClick"
        @set-zoom="currentZoom = $event"
      />
      <div v-if="overlay" class="tl-map-panel">
        <tl-map-route-list
          :current-zoom="currentZoom"
          :link-version="linkVersion"
          :agency-features="agencyFeatures"
          :is-component-modal-active="isComponentModalActive"
          @close="isComponentModalActive = false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick } from 'vue'
import { gql } from 'graphql-tag'

const q = gql`
query ($limit: Int=100, $agency_ids: [Int!], $after:Int!=0, $route_ids: [Int!], $feed_version_sha1: String, $include_stops: Boolean! = false) {
  routes(after:$after, limit: $limit, ids: $route_ids, where: {agency_ids: $agency_ids, feed_version_sha1: $feed_version_sha1}) {
    id
    onestop_id
    feed_onestop_id
    feed_version_sha1
    route_id
    route_color
    route_desc
    route_long_name
    route_short_name
    route_type
    route_url
    geometries {
      combined_geometry
      generated
      length
      max_segment_length
    }
    headways {
      dow_category
      direction_id
      headway_secs
    }
    route_stops(limit: 1000) @include(if: $include_stops) {
      stop {
        id
        stop_id
        stop_name
        geometry
      }
    }
    agency {
      id
      agency_id
      agency_name
    }
  }
}
`

export default {
  apollo: {
    routes: {
      client: 'transitland',
      query: q,
      error (e) { this.error = e },
      variables () {
        return {
          include_stops: this.includeStops,
          feed_version_sha1: this.feedVersionSha1,
          route_ids: this.routeIds,
          agency_ids: this.agencyIds,
          limit: this.limit,
          after: 0
        }
      },
      update(data) {
        nextTick(() => {
          this.fetchMore()
        })
        return data.routes
      }
    }
  },
  props: {
    autoFit: { type: Boolean, default: true },
    limit: { type: Number, default: 1000 },
    maxLimit: { type: Number, default: 10000 },
    feedVersionSha1: { type: String, default: null },
    includeStops: { type: Boolean, default: false },
    overlay: { type: Boolean, default: false },
    fvids: { type: Array, default: null },
    routeIds: { type: Array, default: null },
    agencyIds: { type: Array, default: null },
    linkVersion: { type: Boolean, default: false },
    features: { type: Array, default () { return [] } },
    center: { type: Array, default () { return [] } },
    zoom: { type: Number, default: null },
    enableScrollZoom: { type: Boolean, default: false },
    circleRadius: { type: Number, default: 1 },
    circleColor: { type: String, default: '#f03b20' }
  },
  data () {
    return {
      loading: true,
      routes: [],
      error: null,
      isComponentModalActive: false,
      agencyFeatures: {},
      currentZoom: 0
    }
  },
  computed: {
    routeFeatures () {
      const features = []
      for (const feature of this.routes) {
        if (!feature.geometries || feature.geometries.length === 0) {
          continue
        }
        const geom = feature.geometries[0]
        let routeColor = feature.route_color
        if (routeColor && routeColor.substr(0, 1) !== '#') {
          routeColor = '#' + routeColor
        }
        const headwaySorted = (feature.headways || [])
          .filter((s) => { return s.dow_category === 1 })
          .sort((a, b) => { return a.direction_id < b.direction_id })
        const fcopy = Object.assign({}, feature, {
          geometry_length: geom.length || -1,
          generated: geom.generated,
          max_segment_length: geom.max_segment_length,
          route_color: routeColor,
          headway_secs: (headwaySorted.length > 0 ? headwaySorted[0].headway_secs : null) || -1,
          agency_name: feature.agency ? feature.agency.agency_name : null
        })
        delete fcopy.geometry
        delete fcopy.__typename
        features.push({
          id: feature.id,
          type: 'Feature',
          properties: fcopy,
          geometry: geom.combined_geometry
        })
      }
      return features
    },
    stopFeatures () {
      const features = []
      for (const feature of this.routes) {
        for (const g of feature.route_stops || []) {
          const fcopy = Object.assign({}, g.stop)
          delete fcopy.geometry
          delete fcopy.__typename
          features.push({
            type: 'Feature',
            geometry: g.stop.geometry,
            properties: fcopy,
            id: g.stop.id
          })
        }
      }
      return features
    }
  },
  watch: {
    routeFeatures (v) {
      this.$emit('setRouteFeatures', v)
    },
    stopFeatures (v) {
      this.$emit('setSopFeatures', v)
    }
  },
  methods: {
    fetchMore() {
      if (this.routes.length > this.maxLimit) {
        this.loading = false
        return
      }
      if (!this.loading) {
        return
      }
      const lastId = this.routes.length > 0 ? this.routes[this.routes.length - 1].id : 0
      this.$apollo.queries.routes.fetchMore({
        variables: {
          after: lastId,
          limit: this.limit
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const cur = [...previousResult.routes, ...fetchMoreResult.routes]
          if (fetchMoreResult.routes.length < this.limit) {
            this.loading = false
          }
          return {
            routes: cur
          }
        }
      })
    },
    mapClick () {
      if (Object.keys(this.agencyFeatures).length > 0) {
        this.isComponentModalActive = true
      }
    }
  }
}
</script>

<style>
.tl-map {
  position:relative
}
.tl-map-panel {
    background-color: white;
    user-select: none;
    position: absolute !important;
    margin: 0px;
    padding: 10px;
    top: 10px;
    left: 10px;
    width: 565px;
}
.tl-map-panel-tabs .tab-content {
    background-color: rgba(255, 255, 255, 0.9);
    margin: 0px;
    padding-left: 10px;
    padding-right: 10px;
    max-height:80vh;
    overflow-y:auto;
}
</style>
