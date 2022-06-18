<template>
  <div style="position:relative">
    <tl-map-viewer
      :key="0"
      :show-generated-geometries="showGeneratedGeometries"
      :show-problematic-geometries="showProblematicGeometries"
      :enable-scroll-zoom="true"
      :route-tiles="routeTiles"
      :stop-tiles="stopTiles"
      :zoom="initialZoom"
      :center="center"
      :hash="true"
      :marker-coords="searchCoords"
      map-class="tall"
      @setZoom="setZoom"
      @setAgencyFeatures="setAgencyFeatures"
      @mapClick="mapClick"
      @mapMove="mapMove"
    />
    <div class="map-panel map-panel-tabs">
      <b-tabs v-model="activeTab" position="is-centered" class="block" type="is-boxed">
        <b-tab-item label="Routes">
          <tl-map-route-list
            v-if="activeTab === 0"
            :current-zoom="currentZoom"
            :agency-features="agencyFeatures"
            :is-component-modal-active="isComponentModalActive"
            @close="isComponentModalActive = false"
          />
        </b-tab-item>
        <b-tab-item label="Departures">
          <tl-map-search
            :zoom="currentZoom"
            :bbox="currentBbox"
            @setGeolocation="setGeolocation"
          />
          <tl-stop-departures
            v-if="activeTab === 1"
            :show-fallback-selector="true"
            :show-radius-selector="true"
            :search-coords="searchCoords"
          />
          <div class="is-pulled-right is-clearfix learn-more">
            <a href="https://www.transit.land/documentation/rest-api/" target="_blank">Learn more about Transitland APIs</a>
          </div>
        </b-tab-item>
        <b-tab-item label="Options">
          <tl-map-options
            :show-generated-geometries="showGeneratedGeometries"
            :show-problematic-geometries="showProblematicGeometries"
            @update:showGeneratedGeometries="showGeneratedGeometries = $event"
            @update:showProblematicGeometries="showProblematicGeometries = $event"
          />
        </b-tab-item>
      </b-tabs>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      activeTab: 0,
      initialZoom: 1.5,
      currentZoom: 1.5,
      center: [-119.49, 12.66],
      isComponentModalActive: false,
      agencyFeatures: {},
      showGeneratedGeometries: true,
      showProblematicGeometries: false,
      searchCoords: null,
      currentBbox: null,
      routeTiles: {
        id: 'routes',
        url: `${this.$config.tileEndpoint}/routes/tiles/{z}/{x}/{y}.pbf`,
        minzoom: 0,
        maxzoom: 14
      },
      stopTiles: {
        id: 'stops',
        url: `${this.$config.tileEndpoint}/stops/tiles/{z}/{x}/{y}.pbf`,
        minzoom: 14,
        maxzoom: 14
      }
    }
  },
  watch: {
    activeTab () {
      // Hacky; always set modal back to empty when switching tabs
      this.isComponentModalActive = false
      this.setCoords(null)
    }
  },
  methods: {
    mapMove (e) {
      this.currentZoom = e.zoom
      this.currentBbox = e.bbox
    },
    setAgencyFeatures (e) {
      this.agencyFeatures = e
    },
    setCoords (coords) {
      this.searchCoords = coords
    },
    setZoom (v) {
      this.currentZoom = v
    },
    setGeolocation (coords) {
      this.setCoords(coords)
      this.center = coords
      this.initialZoom = 16
    },
    mapClick (e) {
      if (this.activeTab === 1) {
        this.setCoords([e.lngLat.lng, e.lngLat.lat])
      } else {
        this.setCoords(null)
      }
      if (Object.keys(this.agencyFeatures).length > 0) {
        this.isComponentModalActive = true
      }
    }
  }
}
</script>

<style scoped>
.learn-more {
  margin-top:10px;
  font-size:10pt;
}
</style>
