<template>
  <client-only>
    <div class="tl-map">
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
        @set-zoom="setZoom"
        @set-agency-features="setAgencyFeatures"
        @map-click="mapClick"
        @map-move="mapMove"
      />
      <div class="tl-map-panel tl-map-panel-tabs">
        <o-tabs v-model="activeTab" class="tl-tabs block" position="centered" type="boxed">
          <o-tab-item id="routes" label="Routes">
            <tl-map-route-list
              v-if="activeTab === 1"
              :current-zoom="currentZoom"
              :agency-features="agencyFeatures"
              :is-component-modal-active="isComponentModalActive"
              @close="isComponentModalActive = false"
            />
            <p v-if="Object.keys(agencyFeatures).length == 0" class="content block is-small pt-2">
              <a href="https://www.transit.land/documentation/vector-tiles" target="_blank">Learn more about Transitland v2 Vector Tiles</a>
            </p>
          </o-tab-item>
          <o-tab-item id="departures" label="Departures">
            <tl-map-search
              :zoom="currentZoom"
              :bbox="currentBbox"
              @set-geolocation="setGeolocation"
            />
            <tl-stop-departures
              v-if="activeTab === 2"
              :show-auto-refresh="true"
              :show-fallback-selector="true"
              :show-radius-selector="true"
              :search-coords="searchCoords"
            />
            <p class="content block is-small pt-2">
              <a href="https://www.transit.land/documentation/rest-api/departures" target="_blank">Learn more about Transitland v2 REST API stop departures endpoint</a>
            </p>
          </o-tab-item>
          <o-tab-item id="options" label="Options">
            <div class="field">
              <o-checkbox
                v-model="showGeneratedGeometries"
              >
                Show stop-to-stop geometries
              </o-checkbox>
            </div>
            <div class="field">
              <o-checkbox
                v-model="showProblematicGeometries"
              >
                Show problematic geometries
              </o-checkbox>
            </div>
          </o-tab-item>
        </o-tabs>
      </div>
    </div>
  </client-only>
</template>

<script>
export default {
  data () {
    return {
      activeTab: 1,
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
        url: `${this.$config.public.apiBase}/tiles/routes/tiles/{z}/{x}/{y}.pbf`,
        minzoom: 0,
        maxzoom: 14
      },
      stopTiles: {
        id: 'stops',
        url: `${this.$config.public.apiBase}/tiles/stops/tiles/{z}/{x}/{y}.pbf`,
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
      if (this.activeTab === 2) {
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

<style>
.tl-map {
  position: relative;
}

.tl-map-panel {
    user-select: none;
    position: absolute !important;
    margin: 0px;
    padding: 10px;
    top: 10px;
    left: 10px;
    max-width:90vw;
    /* width: 565px; */
}

.tl-map-panel-tabs {
    background: rgba(255, 255, 255, 0.0) !important;
}

.tl-map-panel-tabs div[role=tab] a {
    margin-right: 5px;
}

.tl-map-panel-tabs div[role=tab] a {
    background-color: rgba(235, 235, 235, 0.9) !important;
}

.tl-map-panel-tabs div[role=tab][aria-selected=true] a {
    background-color: rgba(255, 255, 255, 0.9) !important;
}

.tl-map-panel-tabs .tab-content {
    background-color: rgba(255, 255, 255, 0.9);
    margin: 0px;
    padding-left: 10px;
    padding-right: 10px;
    max-height:80vh;
    min-width:330px;
    max-width:80vw;
    overflow-y:auto;
}

.tl-map-panel .dropdown-content{
    position: fixed;
    max-width:80%;
}
</style>
